const _ = require('lodash');

module.exports = {
  express: {
    host: '0.0.0.0',
    port: _.get(process.env, 'PORT', 3000)
  },
  /* Any value changed here should be changed in database too */
  constraints: {
    project: {
      title: {
        min: 3,
        max: 100
      },
      description: {
        min: 0,
        max: 255
      },
      type: {
        min: 0,
        max: 20
      },
      objective: {
        min: 0,
        max: 255
      },
      country: {
        min: 0,
        max: 20
      },
      city: {
        min: 0,
        max: 20
      }
    }
  },
  knex: {
    client: 'pg',
    connection: {
      connectionString: _.get(process.env, 'DATABASE_URL')
    }
  },
  log: {
    console: {
      enabled: true,
      level: 'info',
      timestamp: true,
      prettyPrint: true,
      json: false,
      colorize: true,
      stringify: false,
      label: 'microservice_users'
    }
  }
};
