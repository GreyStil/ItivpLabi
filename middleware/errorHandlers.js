const logger = require('../utils/logger');
const { renderWithLayout } = require('../utils/renderLayout');

function notFoundHandler(req, res) {
  if (req.originalUrl.startsWith('/campaigns') || req.originalUrl.startsWith('/health')) {
    return res.status(404).json({ error: 'Not Found' });
  }
  try {
    logger.logError({ message: 'Not Found' }, req);
  } catch (e) {
    /* ignore */
  }
  res.status(404);
  renderWithLayout(res, 'pages/not-found', {
    url: req.originalUrl,
    title: '404'
  });
}

function errorHandler(err, req, res, next) {
  console.error(err.stack || err);
  try {
    logger.logError(err, req);
  } catch (e) {
    console.error('logError failed', e);
  }

  if (req.originalUrl.startsWith('/campaigns') || req.originalUrl.startsWith('/health')) {
    return res.status(err.status || 500).json({
      error: err.message || 'Internal Server Error'
    });
  }

  res.status(err.status || 500);
  renderWithLayout(res, 'pages/server-error', {
    error: err,
    title: '500'
  });
}

module.exports = { notFoundHandler, errorHandler };
