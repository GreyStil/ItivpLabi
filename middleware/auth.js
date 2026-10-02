const AUTH_COOKIE = 'sim_auth';

function authSimulation(req, res, next) {
  if (req.query.auth === '1') {
    res.cookie(AUTH_COOKIE, '1', {
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: 'lax'
    });
  }

  const authenticated =
    req.cookies[AUTH_COOKIE] === '1' || req.query.auth === '1';

  req.user = authenticated
    ? { name: 'Пользователь', authenticated: true }
    : { name: 'Гость', authenticated: false };

  res.locals.user = req.user;
  next();
}

/** Имитация авторизации: без входа — редирект на /login */
function requireAuth(req, res, next) {
  if (!req.user || !req.user.authenticated) {
    return res.redirect('/login');
  }
  next();
}

module.exports = { authSimulation, requireAuth };
