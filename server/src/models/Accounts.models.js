const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true },
    type: { type: String, enum: ['bank', 'cash', 'wallet', 'credit_card'], required: true },
    openingBalance: { type: Number, default: 0 },
    currentBalance: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Account', accountSchema);