const authService = require('../services/Auth.Services.js');
const jwt = require('jsonwebtoken');
const User = require('../models/User.models.js');

const setRefreshCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  });
};

const register = async (req, res, next) => {
  try {
    const { user, accessToken, refreshToken } = await authService.register(req.body);
    setRefreshCookie(res, refreshToken);
    res.status(201).json({ user, accessToken });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { user, accessToken, refreshToken } = await authService.login(req.body);
    setRefreshCookie(res, refreshToken);
    res.status(200).json({ user, accessToken });
  } catch (err) {
    next(err);
  }
};

const refresh = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      const error = new Error('No refresh token provided');
      error.statusCode = 401;
      throw error;
    }
    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const { generateAccessToken } = require('../utils/token');
    const accessToken = generateAccessToken(payload.userId);
    res.status(200).json({ accessToken });
  } catch (err) {
    err.statusCode = 401;
    next(err);
  }
};

const logout = (req, res) => {
  res.clearCookie('refreshToken');
  res.status(200).json({ message: 'Logged out' });
};

const me = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, refresh, logout, me };