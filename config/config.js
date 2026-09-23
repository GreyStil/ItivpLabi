require('./loadEnv');

const dialectOptions = () => {
  const url = process.env.DATABASE_URL || '';
  const useSsl =
    process.env.DATABASE_SSL === 'true' ||
    url.includes('neon.tech') ||
    url.includes('sslmode=require');

  if (!useSsl) return {};

  return {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  };
};

const base = {
  dialect: 'postgres',
  logging: false,
  dialectOptions: dialectOptions()
};

module.exports = {
  development: {
    use_env_variable: 'DATABASE_URL',
    ...base
  },
  test: {
    use_env_variable: 'DATABASE_URL',
    ...base
  },
  production: {
    use_env_variable: 'DATABASE_URL',
    ...base
  }
};
