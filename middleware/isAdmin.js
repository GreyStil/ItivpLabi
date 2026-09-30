function isAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authorization required' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  return next();
}

module.exports = { isAdmin };
