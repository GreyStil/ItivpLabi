const qrcodes = [
  { id: 1, data: 'https://example.com', design: 'basic', createdAt: new Date().toISOString(), image: null },
  { id: 2, data: 'Hello World', design: 'fancy', createdAt: new Date().toISOString(), image: null }
];

let nextId = 3;

function getAll() {
  return qrcodes;
}

function getById(id) {
  return qrcodes.find((c) => c.id === id) || null;
}

function add(item) {
  const newItem = Object.assign({ id: nextId++, createdAt: new Date().toISOString() }, item);
  qrcodes.push(newItem);
  return newItem;
}

function update(id, data) {
  const idx = qrcodes.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  const updated = Object.assign(qrcodes[idx], data, { updatedAt: new Date().toISOString() });
  qrcodes[idx] = updated;
  return updated;
}

function remove(id) {
  const idx = qrcodes.findIndex((c) => c.id === id);
  if (idx === -1) return false;
  qrcodes.splice(idx, 1);
  return true;
}

module.exports = { getAll, getById, add, update, remove };
