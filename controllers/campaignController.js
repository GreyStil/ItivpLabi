const model = require('../models/campaignModel');

function list(req, res, next) {
  try {
    const campaigns = model.getAll();
    res.json(campaigns);
  } catch (err) {
    next(err);
  }
}

function getOne(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });

    const item = model.getById(id);
    if (!item) return res.status(404).json({ error: 'Campaign not found' });

    res.json(item);
  } catch (err) {
    next(err);
  }
}

function create(req, res, next) {
  try {
    const { name, channel, budget, spent, clicks, conversions, revenue, status } = req.body;

    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'Field "name" (string) is required' });
    }
    if (!channel || typeof channel !== 'string') {
      return res.status(400).json({ error: 'Field "channel" (string) is required' });
    }
    if (typeof budget !== 'number' || typeof spent !== 'number') {
      return res.status(400).json({ error: 'Fields "budget" and "spent" must be numbers' });
    }

    const newCampaign = model.add({
      name,
      channel,
      budget,
      spent,
      clicks: clicks ?? 0,
      conversions: conversions ?? 0,
      revenue: revenue ?? 0,
      status: status || 'active'
    });

    res.status(201).json(newCampaign);
  } catch (err) {
    next(err);
  }
}

function replace(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });

    const { name, channel, budget, spent, clicks, conversions, revenue, status } = req.body;

    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'Field "name" (string) is required' });
    }
    if (!channel || typeof channel !== 'string') {
      return res.status(400).json({ error: 'Field "channel" (string) is required' });
    }
    if (typeof budget !== 'number' || typeof spent !== 'number') {
      return res.status(400).json({ error: 'Fields "budget" and "spent" must be numbers' });
    }

    const existing = model.getById(id);
    if (!existing) return res.status(404).json({ error: 'Campaign not found' });

    const updated = model.update(id, {
      name,
      channel,
      budget,
      spent,
      clicks: clicks ?? existing.clicks,
      conversions: conversions ?? existing.conversions,
      revenue: revenue ?? existing.revenue,
      status: status || existing.status
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
}

function remove(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });

    const ok = model.remove(id);
    if (!ok) return res.status(404).json({ error: 'Campaign not found' });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getOne, create, replace, remove };
