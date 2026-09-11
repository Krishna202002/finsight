const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true, index: true },
  type: { type: String, enum: ['income', 'expense', 'transfer'], required: true },
  amount: { type: Number, required: true }, // store in paise (integer) to avoid float rounding bugs
  category: { type: String },
  subcategory: { type: String },
  merchant: { type: String },
  description: { type: String },
  date: { type: Date, required: true, default: Date.now, index: true },
  transferAccountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
  source: { type: String, enum: ['manual', 'csv', 'ai'], default: 'manual' },
  importHash: { type: String, index: true },
  isRecurring: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);