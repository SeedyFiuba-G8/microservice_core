const express = require('express');

module.exports = function $app(
  apiRouter,
  config,
  docsRouter,
  errorHandlerMiddleware,
  loggingMiddleware
) {
  // eslint-disable-next-line global-require
  if (config.monitoring) require('newrelic');

  const app = express();

  // Pre middleware
  app.use(express.json());
  app.use(loggingMiddleware);

  // Routers
  app.use(docsRouter);
  app.use(apiRouter);

  // Post middleware
  app.use(errorHandlerMiddleware);

  return app;
};
