/**
 * Helper: create user for testing auth/RBAC.
 * Usage: node scripts/create_admin.js email password [user|admin]
 */
require('../config/loadEnv');
const bcrypt = require('bcrypt');
const { User, sequelize } = require('../models');

async function main() {
  const email = process.argv[2];
  const password = process.argv[3];
  const role = process.argv[4] === 'admin' ? 'admin' : 'user';

  if (!email || !password) {
    console.error('Usage: node scripts/create_admin.js <email> <password> [user|admin]');
    process.exit(1);
  }

  await sequelize.authenticate();

  const passwordHash = await bcrypt.hash(password, 10);
  const [user, created] = await User.findOrCreate({
    where: { email },
    defaults: { passwordHash, role }
  });

  if (!created) {
    await user.update({ passwordHash, role });
    console.log(`Updated user (${role}):`, email);
  } else {
    console.log(`Created user (${role}):`, email);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
