const { User } = require('../models');

async function getProfile(req, res, next) {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = { getProfile };
