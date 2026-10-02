/**
 * In-memory users (lab PZ). Same fields as Sequelize User in 2-lab for easy merge later.
 */
const users = [];
let nextId = 1;

function findByEmail(email) {
  return users.find((u) => u.email === email.toLowerCase()) || null;
}

function findById(id) {
  return users.find((u) => u.id === id) || null;
}

function create({ email, passwordHash, role = 'user' }) {
  const user = {
    id: nextId++,
    email: email.toLowerCase(),
    passwordHash,
    role
  };
  users.push(user);
  return user;
}

function toPublic(user) {
  if (!user) return null;
  return { id: user.id, email: user.email, role: user.role };
}

module.exports = {
  findByEmail,
  findById,
  create,
  toPublic,
  /** for tests / admin scripts */
  _all: () => users.slice()
};
