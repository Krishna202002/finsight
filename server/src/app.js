const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/Auth.Routes.js');

const accountRoutes = require('./routes/Account.Routes.js');
const transactionRoutes = require('./routes/Transaction.routes.js');
const app = express();

const allowedOrigins = [
  'http://localhost:5173', // your local Vite dev server, adjust if different
  process.env.CLIENT_URL,  // your deployed frontend URL, set as an env var
];


const analyticsRoutes = require('./routes/Analytics.Routes.js');
app.use('/api/analytics', analyticsRoutes);


const importRoutes = require('./routes/Import.Routes.js');
app.use('/api/import', importRoutes);

const budgetRoutes = require('./routes/Budget.Routes.js');

app.use('/api/budgets', budgetRoutes);
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // needed since you're using cookies for refresh tokens
}));
app.use(express.json());
app.use(cookieParser());
app.use('/api/accounts', accountRoutes);
app.use('/api/transactions', transactionRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});


const smartRoutes = require('./routes/Smart.Routes.js');
app.use('/api/smart', smartRoutes);

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