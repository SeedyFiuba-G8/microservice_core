const _ = require('lodash');

module.exports = {
  express: {
    host: '0.0.0.0',
    port: _.get(process.env, 'PORT', 3002)
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
      coverPicUrl: {
        min: 1,
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
    },
    tags: {
      max: 12,
      maxTagLength: 20
    },
    reviewers: {
      max: 10
    }
  },
  fetch: {
    forwardHeaders: [],
    timeout: 10000 // ms
  },
  knex: {
    client: 'pg',
    connection: {
      connectionString: _.get(process.env, 'DATABASE_URL')
    }
  },
  logger: {
    console: {
      enabled: true,
      level: _.get(process.env, 'LOGGER_LEVEL', 'info'),
      prettyPrint: true
    },
    http: {
      enabled: true,
      level: _.get(process.env, 'LOGGER_LEVEL', 'info'),
      host: _.get(process.env, 'SUMOLOGIC_HOST'),
      path: _.get(process.env, 'SUMOLOGIC_PATH'),
      ssl: true
    }
  },
  monitoring: true,
  services: {
    sc: {
      baseUrl: _.get(process.env, 'SC_URL', 'https://sf-tdp2-sc.herokuapp.com/')
    }
  }
};
