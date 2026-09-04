const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '..', 'logs');
fs.mkdirSync(logDir, { recursive: true });

const accessFile = path.join(logDir, 'access.log');
const errorFile = path.join(logDir, 'error.log');

function write(file, line) {
  fs.appendFile(file, line + '\n', (err) => {
    if (err) console.error('Logger write failed:', err);
  });
}

function safeBody(body) {
  try { return JSON.parse(JSON.stringify(body)); } catch (e) { return String(body); }
}

module.exports = {
  logRequest(req) {
    const entry = {
      ts: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl,
      ip: req.ip || req.connection && req.connection.remoteAddress,
      user: req.user && req.user.name,
      body: safeBody(req.body)
    };
    write(accessFile, JSON.stringify(entry));
  },

  logError(err, req) {
    const entry = {
      ts: new Date().toISOString(),
      error: err && err.message ? err.message : String(err),
      stack: err && err.stack ? err.stack : null,
      url: req && req.originalUrl,
      method: req && req.method,
      user: req && req.user && req.user.name
    };
    write(errorFile, JSON.stringify(entry));
  }
};
