const mongoose = require('mongoose');
const Transaction = require('../models/Transactions.models');

const toObjectId = (id) => new mongoose.Types.ObjectId(id);

// Summary: total income, total expense, net savings, savings rate for a date range
const getSummary = async (userId, { startDate, endDate }) => {
  const match = {
    userId: toObjectId(userId),
    type: { $in: ['income', 'expense'] }, // exclude transfers
  };
  if (startDate || endDate) {
    match.date = {};
    if (startDate) match.date.$gte = new Date(startDate);
    if (endDate) match.date.$lte = new Date(endDate);
  }

  const result = await Transaction.aggregate([
    { $match: match },
    { $group: { _id: '$type', total: { $sum: '$amount' } } },
  ]);

  const income = result.find((r) => r._id === 'income')?.total || 0;
  const expense = result.find((r) => r._id === 'expense')?.total || 0;
  const netSavings = income - expense;
  const savingsRate = income > 0 ? Number(((netSavings / income) * 100).toFixed(2)) : 0;

  return { income, expense, netSavings, savingsRate };
};

// Monthly breakdown across a year
const getMonthly = async (userId, { year }) => {
  const targetYear = year ? Number(year) : new Date().getFullYear();

  const result = await Transaction.aggregate([
    {
      $match: {
        userId: toObjectId(userId),
        type: { $in: ['income', 'expense'] },
        date: {
          $gte: new Date(`${targetYear}-01-01`),
          $lte: new Date(`${targetYear}-12-31T23:59:59`),
        },
      },
    },
    {
      $group: {
        _id: { month: { $month: '$date' }, type: '$type' },
        total: { $sum: '$amount' },
      },
    },
    { $sort: { '_id.month': 1 } },
  ]);

  // reshape into { month: 1, income: X, expense: Y } for each of 12 months
  const monthly = Array.from({ length: 12 }, (_, i) => ({ month: i + 1, income: 0, expense: 0 }));
  result.forEach((r) => {
    const m = monthly[r._id.month - 1];
    if (r._id.type === 'income') m.income = r.total;
    if (r._id.type === 'expense') m.expense = r.total;
  });

  return monthly;
};

// Category breakdown for a period
const getByCategory = async (userId, { startDate, endDate }) => {
  const match = {
    userId: toObjectId(userId),
    type: 'expense',
  };
  if (startDate || endDate) {
    match.date = {};
    if (startDate) match.date.$gte = new Date(startDate);
    if (endDate) match.date.$lte = new Date(endDate);
  }

  return Transaction.aggregate([
    { $match: match },
    { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
    { $sort: { total: -1 } },
    { $project: { _id: 0, category: '$_id', total: 1, count: 1 } },
  ]);
};

// Breakdown by account
const getByAccount = async (userId) => {
  return Transaction.aggregate([
    { $match: { userId: toObjectId(userId), type: { $in: ['income', 'expense'] } } },
    {
      $group: {
        _id: { accountId: '$accountId', type: '$type' },
        total: { $sum: '$amount' },
      },
    },
    {
      $lookup: {
        from: 'accounts', // MongoDB collection name is the lowercase plural of your model
        localField: '_id.accountId',
        foreignField: '_id',
        as: 'account',
      },
    },
    { $unwind: '$account' },
    {
      $project: {
        _id: 0,
        accountName: '$account.name',
        type: '$_id.type',
        total: 1,
      },
    },
  ]);
};

// Top merchants by spend
const getTopMerchants = async (userId, { limit = 5 }) => {
  return Transaction.aggregate([
    { $match: { userId: toObjectId(userId), type: 'expense', merchant: { $ne: null } } },
    { $group: { _id: '$merchant', total: { $sum: '$amount' }, count: { $sum: 1 } } },
    { $sort: { total: -1 } },
    { $limit: Number(limit) },
    { $project: { _id: 0, merchant: '$_id', total: 1, count: 1 } },
  ]);
};

module.exports = { getSummary, getMonthly, getByCategory, getByAccount, getTopMerchants };