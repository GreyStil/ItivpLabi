const jwt = require('jsonwebtoken');

const TOKEN_COOKIE = 'token';

/** API: Bearer JWT (как в 2-lab, шаг 3) */
function authenticate(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization token required' });
  }

  const token = header.slice('Bearer '.length);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/** Web: пользователь из httpOnly cookie с JWT */
function loadUserFromCookie(req, res, next) {
  const token = req.cookies[TOKEN_COOKIE];

  if (!token) {
    req.user = null;
    res.locals.user = {
      name: 'Гость',
      email: null,
      role: null,
      authenticated: false
    };
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    res.locals.user = {
      name: decoded.email,
      email: decoded.email,
      role: decoded.role,
      authenticated: true
    };
  } catch (err) {
    res.clearCookie(TOKEN_COOKIE);
    req.user = null;
    res.locals.user = {
      name: 'Гость',
      email: null,
      role: null,
      authenticated: false
    };
  }
  next();
}

function setAuthCookie(res, token) {
  res.cookie(TOKEN_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 1000
  });
}

function clearAuthCookie(res) {
  res.clearCookie(TOKEN_COOKIE);
}

/** Web: редирект на /login */
function requireAuth(req, res, next) {
  if (!req.user || !req.user.id) {
    return res.redirect('/login');
  }
  next();
}

module.exports = {
  authenticate,
  loadUserFromCookie,
  setAuthCookie,
  clearAuthCookie,
  requireAuth,
  TOKEN_COOKIE
};
