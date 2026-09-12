const analyticsService = require('../services/Analytics.Service.js');

const summary = async (req, res, next) => {
  try {
    const data = await analyticsService.getSummary(req.user.id, req.query);
    res.status(200).json(data);
  } catch (err) { next(err); }
};

const monthly = async (req, res, next) => {
  try {
    const data = await analyticsService.getMonthly(req.user.id, req.query);
    res.status(200).json({ monthly: data });
  } catch (err) { next(err); }
};

const byCategory = async (req, res, next) => {
  try {
    const data = await analyticsService.getByCategory(req.user.id, req.query);
    res.status(200).json({ categories: data });
  } catch (err) { next(err); }
};

const byAccount = async (req, res, next) => {
  try {
    const data = await analyticsService.getByAccount(req.user.id);
    res.status(200).json({ accounts: data });
  } catch (err) { next(err); }
};

const topMerchants = async (req, res, next) => {
  try {
    const data = await analyticsService.getTopMerchants(req.user.id, req.query);
    res.status(200).json({ merchants: data });
  } catch (err) { next(err); }
};

module.exports = { summary, monthly, byCategory, byAccount, topMerchants };