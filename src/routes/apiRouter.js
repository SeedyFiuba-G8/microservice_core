const express = require('express');

module.exports = function apiRouter(
  apiValidatorMiddleware,
  statusController,
  projectsController
) {
  return (
    express
      .Router()
      // OpenAPI Validation Middleware
      .use(apiValidatorMiddleware)

      // Redirect root to api docs
      .get('/', (req, res) => res.redirect('/api-docs'))

      // Ping and Health
      .get('/ping', statusController.ping)

      .get('/health', statusController.health)

      // ROUTES
      .get('/projects', projectsController.getAll)
  );
};
