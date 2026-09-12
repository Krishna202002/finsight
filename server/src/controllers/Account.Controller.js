const accountService = require('../services/Account.Service.js');

const createAccount = async (req, res, next) => {
  try {
    const account = await accountService.createAccount(req.user.id, req.body);
    res.status(201).json({ account });
  } catch (err) {
    next(err);
  }
};

const getAccounts = async (req, res, next) => {
  try {
    const accounts = await accountService.getAccounts(req.user.id);
    res.status(200).json({ accounts });
  } catch (err) {
    next(err);
  }
};

const updateAccount = async (req, res, next) => {
  try {
    const account = await accountService.updateAccount(req.user.id, req.params.id, req.body);
    res.status(200).json({ account });
  } catch (err) {
    next(err);
  }
};

const deleteAccount = async (req, res, next) => {
  try {
    const account = await accountService.deactivateAccount(req.user.id, req.params.id);
    res.status(200).json({ account });
  } catch (err) {
    next(err);
  }
};

module.exports = { createAccount, getAccounts, updateAccount, deleteAccount };