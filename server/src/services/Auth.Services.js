const bcrypt = require('bcrypt');
const User = require('../models/User.models.js');
const { generateAccessToken, generateRefreshToken } = require('../utils/Token.Util.js');

const register = async ({ name, email, password, currency }) => {
  const existing = await User.findOne({ email });
  if (existing) {
    const error = new Error('Email already registered');
    error.statusCode = 400;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 10); // 10 = salt rounds, good default

  const user = await User.create({ name, email, passwordHash, currency });

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  return {
    user: { id: user._id, name: user.name, email: user.email, currency: user.currency },
    accessToken,
    refreshToken,
  };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email });
    console.log('User found:', user ? user.email : 'NONE');   // add this
  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
    console.log('Password match:', isMatch);   // add this

  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  return {
    user: { id: user._id, name: user.name, email: user.email, currency: user.currency },
    accessToken,
    refreshToken,
  };
};

module.exports = { register, login };