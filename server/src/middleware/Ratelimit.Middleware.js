const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per window on auth routes
  message: { success: false, message: 'Too many attempts, please try again later' },
});

module.exports = { authLimiter };