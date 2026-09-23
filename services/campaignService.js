const { Campaign } = require('../models');

function calculateMetrics(data) {
  const clicks = Number(data.clicks ?? 0);
  const conversions = Number(data.conversions ?? 0);
  const spent = Number(data.spent ?? 0);
  const revenue = Number(data.revenue ?? 0);

  const cpc = clicks > 0 ? Number((spent / clicks).toFixed(2)) : 0;
  const conversionRate = clicks > 0 ? Number(((conversions / clicks) * 100).toFixed(2)) : 0;
  const roi = spent > 0 ? Number((((revenue - spent) / spent) * 100).toFixed(2)) : 0;

  return { cpc, conversionRate, roi };
}

function toNumber(value) {
  if (value === null || value === undefined) return value;
  return Number(value);
}

function formatCampaign(row) {
  const item = row.toJSON ? row.toJSON() : row;
  return {
    ...item,
    budget: toNumber(item.budget),
    spent: toNumber(item.spent),
    revenue: toNumber(item.revenue),
    cpc: toNumber(item.cpc),
    conversionRate: toNumber(item.conversionRate),
    roi: toNumber(item.roi),
    priority: toNumber(item.priority)
  };
}

async function getAll() {
  const rows = await Campaign.findAll({ order: [['id', 'ASC']] });
  return rows.map(formatCampaign);
}

async function getById(id) {
  const row = await Campaign.findByPk(id);
  return row ? formatCampaign(row) : null;
}

async function add(item) {
  const metrics = calculateMetrics(item);
  const row = await Campaign.create({
    ...item,
    ...metrics,
    clicks: item.clicks ?? 0,
    conversions: item.conversions ?? 0,
    revenue: item.revenue ?? 0,
    status: item.status || 'active',
    priority: item.priority ?? 1
  });
  return formatCampaign(row);
}

async function update(id, data) {
  const existing = await Campaign.findByPk(id);
  if (!existing) return null;

  const merged = {
    ...existing.toJSON(),
    ...data
  };
  const metrics = calculateMetrics(merged);

  await existing.update({
    ...data,
    ...metrics
  });

  return formatCampaign(existing);
}

async function remove(id) {
  const deleted = await Campaign.destroy({ where: { id } });
  return deleted > 0;
}

module.exports = { getAll, getById, add, update, remove, calculateMetrics };
