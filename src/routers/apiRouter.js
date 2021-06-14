const express = require('express');

module.exports = function apiRouter(
  apiValidatorMiddleware,
  projectController,
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
      .post('/project', projectController.create)
      .get('/project/:projectId', projectController.get)
      .put('/project/:projectId', projectController.modify)
      .delete('/project/:projectId', projectController.remove)

      // Projects
      .get('/project', projectController.getAll)
  );
};
