const mongoose = require('mongoose');
const Transaction = require('../models/Transactions.models.js');
const Account = require('../models/Accounts.models.js');

const create = async (userId, data) => {
  const { accountId, type, amount, category, subcategory, merchant, description, date } = data;

  // verify the account belongs to this user before touching it
  const account = await Account.findOne({ _id: accountId, userId });
  if (!account) {
    const error = new Error('Account not found');
    error.statusCode = 404;
    throw error;
  }

  const transaction = await Transaction.create({
    userId, accountId, type, amount, category, subcategory, merchant, description,
    date: date || new Date(),
    source: 'manual',
  });

  // update balance: income adds, expense subtracts
  if (type === 'income') {
    account.currentBalance += amount;
  } else if (type === 'expense') {
    account.currentBalance -= amount;
  }
  await account.save();

  return transaction;
};

const transfer = async (userId, { fromAccountId, toAccountId, amount, description, date }) => {
  if (fromAccountId === toAccountId) {
    const error = new Error('Cannot transfer to the same account');
    error.statusCode = 400;
    throw error;
  }

  const fromAccount = await Account.findOne({ _id: fromAccountId, userId });
  const toAccount = await Account.findOne({ _id: toAccountId, userId });

  if (!fromAccount || !toAccount) {
    const error = new Error('One or both accounts not found');
    error.statusCode = 404;
    throw error;
  }

  if (fromAccount.currentBalance < amount) {
    const error = new Error('Insufficient balance');
    error.statusCode = 400;
    throw error;
  }

  const transactionDate = date || new Date();

  // single transaction record with type 'transfer', linking both accounts
  const transaction = await Transaction.create({
    userId,
    accountId: fromAccountId,
    type: 'transfer',
    amount,
    transferAccountId: toAccountId,
    description,
    date: transactionDate,
    source: 'manual',
  });

  fromAccount.currentBalance -= amount;
  toAccount.currentBalance += amount;
  await fromAccount.save();
  await toAccount.save();

  return transaction;
};

const list = async (userId, query) => {
  const { page = 1, limit = 20, accountId, category, type, startDate, endDate } = query;

  const filter = { userId };
  if (accountId) filter.accountId = accountId;
  if (category) filter.category = category;
  if (type) filter.type = type;
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [transactions, total] = await Promise.all([
    Transaction.find(filter).sort({ date: -1 }).skip(skip).limit(Number(limit)),
    Transaction.countDocuments(filter),
  ]);

  return {
    transactions,
    pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
  };
};

const getById = async (userId, id) => {
  const transaction = await Transaction.findOne({ _id: id, userId });
  if (!transaction) {
    const error = new Error('Transaction not found');
    error.statusCode = 404;
    throw error;
  }
  return transaction;
};

const update = async (userId, id, updates) => {
  const transaction = await Transaction.findOneAndUpdate(
    { _id: id, userId },
    { $set: updates },
    { new: true, runValidators: true }
  );
  if (!transaction) {
    const error = new Error('Transaction not found');
    error.statusCode = 404;
    throw error;
  }
  return transaction;
};

const remove = async (userId, id) => {
  const transaction = await Transaction.findOneAndDelete({ _id: id, userId });
  if (!transaction) {
    const error = new Error('Transaction not found');
    error.statusCode = 404;
    throw error;
  }
  return transaction;
};

module.exports = { create, transfer, list, getById, update, remove };