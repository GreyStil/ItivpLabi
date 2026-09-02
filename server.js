
const express = require('express');
const app = express();
const campaignRoutes = require('./routes/campaignRoutes');

app.use(express.json());

app.use('/campaigns', campaignRoutes);

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Advertising campaign analytics API',
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
app.listen(port, () => console.log(`Server running on port ${port}`));

module.exports = app;
