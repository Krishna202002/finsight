const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  currency: { type: String, default: 'INR' },
}, { timestamps: true }); // adds createdAt/updatedAt automatically

module.exports = mongoose.model('User', userSchema);