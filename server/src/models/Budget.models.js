const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  category: { type: String, required: true },
  monthlyLimit: { type: Number, required: true }, // in paise, same convention as Transaction.amount
  month: { type: Number, required: true }, // 1-12
  year: { type: Number, required: true },
}, { timestamps: true });

// prevent duplicate budgets for the same user/category/month/year
budgetSchema.index({ userId: 1, category: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);