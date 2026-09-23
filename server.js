require('./config/loadEnv');

const express = require('express');
const { sequelize } = require('./models');
const campaignRoutes = require('./routes/campaignRoutes');

const app = express();

app.use(express.json());

app.use('/campaigns', campaignRoutes);

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Advertising campaign analytics API',
    storage: 'PostgreSQL + Sequelize',
    timestamp: new Date().toISOString()
  });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

const port = process.env.PORT || 3000;

async function start() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set. Copy .env.example to .env and add Neon connection string.');
    process.exit(1);
  }

  try {
    await sequelize.authenticate();
    console.log('Database connection established.');
  } catch (error) {
    console.error('Unable to connect to the database:', error.message);
    process.exit(1);
  }

  app.listen(port, () => console.log(`Server running on port ${port}`));
}

if (require.main === module) {
  start();
}

module.exports = app;
