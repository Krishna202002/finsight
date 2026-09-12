const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/Analytics.Controller.js');
const { protect } = require('../middleware/Auth.Middleware.js');

router.use(protect);

router.get('/summary', analyticsController.summary);
router.get('/monthly', analyticsController.monthly);
router.get('/by-category', analyticsController.byCategory);
router.get('/by-account', analyticsController.byAccount);
router.get('/top-merchants', analyticsController.topMerchants);

module.exports = router;