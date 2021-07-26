const express = require('express');

module.exports = function apiRouter(
  apiValidatorMiddleware,
  metricController,
  projectController,
  reviewerController,
  statusController,
  walletController,
  validProjectMiddleware
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
      .get('/projects', projectController.getPreviewsBy)
      .post('/projects', projectController.create)
      .post('/projects/:projectId/block', projectController.block)
      .delete('/projects/:projectId/block', projectController.unblock)

      .use('/projects/:projectId', validProjectMiddleware)
      .get('/projects/:projectId', projectController.get)
      .patch('/projects/:projectId', projectController.update)
      .delete('/projects/:projectId', projectController.remove)
      .post('/projects/:projectId/funds', projectController.fund)

      // Reviewers
      .get('/reviewrequests/:reviewerId', reviewerController.getRequests)
      .put(
        '/reviewrequests/:reviewerId/:projectId',
        reviewerController.updateRequest
      )

      // Wallets
      .post('/wallets', walletController.create)
      .get('/wallets/:userId', walletController.get)

      // Metrics
      .get('/metrics', metricController.getBasic)
      .get('/metrics/events', metricController.getEvents)
  );
};
