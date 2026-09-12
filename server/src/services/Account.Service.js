const Account = require('../models/Accounts.models.js');

const createAccount = async (userId, data) => {
  const account = await Account.create({
    userId,
    name: data.name,
    type: data.type,
    openingBalance: data.openingBalance || 0,
    currentBalance: data.openingBalance || 0,
  });
  return account;
};

const getAccounts = async (userId) => {
  return Account.find({ userId, isActive: true }).sort({ createdAt: -1 });
};

const updateAccount = async (userId, accountId, updates) => {
  const account = await Account.findOneAndUpdate(
    { _id: accountId, userId }, // userId in the filter — prevents editing someone else's account
    { $set: updates },
    { new: true, runValidators: true }
  );
  if (!account) {
    const error = new Error('Account not found');
    error.statusCode = 404;
    throw error;
  }
  return account;
};

const deactivateAccount = async (userId, accountId) => {
  const account = await Account.findOneAndUpdate(
    { _id: accountId, userId },
    { $set: { isActive: false } },
    { new: true }
  );
  if (!account) {
    const error = new Error('Account not found');
    error.statusCode = 404;
    throw error;
  }
  return account;
};

module.exports = { createAccount, getAccounts, updateAccount, deactivateAccount };