const service = require('../services/campaignService');

async function list(req, res, next) {
  try {
    const campaigns = await service.getAll();
    res.json(campaigns);
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });

    const item = await service.getById(id);
    if (!item) return res.status(404).json({ error: 'Campaign not found' });

    res.json(item);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ error: 'Request body must be JSON' });
    }

    const { name, channel, budget, spent, clicks, conversions, revenue, status, priority } = req.body;

    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'Field "name" (string) is required' });
    }
    if (!channel || typeof channel !== 'string') {
      return res.status(400).json({ error: 'Field "channel" (string) is required' });
    }
    if (typeof budget !== 'number' || typeof spent !== 'number') {
      return res.status(400).json({ error: 'Fields "budget" and "spent" must be numbers' });
    }

    const newCampaign = await service.add({
      name,
      channel,
      budget,
      spent,
      clicks: clicks ?? 0,
      conversions: conversions ?? 0,
      revenue: revenue ?? 0,
      status: status || 'active',
      priority: priority ?? 1
    });

    res.status(201).json(newCampaign);
  } catch (err) {
    next(err);
  }
}

async function replace(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });

    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ error: 'Request body must be JSON' });
    }

    const { name, channel, budget, spent, clicks, conversions, revenue, status, priority } = req.body;

    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'Field "name" (string) is required' });
    }
    if (!channel || typeof channel !== 'string') {
      return res.status(400).json({ error: 'Field "channel" (string) is required' });
    }
    if (typeof budget !== 'number' || typeof spent !== 'number') {
      return res.status(400).json({ error: 'Fields "budget" and "spent" must be numbers' });
    }

    const existing = await service.getById(id);
    if (!existing) return res.status(404).json({ error: 'Campaign not found' });

    const updated = await service.update(id, {
      name,
      channel,
      budget,
      spent,
      clicks: clicks ?? existing.clicks,
      conversions: conversions ?? existing.conversions,
      revenue: revenue ?? existing.revenue,
      status: status || existing.status,
      priority: priority ?? existing.priority
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });

    const ok = await service.remove(id);
    if (!ok) return res.status(404).json({ error: 'Campaign not found' });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getOne, create, replace, remove };
