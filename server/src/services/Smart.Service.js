const mongoose = require('mongoose');
const Transaction = require('../models/Transactions.models.js');

const toObjectId = (id) => new mongoose.Types.ObjectId(id);

const detectRecurring = async (userId) => {
  const transactions = await Transaction.find({
    userId,
    type: 'expense',
    merchant: { $ne: '' },
  }).sort({ merchant: 1, date: 1 });

  // group by merchant
  const grouped = {};
  transactions.forEach((t) => {
    if (!grouped[t.merchant]) grouped[t.merchant] = [];
    grouped[t.merchant].push(t);
  });

  const recurring = [];

  for (const merchant in grouped) {
    const txs = grouped[merchant];
    if (txs.length < 3) continue; // need at least 3 occurrences to call it a pattern

    const gaps = [];
    for (let i = 1; i < txs.length; i++) {
      const daysDiff = (txs[i].date - txs[i - 1].date) / (1000 * 60 * 60 * 24);
      gaps.push(daysDiff);
    }

    const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;
    const gapVariance = gaps.reduce((sum, g) => sum + Math.pow(g - avgGap, 2), 0) / gaps.length;
    const gapStdDev = Math.sqrt(gapVariance);

    // consistent interval = low relative standard deviation
    const isConsistentInterval = gapStdDev < avgGap * 0.3; // within 30% variation

    const amounts = txs.map((t) => t.amount);
    const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const amountVariance = amounts.reduce((sum, a) => sum + Math.pow(a - avgAmount, 2), 0) / amounts.length;
    const amountStdDev = Math.sqrt(amountVariance);
    const isConsistentAmount = amountStdDev < avgAmount * 0.2; // within 20% variation

    if (isConsistentInterval && isConsistentAmount) {
      recurring.push({
        merchant,
        occurrences: txs.length,
        averageAmount: Math.round(avgAmount),
        averageIntervalDays: Math.round(avgGap),
        lastDate: txs[txs.length - 1].date,
        estimatedNextDate: new Date(txs[txs.length - 1].date.getTime() + avgGap * 24 * 60 * 60 * 1000),
      });
    }
  }

  return recurring;
};

const detectAnomalies = async (userId) => {
  const transactions = await Transaction.find({ userId, type: 'expense' }).sort({ date: 1 });

  // group by category for baseline stats
  const byCategory = {};
  transactions.forEach((t) => {
    if (!byCategory[t.category]) byCategory[t.category] = [];
    byCategory[t.category].push(t);
  });

  const anomalies = [];

  for (const category in byCategory) {
    const txs = byCategory[category];
    if (txs.length < 4) continue; // need enough history to trust mean/stdDev

    const amounts = txs.map((t) => t.amount);
    const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const variance = amounts.reduce((sum, a) => sum + Math.pow(a - mean, 2), 0) / amounts.length;
    const stdDev = Math.sqrt(variance);

    const threshold = mean + 2 * stdDev;

    txs.forEach((t) => {
      if (t.amount > threshold) {
        anomalies.push({
          transactionId: t._id,
          category: t.category,
          merchant: t.merchant,
          amount: t.amount,
          date: t.date,
          categoryAverage: Math.round(mean),
          threshold: Math.round(threshold),
        });
      }
    });
  }

  return anomalies.sort((a, b) => new Date(b.date) - new Date(a.date));
};

const forecastNextMonth = async (userId) => {
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);

  const monthlyTotals = await Transaction.aggregate([
    {
      $match: {
        userId: toObjectId(userId),
        type: 'expense',
        date: { $gte: sixMonthsAgo, $lte: now },
      },
    },
    {
      $group: {
        _id: { year: { $year: '$date' }, month: { $month: '$date' } },
        total: { $sum: '$amount' },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  if (monthlyTotals.length === 0) {
    return { forecast: 0, basedOnMonths: 0, message: 'Not enough data to forecast' };
  }

  // use up to the last 3 months for the moving average
  const recentMonths = monthlyTotals.slice(-3);
  const avg = recentMonths.reduce((sum, m) => sum + m.total, 0) / recentMonths.length;

  return {
    forecast: Math.round(avg),
    basedOnMonths: recentMonths.length,
    recentHistory: recentMonths.map((m) => ({
      year: m._id.year,
      month: m._id.month,
      total: m.total,
    })),
  };
};


const Budget = require('../models/Budget.models.js');

const getHealthScore = async (userId) => {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  const summary = await Transaction.aggregate([
    { $match: { userId: toObjectId(userId), type: { $in: ['income', 'expense'] }, date: { $gte: startDate, $lte: endDate } } },
    { $group: { _id: '$type', total: { $sum: '$amount' } } },
  ]);

  const income = summary.find((s) => s._id === 'income')?.total || 0;
  const expense = summary.find((s) => s._id === 'expense')?.total || 0;
  const savingsRate = income > 0 ? (income - expense) / income : 0; // 0 to 1 scale

  const budgets = await Budget.find({ userId, month, year });
  let budgetAdherence = 1; // default to perfect if no budgets set
  if (budgets.length > 0) {
    const categorySpend = await Transaction.aggregate([
      { $match: { userId: toObjectId(userId), type: 'expense', date: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: '$category', spent: { $sum: '$amount' } } },
    ]);
    const spendMap = {};
    categorySpend.forEach((c) => { spendMap[c._id] = c.spent; });

    const withinBudgetCount = budgets.filter((b) => (spendMap[b.category] || 0) <= b.monthlyLimit).length;
    budgetAdherence = withinBudgetCount / budgets.length; // 0 to 1 scale
  }

  const recurring = await detectRecurring(userId);
  const recurringTotal = recurring.reduce((sum, r) => sum + r.averageAmount, 0);
  const recurringRatio = expense > 0 ? Math.min(recurringTotal / expense, 1) : 0;
  // lower fixed-expense ratio is healthier (more flexibility) — invert it for scoring
  const flexibilityScore = 1 - recurringRatio;

  // weighted composite — you choose these weights, and can justify them in an interview
  const rawScore =
    savingsRate * 0.4 +
    budgetAdherence * 0.4 +
    flexibilityScore * 0.2;

  const score = Math.round(Math.max(0, Math.min(rawScore, 1)) * 100);

  return {
    score,
    breakdown: {
      savingsRate: Math.round(savingsRate * 100),
      budgetAdherence: Math.round(budgetAdherence * 100),
      flexibilityScore: Math.round(flexibilityScore * 100),
    },
  };
};

module.exports = { detectRecurring, detectAnomalies, forecastNextMonth, getHealthScore };