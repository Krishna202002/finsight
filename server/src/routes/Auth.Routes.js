const express = require('express');
const router = express.Router();
const authController = require('../controllers/Auth.Controller.js');
const { protect } = require('../middleware/Auth.Middleware.js');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.get('/me', protect, authController.me);

module.exports = router;