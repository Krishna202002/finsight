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

module.exports = { detectRecurring };