const dependable = require('dependable');
const knex = require('knex');
const path = require('path');
const YAML = require('yamljs');

function createContainer() {
  const container = dependable.container();
  const entries = [
    'app.js',
    'controllers',
    'middlewares',
    'repositories',
    'routes',
    'services',
    'utils'
  ];

  // eslint-disable-next-line prefer-arrow-callback
  container.register('apiSpecs', function $apiSpecs() {
    return YAML.load(path.join(__dirname, '../assets/api.yml'));
  });

  // eslint-disable-next-line prefer-arrow-callback
  container.register('config', function $config() {
    if (!process.env.NODE_CONFIG_DIR) {
      process.env.NODE_CONFIG_DIR = `${__dirname}/../config`;
    }

    // eslint-disable-next-line global-require
    return require('config');
  });

  // eslint-disable-next-line prefer-arrow-callback
  container.register('knex', function $knex(config) {
    return knex(config.knex);
  });

  entries.forEach((entry) => container.load(path.join(__dirname, entry)));

  return container;
}

module.exports = {
  createContainer
};
