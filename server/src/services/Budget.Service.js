const mongoose = require('mongoose');
const Budget = require('../models/Budget.models.js');
const Transaction = require('../models/Transactions.models.js');

const toObjectId = (id) => new mongoose.Types.ObjectId(id);

const create = async (userId, data) => {
  const budget = await Budget.create({ userId, ...data });
  return budget;
};

const list = async (userId, { month, year }) => {
  const filter = { userId };
  if (month) filter.month = Number(month);
  if (year) filter.year = Number(year);
  return Budget.find(filter).sort({ category: 1 });
};

const getProgress = async (userId, { month, year }) => {
  const targetMonth = Number(month) || new Date().getMonth() + 1;
  const targetYear = Number(year) || new Date().getFullYear();

  const budgets = await Budget.find({ userId, month: targetMonth, year: targetYear });

  const startDate = new Date(targetYear, targetMonth - 1, 1);
  const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59); // day 0 of next month = last day of this month

  const spending = await Transaction.aggregate([
    {
      $match: {
        userId: toObjectId(userId),
        type: 'expense',
        date: { $gte: startDate, $lte: endDate },
      },
    },
    { $group: { _id: '$category', spent: { $sum: '$amount' } } },
  ]);

  const spendingMap = {};
  spending.forEach((s) => { spendingMap[s._id] = s.spent; });

  const daysInMonth = endDate.getDate();
  const today = new Date();
  const daysRemaining = today.getMonth() + 1 === targetMonth && today.getFullYear() === targetYear
    ? Math.max(daysInMonth - today.getDate() + 1, 1)
    : daysInMonth;

  return budgets.map((b) => {
    const spent = spendingMap[b.category] || 0;
    const remaining = b.monthlyLimit - spent;
    const percentUsed = b.monthlyLimit > 0 ? Number(((spent / b.monthlyLimit) * 100).toFixed(1)) : 0;
    const safeDailySpend = remaining > 0 ? Math.floor(remaining / daysRemaining) : 0;

    return {
      category: b.category,
      monthlyLimit: b.monthlyLimit,
      spent,
      remaining,
      percentUsed,
      safeDailySpend,
      isOverBudget: spent > b.monthlyLimit,
    };
  });
};

const update = async (userId, id, updates) => {
  const budget = await Budget.findOneAndUpdate({ _id: id, userId }, { $set: updates }, { new: true });
  if (!budget) {
    const error = new Error('Budget not found');
    error.statusCode = 404;
    throw error;
  }
  return budget;
};

const remove = async (userId, id) => {
  const budget = await Budget.findOneAndDelete({ _id: id, userId });
  if (!budget) {
    const error = new Error('Budget not found');
    error.statusCode = 404;
    throw error;
  }
  return budget;
};

module.exports = { create, list, getProgress, update, remove };