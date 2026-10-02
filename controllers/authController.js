const authService = require('../services/authService');

async function register(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await authService.register({ email, password });
    return res.status(201).json({
      id: result.user.id,
      email: result.user.email,
      role: result.user.role
    });
  } catch (err) {
    return next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await authService.login({ email, password });
    return res.json({
      token: result.token,
      user: result.user
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = { register, login };
