const express = require('express');

module.exports = function apiRouter(
  apiValidatorMiddleware,
  metricController,
  notificationController,
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
      .put('/projects/:projectId/rating', projectController.rate)
      .post('/projects/:projectId/like', projectController.like)
      .delete('/projects/:projectId/like', projectController.dislike)
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
      .post('/wallets/:walletAddress/funds', walletController.transfer)

      // Fundings
      .get('/users/:userId/fundings', walletController.getFundings)
      .get('/users/fundings', walletController.getAllFundings)

      // Notifications
      .post('/users/:userId/pushToken', notificationController.pushToken)
      .delete('/users/:userId/pushToken', notificationController.removeToken)
      .post('/users/:userId/message', notificationController.pushMessage)

      // Metrics
      .get('/metrics', metricController.getBasic)
      .get('/metrics/events', metricController.getEvents)
  );
};
