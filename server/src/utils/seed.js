require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const connectDB = require('../config/db.js');

const User = require('../models/User.models.js');
const Account = require('../models/Accounts.models.js');
const Transaction = require('../models/Transactions.models.js');
const Budget = require('../models/Budget.models.js');

const DEMO_EMAIL = 'demo@finsight.com';
const DEMO_PASSWORD = 'demo1234';

const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
};

const seed = async () => {
  await connectDB();

  console.log('Clearing existing demo data...');
  const existingUser = await User.findOne({ email: DEMO_EMAIL });
  if (existingUser) {
    await Transaction.deleteMany({ userId: existingUser._id });
    await Account.deleteMany({ userId: existingUser._id });
    await Budget.deleteMany({ userId: existingUser._id });
    await User.deleteOne({ _id: existingUser._id });
  }

  console.log('Creating demo user...');
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const user = await User.create({
    name: 'Demo User',
    email: DEMO_EMAIL,
    passwordHash,
    currency: 'INR',
  });

  console.log('Creating accounts...');
  const bank = await Account.create({
    userId: user._id, name: 'HDFC Bank', type: 'bank',
    openingBalance: 5000000, currentBalance: 5000000, // 50,000 rupees in paise
  });
  const wallet = await Account.create({
    userId: user._id, name: 'Cash Wallet', type: 'cash',
    openingBalance: 200000, currentBalance: 200000, // 2,000 rupees
  });

  console.log('Creating transactions...');
  const transactions = [];

  // Salary income, 3 months back, recurring monthly
  for (let i = 3; i >= 1; i--) {
    transactions.push({
      userId: user._id, accountId: bank._id, type: 'income',
      amount: 6000000, category: 'salary', merchant: 'Company Inc',
      description: 'Monthly salary', date: daysAgo(i * 30), source: 'manual',
    });
  }

  // Netflix subscription, recurring, 4 occurrences ~30 days apart
  for (let i = 3; i >= 0; i--) {
    transactions.push({
      userId: user._id, accountId: bank._id, type: 'expense',
      amount: 50000, category: 'entertainment', merchant: 'Netflix',
      description: 'Monthly subscription', date: daysAgo(i * 30 + 2), source: 'manual',
    });
  }

  // Regular food expenses, similar amounts (baseline for anomaly detection)
  const foodMerchants = ['Zomato', 'Swiggy', 'Local Cafe'];
  for (let i = 0; i < 8; i++) {
    transactions.push({
      userId: user._id, accountId: wallet._id, type: 'expense',
      amount: 30000 + Math.floor(Math.random() * 20000), // 300-500 rupees
      category: 'food', merchant: foodMerchants[i % foodMerchants.length],
      description: 'Meal', date: daysAgo(i * 4), source: 'manual',
    });
  }

  // One deliberately huge food expense — should trigger anomaly detection
  transactions.push({
    userId: user._id, accountId: bank._id, type: 'expense',
    amount: 800000, category: 'food', merchant: 'Fancy Restaurant',
    description: 'Anniversary dinner', date: daysAgo(10), source: 'manual',
  });

  // Shopping expenses, varied
  transactions.push(
    { userId: user._id, accountId: bank._id, type: 'expense', amount: 250000, category: 'shopping', merchant: 'Amazon', description: 'Headphones', date: daysAgo(15), source: 'manual' },
    { userId: user._id, accountId: bank._id, type: 'expense', amount: 120000, category: 'shopping', merchant: 'Myntra', description: 'Clothes', date: daysAgo(20), source: 'manual' },
  );

  // Transfer between accounts (should NOT show up in expense analytics)
  transactions.push({
    userId: user._id, accountId: bank._id, type: 'transfer',
    transferAccountId: wallet._id, amount: 500000,
    description: 'Moving cash to wallet', date: daysAgo(12), source: 'manual',
  });

  await Transaction.insertMany(transactions);

  // Recalculate balances based on all transactions (simpler than tracking incrementally here)
  const recalculateBalance = async (account) => {
    const txs = await Transaction.find({ accountId: account._id });
    let balance = account.openingBalance;
    txs.forEach((t) => {
      if (t.type === 'income') balance += t.amount;
      if (t.type === 'expense') balance -= t.amount;
      if (t.type === 'transfer' && String(t.accountId) === String(account._id)) balance -= t.amount;
      if (t.type === 'transfer' && String(t.transferAccountId) === String(account._id)) balance += t.amount;
    });
    account.currentBalance = balance;
    await account.save();
  };
  await recalculateBalance(bank);
  await recalculateBalance(wallet);

  console.log('Creating budgets...');
  const now = new Date();
  await Budget.create([
    { userId: user._id, category: 'food', monthlyLimit: 800000, month: now.getMonth() + 1, year: now.getFullYear() },
    { userId: user._id, category: 'shopping', monthlyLimit: 500000, month: now.getMonth() + 1, year: now.getFullYear() },
    { userId: user._id, category: 'entertainment', monthlyLimit: 100000, month: now.getMonth() + 1, year: now.getFullYear() },
  ]);

  console.log('\n✅ Seed complete!');
  console.log(`Login with: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
  console.log(`Bank account: ${bank._id}`);
  console.log(`Wallet account: ${wallet._id}`);

  await mongoose.connection.close();
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});