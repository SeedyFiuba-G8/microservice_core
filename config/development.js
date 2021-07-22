const _ = require('lodash');

const PG_PASSWORD = _.get(process.env, 'PG_PASSWORD', 'postgres');
const DB_HOST = _.get(process.env, 'DB_HOST', 'localhost');
const DB_PORT = _.get(process.env, 'DB_PORT', '5432');
const DB_NAME = _.get(process.env, 'DB_NAME', 'sf_core');

module.exports = {
  knex: {
    connection: {
      connectionString: _.get(
        process.env,
        'DATABASE_URL',
        `postgres://postgres:${PG_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`
      )
    }
  },
  log: {
    console: {
      level: 'debug'
    }
  },
  services: {
    sc: {
      baseUrl: _.get(
        process.env,
        'SC_URL',
        'https://sf-tdp2-sc-dev.herokuapp.com/'
      )
    }
  }
};
