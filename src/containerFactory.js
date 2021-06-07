const dependable = require('dependable');
const path = require('path');
const apiComponents = require('@seedyfiuba/api_components');
const dbComponents = require('@seedyfiuba/db_components');
const errorComponents = require('@seedyfiuba/error_components');
const loggingComponents = require('@seedyfiuba/logging_components');

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
  const apiPath = path.join(__dirname, '../assets/api.yml');

  container.register(
    'apiValidatorMiddleware',
    function $apiValidatorMiddleware() {
      return apiComponents.apiValidatorMiddleware(apiPath);
    }
  );

  container.register('config', function $config() {
    if (!process.env.NODE_CONFIG_DIR) {
      process.env.NODE_CONFIG_DIR = `${__dirname}/../config`;
    }

    // eslint-disable-next-line global-require
    return require('config');
  });

  container.register('dbService', function $dbService(knex, logger) {
    return dbComponents.dbService(knex, logger);
  });

  container.register('docsRouter', function $docsRouter() {
    return apiComponents.docsRouter(apiPath);
  });

  container.register('errors', function $errors() {
    return errorComponents.errors();
  });

  container.register(
    'errorHandlerMiddleware',
    function $errorHandlerMiddleware() {
      return errorComponents.errorHandlerMiddleware();
    }
  );

  container.register('knex', function $knex(config) {
    return dbComponents.knex(config.knex);
  });

  container.register('logger', function $logger(config) {
    return loggingComponents.logger(config);
  });

  container.register('loggingMiddleware', function $loggingMiddleware(logger) {
    return loggingComponents.loggingMiddleware(logger);
  });

  entries.forEach((entry) => container.load(path.join(__dirname, entry)));

  return container;
}

module.exports = {
  createContainer
};
