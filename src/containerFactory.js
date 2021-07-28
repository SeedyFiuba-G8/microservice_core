const dependable = require('dependable');
const path = require('path');
const apiComponents = require('@seedyfiuba/api_components');
const apikeysComponents = require('@seedyfiuba/apikeys_components');
const dbComponents = require('@seedyfiuba/db_components');
const errorComponents = require('@seedyfiuba/error_components');
const gatewayComponents = require('@seedyfiuba/gateway_components');
const loggingComponents = require('@seedyfiuba/logging_components');
const notificationComponents = require('@seedyfiuba/notification_components');

function createContainer() {
  const container = dependable.container();
  const entries = [
    'app.js',
    'controllers',
    'middlewares',
    'gateways',
    'repositories',
    'routers',
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

  container.register(
    'apikeys',
    function $apikeys(config, fetch, logger, urlFactory) {
      return apikeysComponents.apikeys(config, fetch, logger, urlFactory);
    }
  );

  container.register('apikeysCache', function $apikeysCache() {
    return apikeysComponents.cache();
  });

  container.register('apikeyUtils', function $apikeyUtils(config, errors) {
    return apikeysComponents.utils(config, errors);
  });

  container.register(
    'validateApikeyMiddleware',
    function $validateApikeyMiddleware(
      apikeysCache,
      config,
      errors,
      fetch,
      logger,
      urlFactory
    ) {
      return apikeysComponents.middleware(
        apikeysCache,
        config,
        errors,
        fetch,
        logger,
        urlFactory
      );
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

  container.register('dbUtils', function $dbService() {
    return dbComponents.dbUtils();
  });

  container.register('docsRouter', function $docsRouter() {
    return apiComponents.docsRouter(apiPath);
  });

  container.register('errors', function $errors() {
    return errorComponents.errors();
  });

  container.register('events', function $events(config) {
    return config.events;
  });

  container.register(
    'errorHandlerMiddleware',
    function $errorHandlerMiddleware(logger) {
      return errorComponents.errorHandlerMiddleware(
        process.env.NODE_ENV !== 'test' ? logger : undefined
      );
    }
  );

  container.register('expressify', function $expressify() {
    // eslint-disable-next-line global-require
    return require('expressify')();
  });

  container.register('fetch', function $commonFetch(config, errors, logger) {
    return gatewayComponents.fetch(config, errors, logger);
  });

  container.register('sendNotifications', function $sendNotifications(logger) {
    return notificationComponents.send(logger);
  });

  container.register('knex', function $knex(config) {
    return dbComponents.knex(config.knex);
  });

  container.register('logger', function $logger(config) {
    return loggingComponents.logger(config.logger);
  });

  container.register('loggingMiddleware', function $loggingMiddleware(logger) {
    return loggingComponents.loggingMiddleware(logger);
  });

  container.register('services', function $services(config) {
    return config.services;
  });

  container.register('serviceInfo', function $serverInfo() {
    return {
      creationDate: new Date(),
      description:
        'Core microservice that manages projects with its tags, reviewers, funders, and so on.'
    };
  });

  container.register('urlFactory', function $commonUrlFactory() {
    return gatewayComponents.urlFactory();
  });

  entries.forEach((entry) => container.load(path.join(__dirname, entry)));

  return container;
}

module.exports = {
  createContainer
};
