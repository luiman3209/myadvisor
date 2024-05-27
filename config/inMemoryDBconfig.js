module.exports = {
    development: {
      username: 'root',
      password: null,
      database: 'database_development',
      host: '127.0.0.1',
      dialect: 'mysql'
    },
    test: {
      dialect: 'sqlite',
      storage: ':memory:'
    },
    production: {
      username: 'root',
      password: null,
      database: 'database_production',
      host: '127.0.0.1',
      dialect: 'mysql'
    }
  };
  