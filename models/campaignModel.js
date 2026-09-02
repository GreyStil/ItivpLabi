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

const campaigns = [
  {
    id: 1,
    name: 'Google Search Q3',
    channel: 'search',
    budget: 1200,
    spent: 980,
    clicks: 860,
    conversions: 64,
    revenue: 2600,
    status: 'active',
    createdAt: new Date().toISOString(),
    ...calculateMetrics({ spent: 980, clicks: 860, conversions: 64, revenue: 2600 })
  },
  {
    id: 2,
    name: 'Instagram Retargeting',
    channel: 'social',
    budget: 900,
    spent: 760,
    clicks: 640,
    conversions: 38,
    revenue: 1900,
    status: 'paused',
    createdAt: new Date().toISOString(),
    ...calculateMetrics({ spent: 760, clicks: 640, conversions: 38, revenue: 1900 })
  }
];

let nextId = 3;

function getAll() {
  return campaigns;
}

function getById(id) {
  return campaigns.find((item) => item.id === id) || null;
}

function add(item) {
  const merged = {
    ...item,
    id: nextId++,
    createdAt: new Date().toISOString(),
    ...calculateMetrics(item)
  };

  campaigns.push(merged);
  return merged;
}

function update(id, data) {
  const index = campaigns.findIndex((item) => item.id === id);
  if (index === -1) return null;

  const updated = {
    ...campaigns[index],
    ...data,
    ...calculateMetrics({ ...campaigns[index], ...data }),
    updatedAt: new Date().toISOString()
  };

  campaigns[index] = updated;
  return updated;
}

function remove(id) {
  const index = campaigns.findIndex((item) => item.id === id);
  if (index === -1) return false;
  campaigns.splice(index, 1);
  return true;
}

module.exports = { getAll, getById, add, update, remove };
