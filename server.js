
const express = require('express');
const app = express();
const qrRoutes = require('./routes/qrcodeRoutes');

app.use(express.json());

// Mount routes
app.use('/qrcodes', qrRoutes);

// Health check
app.get('/', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// 404 handler for unknown routes
app.use((req, res, next) => {
  res.status(404).json({ error: 'Not Found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));

module.exports = app;
