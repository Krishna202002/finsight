const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/Auth.Routes.js');

// add near the top, after app.use(express.json())
const app = express();

// add before the error handler


app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);

// Centralized error handler (must be last, and take 4 args for Express to treat it as an error handler)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

module.exports = app;