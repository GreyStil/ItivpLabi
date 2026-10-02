const express = require('express');
const router = express.Router();
const model = require('../models/campaignModel');

// Home - list campaigns
router.get('/', (req, res) => {
  const { channel, status, from, to } = req.query;
  let items = model.getAll();

  if (channel) items = items.filter((c) => c.channel === channel);
  if (status) items = items.filter((c) => c.status === status);
  // date filtering omitted for brevity; campaigns have createdAt
  res.render('index', { items, filters: { channel, status, from, to } });
});

// Detail
router.get('/item/:id', (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) return res.status(400).render('404', { url: req.originalUrl });
  const item = model.getById(id);
  if (!item) return res.status(404).render('404', { url: req.originalUrl });
  res.render('item', { item });
});

// Add form
router.get('/add', (req, res) => {
  res.render('add');
});

// Handle add
router.post('/add', (req, res, next) => {
  try {
    const { name, channel, budget, spent, clicks, conversions, revenue, status } = req.body;
    const parsed = {
      name,
      channel,
      budget: Number(budget) || 0,
      spent: Number(spent) || 0,
      clicks: Number(clicks) || 0,
      conversions: Number(conversions) || 0,
      revenue: Number(revenue) || 0,
      status: status || 'active'
    };
    model.add(parsed);
    res.redirect('/');
  } catch (err) {
    next(err);
  }
});

// Simple login page (optional target for redirects)
router.get('/login', (req, res) => {
  res.render('login');
});

module.exports = router;
