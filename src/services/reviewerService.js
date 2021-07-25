const _ = require('lodash');

module.exports = function $reviewerService(
  errors,
  projectService,
  reviewerRepository
) {
  return {
    getRequests,
    updateRequest
  };

  /**
   * Gets review requests for a reviewer
   *
   * @returns {Promise}
   */
  async function getRequests(requesterId, reviewerId) {
    validatePermissions(requesterId, reviewerId);

    let requests = await reviewerRepository.get({
      select: ['projectId', 'status'],
      filters: {
        reviewerId
      }
    });

    requests = _.filter(requests, (request) => request.status !== 'REJECTED');

    const requestPromises = requests.map(async (request) => {
      const project = await projectService.getSimpleProject(request.projectId);
      return {
        ...request,
        ..._.pick(project, [
          'userId',
          'title',
          'description',
          'type',
          'objective',
          'country',
          'city',
          'publishedOn',
          'finalizedBy',
          'stages',
          'coverPicUrl',
          'currentStage',
          'totalFunded'
        ]),
        projectStatus: project.status
      };
    });

    return Promise.all(requestPromises);
  }

  /**
   * Updates review request status
   *
   * @returns {Promise}
   */
  async function updateRequest(requesterId, reviewerId, { projectId, status }) {
    validatePermissions(requesterId, reviewerId);

    await reviewerRepository.update({
      reviewerId,
      projectId,
      status,
      neededStatus: 'PENDING'
    });
  }

  // Aux

  function validatePermissions(requesterId, reviewerId) {
    if (requesterId !== reviewerId)
      throw errors.create(403, 'You have no rights over this data');
  }
};
