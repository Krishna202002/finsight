const transactionService = require('../services/Transaction.Service.js');

const create = async (req, res, next) => {
  try {
    const transaction = await transactionService.create(req.user.id, req.body);
    res.status(201).json({ transaction });
  } catch (err) {
    next(err);
  }
};

const transfer = async (req, res, next) => {
  try {
    const transaction = await transactionService.transfer(req.user.id, req.body);
    res.status(201).json({ transaction });
  } catch (err) {
    next(err);
  }
};

const list = async (req, res, next) => {
  try {
    const result = await transactionService.list(req.user.id, req.query);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const transaction = await transactionService.getById(req.user.id, req.params.id);
    res.status(200).json({ transaction });
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const transaction = await transactionService.update(req.user.id, req.params.id, req.body);
    res.status(200).json({ transaction });
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    await transactionService.remove(req.user.id, req.params.id);
    res.status(200).json({ message: 'Transaction deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { create, transfer, list, getById, update, remove };