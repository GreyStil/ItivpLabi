const request = require('supertest');
const app = require('../server');

describe('Campaigns API', () => {
  let createdId;

  test('GET /campaigns -> array', async () => {
    const res = await request(app).get('/campaigns').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('POST /campaigns -> creates and returns item', async () => {
    const payload = {
      name: 'Тестовая кампания',
      channel: 'test',
      budget: 100,
      spent: 10,
      clicks: 5,
      conversions: 1,
      revenue: 50,
      status: 'active'
    };
    const res = await request(app).post('/campaigns').send(payload).expect(201);
    expect(res.body).toHaveProperty('id');
    createdId = res.body.id;
  });

  test('GET /campaigns/:id -> item', async () => {
    const res = await request(app).get(`/campaigns/${createdId}`).expect(200);
    expect(res.body).toHaveProperty('id', createdId);
  });

  test('PUT /campaigns/:id -> update item', async () => {
    const update = { name: 'Обновлённая кампания', channel: 'test', budget: 120, spent: 20, clicks: 10, conversions: 2, revenue: 80, status: 'active' };
    const res = await request(app).put(`/campaigns/${createdId}`).send(update).expect(200);
    expect(res.body).toHaveProperty('name', 'Обновлённая кампания');
  });

  test('DELETE /campaigns/:id -> remove', async () => {
    await request(app).delete(`/campaigns/${createdId}`).expect(res => {
      if (![200,204].includes(res.status)) throw new Error('Expected 200 or 204');
    });
    await request(app).get(`/campaigns/${createdId}`).expect(404);
  });
});
