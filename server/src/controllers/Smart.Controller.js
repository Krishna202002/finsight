const smartService = require('../services/Smart.Service.js');

const recurring = async (req, res, next) => {
  try {
    const data = await smartService.detectRecurring(req.user.id);
    res.status(200).json({ recurring: data });
  } catch (err) { next(err); }
};

const anomalies = async (req, res, next) => {
  try {
    const data = await smartService.detectAnomalies(req.user.id);
    res.status(200).json({ anomalies: data });
  } catch (err) { next(err); }
};

const forecast = async (req, res, next) => {
  try {
    const data = await smartService.forecastNextMonth(req.user.id);
    res.status(200).json(data);
  } catch (err) { next(err); }
};

const healthScore = async (req, res, next) => {
  try {
    const data = await smartService.getHealthScore(req.user.id);
    res.status(200).json(data);
  } catch (err) { next(err); }
};

module.exports = { recurring, anomalies, forecast, healthScore };