require('./config/loadEnv');

const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const app = express();

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'dev-jwt-secret-change-in-production';
  console.warn('JWT_SECRET not set — using development default.');
}

const campaignRoutes = require('./routes/campaignRoutes');
const authRoutes = require('./routes/auth');
const webRoutes = require('./routes/webRoutes');
const requestLogger = require('./middleware/requestLogger');
const { loadUserFromCookie } = require('./middleware/auth');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandlers');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use(requestLogger);
app.use(loadUserFromCookie);

app.use('/auth', authRoutes);
app.use('/campaigns', campaignRoutes);
app.use('/', webRoutes);

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Advertising campaign analytics API',
    storage: 'in-memory',
    auth: 'JWT',
    timestamp: new Date().toISOString()
  });
});

app.use(notFoundHandler);
app.use(errorHandler);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));

module.exports = app;
