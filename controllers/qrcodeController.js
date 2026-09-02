const QRCode = require('qrcode');
const model = require('../models/qrcodeModel');

async function list(req, res, next) {
  try {
    const items = model.getAll();
    res.json(items);
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });
    const item = model.getById(id);
    if (!item) return res.status(404).json({ error: 'QR code not found' });
    res.json(item);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { data, design } = req.body;
    if (!data || typeof data !== 'string') return res.status(400).json({ error: 'Field "data" (string) is required' });

    // Generate QR code image as data URL
    const image = await QRCode.toDataURL(data);

    const newItem = model.add({ data, design: design || 'default', image });
    res.status(201).json(newItem);
  } catch (err) {
    next(err);
  }
}

async function replace(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });
    const { data, design } = req.body;
    if (!data || typeof data !== 'string') return res.status(400).json({ error: 'Field "data" (string) is required' });

    const existing = model.getById(id);
    if (!existing) return res.status(404).json({ error: 'QR code not found' });

    const image = await QRCode.toDataURL(data);
    const updated = model.update(id, { data, design: design || existing.design, image });
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
    if (!ok) return res.status(404).json({ error: 'QR code not found' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getOne, create, replace, remove };
