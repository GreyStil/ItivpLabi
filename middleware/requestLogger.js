const logger = require('../utils/logger');

function requestLogger(req, res, next) {
  const now = new Date().toISOString();
  console.log(`[${now}] ${req.method} ${req.originalUrl}`);
  try {
    logger.logRequest(req, now);
  } catch (e) {
    console.error('logRequest failed', e);
  }
  next();
}

module.exports = requestLogger;
