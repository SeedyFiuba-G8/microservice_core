const express = require('express');

module.exports = function apiRouter(
  apiValidatorMiddleware,
  projectsController,
  statusController
) {
  return (
    express
      .Router()
      // Redirect root to api docs
      .get('/', (req, res) => res.redirect('/api-docs'))

      // OpenAPI Validator Middleware
      .use(apiValidatorMiddleware)

      // STATUS
      .get('/ping', statusController.ping)
      .get('/health', statusController.health)

      // ROUTES

      // Projects
      .get('/project/all', projectsController.getAll)
  );
};
