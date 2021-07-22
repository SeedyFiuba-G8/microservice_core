const _ = require('lodash');

module.exports = {
  knex: {
    connection: {
      ssl: { rejectUnauthorized: false }
    }
  },
  services: {
    sc: {
      baseUrl: _.get(process.env, 'SC_URL', 'https://sf-tdp2-sc.herokuapp.com/')
    }
  }
};
