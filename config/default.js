const _ = require('lodash');

module.exports = {
  /* Any value changed here should be changed in database too */
  constraints: {
    project: {
      title: {
        min: 3,
        max: 100
      },
      description: {
        min: 1,
        max: 255
      },
      coverPicUrl: {
        min: 1,
        max: 255
      },
      type: {
        min: 1,
        max: 20
      },
      objective: {
        min: 1,
        max: 255
      }
    },
    tags: {
      max: 12,
      maxTagLength: 20
    },
    reviewers: {
      max: 10
    },
    stages: {
      max: 20,
      maxDescriptionLength: 255
    }
  },
  express: {
    host: '0.0.0.0',
    port: _.get(process.env, 'PORT', 3002)
  },
  events: {
    // Projects
    CREATE: 'Create Project',
    PUBLISH: 'Publish Project'
  },
  fetch: {
    forwardHeaders: [],
    timeout: 300000 // ms
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
    apikeys: {
      enabled: true,
      header: 'x-api-key',
      baseUrl: 'https://sf-tdp2-apikeys-main.herokuapp.com/',
      key: {
        name: 'apikeys-validation-key',
        value: _.get(process.env, 'APIKEYS_KEY', 'SeedyFiubaCore')
      }
    },
    sc: {
      baseUrl: _.get(process.env, 'SC_URL', 'https://sf-tdp2-sc.herokuapp.com/')
    }
  }
};
