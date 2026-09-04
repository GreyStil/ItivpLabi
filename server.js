
const express = require('express');
const app = express();
const campaignRoutes = require('./routes/campaignRoutes');
const webRoutes = require('./routes/webRoutes');

// View engine
app.set('view engine', 'ejs');
app.set('views', './views');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const logger = require('./utils/logger');

// Logging middleware — записывать в файл и в консоль
app.use((req, res, next) => {
  const now = new Date().toISOString();
  console.log(`[${now}] ${req.method} ${req.originalUrl}`);
  try { logger.logRequest(req); } catch (e) { console.error('logRequest failed', e); }
  next();
});

// Simple auth middleware: if ?auth=1 present, set user, otherwise guest
app.use((req, res, next) => {
  if (req.query && req.query.auth === '1') {
    req.user = { name: 'User' };
  } else {
    req.user = { name: 'Гость' };
  }
  res.locals.user = req.user; // make available to views
  next();
});

// API routes
app.use('/campaigns', campaignRoutes);

// Web routes (frontend)
app.use('/', webRoutes);

// Health / root (if not handled by webRoutes)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', app: 'Advertising campaign analytics API', timestamp: new Date().toISOString() });
});

// 404 handler - render page for non-API requests; return JSON for API routes
app.use((req, res, next) => {
  if (req.originalUrl.startsWith('/campaigns') || req.originalUrl.startsWith('/health')) {
    return res.status(404).json({ error: 'Not Found' });
  }
  // log 404 for web requests
  try { logger.logError({ message: 'Not Found' }, req); } catch (e) {}
  res.status(404).render('404', { url: req.originalUrl });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack || err);
  try { logger.logError(err, req); } catch (e) { console.error('logError failed', e); }
  if (req.originalUrl.startsWith('/campaigns') || req.originalUrl.startsWith('/health')) {
    return res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
  }
  res.status(err.status || 500).render('500', { error: err });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));

module.exports = app;
