const budgetService = require('../services/Budget.Service.js');

const create = async (req, res, next) => {
  try {
    const budget = await budgetService.create(req.user.id, req.body);
    res.status(201).json({ budget });
  } catch (err) { next(err); }
};

const list = async (req, res, next) => {
  try {
    const budgets = await budgetService.list(req.user.id, req.query);
    res.status(200).json({ budgets });
  } catch (err) { next(err); }
};

const progress = async (req, res, next) => {
  try {
    const data = await budgetService.getProgress(req.user.id, req.query);
    res.status(200).json({ progress: data });
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const budget = await budgetService.update(req.user.id, req.params.id, req.body);
    res.status(200).json({ budget });
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    await budgetService.remove(req.user.id, req.params.id);
    res.status(200).json({ message: 'Budget deleted' });
  } catch (err) { next(err); }
};

module.exports = { create, list, progress, update, remove };