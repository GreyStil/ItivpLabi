const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();

const campaignRoutes = require('./routes/campaignRoutes');
const webRoutes = require('./routes/webRoutes');
const requestLogger = require('./middleware/requestLogger');
const { authSimulation } = require('./middleware/auth');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandlers');

app.set('view engine', 'ejs');
app.set('views', './views');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use(requestLogger);
app.use(authSimulation);

app.use('/campaigns', campaignRoutes);
app.use('/', webRoutes);

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Advertising campaign analytics API',
    timestamp: new Date().toISOString()
  });
});

app.use(notFoundHandler);
app.use(errorHandler);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));

module.exports = app;
