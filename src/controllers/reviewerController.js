module.exports = function $reviewerController(expressify, reviewerService) {
  return expressify({
    getRequests,
    updateRequest
  });

  /**
   * Gets review requests for a reviewer
   *
   * @returns {Promise}
   */
  async function getRequests(req, res) {
    const userId = req.headers.uid;
    const { reviewerId } = req.params;
    const requests = await reviewerService.getRequests(userId, reviewerId);

    return res.status(200).json({ requests });
  }

  /**
   * Updates status of request
   *
   * @returns {Promise}
   */
  async function updateRequest(req, res) {
    const userId = req.headers.uid;
    const { reviewerId, projectId } = req.params;
    const { status } = req.body;
    await reviewerService.updateRequest(userId, reviewerId, {
      projectId,
      status
    });

    return res.status(204).send();
  }
};
