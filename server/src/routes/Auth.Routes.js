const express = require('express');
const router = express.Router();
const authController = require('../controllers/Auth.Controller.js');
const { protect } = require('../middleware/Auth.Middleware.js');

const validate = require('../middleware/Validate.Middleware.js');
const { registerSchema, loginSchema } = require('../validators/Auth.Validator.js');

const { authLimiter } = require('../middleware/Ratelimit.Middleware.js');


router.post('/register',authLimiter, validate(registerSchema), authController.register);
router.post('/login',authLimiter, validate(loginSchema), authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.get('/me', protect, authController.me);

module.exports = router;