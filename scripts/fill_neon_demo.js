require('../config/loadEnv');
const { Campaign, sequelize } = require('../models');

function metrics(data) {
  const clicks = Number(data.clicks ?? 0);
  const conversions = Number(data.conversions ?? 0);
  const spent = Number(data.spent ?? 0);
  const revenue = Number(data.revenue ?? 0);

  return {
    cpc: clicks > 0 ? Number((spent / clicks).toFixed(2)) : 0,
    conversionRate: clicks > 0 ? Number(((conversions / clicks) * 100).toFixed(2)) : 0,
    roi: spent > 0 ? Number((((revenue - spent) / spent) * 100).toFixed(2)) : 0
  };
}

const demo = [
  {
    name: 'Google Search Q3',
    channel: 'search',
    budget: 1200,
    spent: 980,
    clicks: 860,
    conversions: 64,
    revenue: 2600,
    status: 'active',
    priority: 3
  },
  {
    name: 'Instagram Retargeting',
    channel: 'social',
    budget: 900,
    spent: 760,
    clicks: 640,
    conversions: 38,
    revenue: 1900,
    status: 'paused',
    priority: 2
  },
  {
    name: 'YouTube Awareness',
    channel: 'video',
    budget: 1500,
    spent: 420,
    clicks: 310,
    conversions: 22,
    revenue: 980,
    status: 'active',
    priority: 2
  },
  {
    name: 'TikTok Viral Push',
    channel: 'social',
    budget: 800,
    spent: 615,
    clicks: 1200,
    conversions: 51,
    revenue: 1450,
    status: 'active',
    priority: 1
  },
  {
    name: 'Email Newsletter Winter',
    channel: 'email',
    budget: 500,
    spent: 180,
    clicks: 95,
    conversions: 14,
    revenue: 620,
    status: 'completed',
    priority: 1
  }
];

async function main() {
  await sequelize.authenticate();
  await Campaign.destroy({ where: {}, truncate: true, restartIdentity: true, cascade: true });

  for (const item of demo) {
    await Campaign.create({ ...item, ...metrics(item) });
  }

  const rows = await Campaign.findAll({ order: [['id', 'ASC']] });
  console.log(`Inserted ${rows.length} campaigns into Neon.`);
  for (const row of rows) {
    console.log(
      `${row.id} | ${row.name} | channel=${row.channel} | priority=${row.priority} | status=${row.status}`
    );
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
