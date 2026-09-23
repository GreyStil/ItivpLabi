'use strict';

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

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const items = [
      {
        name: 'Google Search Q3',
        channel: 'search',
        budget: 1200,
        spent: 980,
        clicks: 860,
        conversions: 64,
        revenue: 2600,
        status: 'active',
        priority: 2,
        ...calculateMetrics({ spent: 980, clicks: 860, conversions: 64, revenue: 2600 }),
        createdAt: now,
        updatedAt: now
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
        priority: 1,
        ...calculateMetrics({ spent: 760, clicks: 640, conversions: 38, revenue: 1900 }),
        createdAt: now,
        updatedAt: now
      }
    ];

    await queryInterface.bulkInsert('Campaigns', items, {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('Campaigns', null, {});
  }
};
