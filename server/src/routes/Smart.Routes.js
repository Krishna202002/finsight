const express = require('express');
const router = express.Router();
const smartController = require('../controllers/Smart.Controller.js');
const { protect } = require('../middleware/Auth.Middleware.js');

router.use(protect);

router.get('/recurring', smartController.recurring);
router.get('/anomalies', smartController.anomalies);
router.get('/forecast', smartController.forecast);
router.get('/health-score', smartController.healthScore);

module.exports = router;