const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

const SALT_ROUNDS = 10;

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
}

function validateEmailPassword(email, password) {
  if (!email || typeof email !== 'string') {
    const err = new Error('Field "email" is required');
    err.status = 400;
    throw err;
  }
  if (!password || typeof password !== 'string') {
    const err = new Error('Field "password" is required');
    err.status = 400;
    throw err;
  }
  if (password.length < 6) {
    const err = new Error('Password must be at least 6 characters');
    err.status = 400;
    throw err;
  }
}

async function register({ email, password }) {
  validateEmailPassword(email, password);

  const existing = userModel.findByEmail(email);
  if (existing) {
    const err = new Error('Email already registered');
    err.status = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = userModel.create({ email, passwordHash, role: 'user' });

  return {
    user: userModel.toPublic(user),
    token: signToken(user)
  };
}

async function login({ email, password }) {
  if (!email || !password) {
    const err = new Error('Email and password are required');
    err.status = 400;
    throw err;
  }

  const user = userModel.findByEmail(email);
  if (!user) {
    const err = new Error('Invalid email or password');
    err.status = 401;
    throw err;
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    const err = new Error('Invalid email or password');
    err.status = 401;
    throw err;
  }

  return {
    user: userModel.toPublic(user),
    token: signToken(user)
  };
}

module.exports = { register, login, signToken };
