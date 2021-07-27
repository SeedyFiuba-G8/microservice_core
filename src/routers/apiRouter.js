const express = require('express');

module.exports = function apiRouter(
  apiValidatorMiddleware,
  metricController,
  projectController,
  reviewerController,
  statusController,
  walletController,
  validateApikeyMiddleware,
  validProjectMiddleware
) {
  return (
    express
      .Router()
      // Redirect root to api docs
      .get('/', (req, res) => res.redirect('/api-docs'))

      // OpenAPI Validator Middleware
      .use(apiValidatorMiddleware)
      .use(validateApikeyMiddleware)

      // STATUS
      .get('/ping', statusController.ping)
      .get('/health', statusController.health)
      .get('/info', statusController.info)

      // ROUTES

      // Projects
      .get('/projects', projectController.getPreviewsBy)
      .post('/projects', projectController.create)
      .post('/projects/:projectId/block', projectController.block)
      .delete('/projects/:projectId/block', projectController.unblock)
      .get('/projects/:projectId', projectController.get)

      .use('/projects/:projectId', validProjectMiddleware)
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
      .get('/wallets/:userId/fundings', walletController.getFundings)
      .get('/wallets/fundings', walletController.getAllFundings)
      .get('/wallets/:userId', walletController.get)

      // Metrics
      .get('/metrics', metricController.getBasic)
      .get('/metrics/events', metricController.getEvents)
  );
};
