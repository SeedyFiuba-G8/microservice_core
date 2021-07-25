const _ = require('lodash');
const { v4: uuidv4 } = require('uuid');

module.exports = function $projectService(
  errors,
  projectRepository,
  projectUtils,
  reviewerRepository,
  scGateway,
  tagRepository,
  validationUtils,
  walletService
) {
  return {
    create,
    fund,
    get,
    getPreviewsBy,
    getSimpleProject,
    update,
    remove
  };

  /**
   * Creates a new project
   *
   * @returns {Promise} uuid
   */
  async function create(userId, rawProjectInfo) {
    const projectInfo = projectUtils.buildProjectInfo(rawProjectInfo, true);
    validationUtils.validateProjectInfo(projectInfo);

    const id = uuidv4();
    await projectRepository.create({
      id,
      userId,
      ..._.omit(projectInfo, ['reviewers'])
    });

    // Update reviewers and tags
    const { tags, reviewers } = projectInfo;
    await Promise.all([
      reviewerRepository.updateForProject(id, reviewers),
      tagRepository.updateForProject(id, tags)
    ]);

    return id;
  }

  /**
   * Creates a new funding transaction in sc microservice
   *
   * @returns {Promise} uuid
   */
  async function fund(userId, projectId, amount) {
    const projectTxHash = await projectRepository.getTxHash(projectId);
    const walletId = await walletService.getWalletId(userId);
    return scGateway.fundProject(walletId, projectTxHash, amount);
  }

  /**
   * Fetchs project data of projectId
   *
   * @returns {Promise} Project
   */
  async function get(projectId) {
    let project = await getSimpleProject(projectId);
    project = _.omitBy(project, _.isNull);

    if (!project.reviewerId)
      project.reviewers = await reviewerRepository.get({
        filters: { projectId: project.id },
        select: ['reviewerId', 'status']
      });

    return project;
  }

  /**
   * Fetchs all projects that match filters,
   *
   * @returns {Promise} Project[]
   */
  async function getPreviewsBy(filters, limit, offset) {
    const previewFields = [
      'id',
      'status',
      'title',
      'description',
      'type',
      'objective',
      'country',
      'city',
      'finalizedBy',
      'tags',
      'coverPicUrl'
    ];

    return projectRepository.get({
      filters,
      select: previewFields,
      limit,
      offset
    });
  }

  /**
   * Modifies project data
   *
   * @returns {Promise} Project
   */
  async function update(projectId, rawProjectInfo, requesterId) {
    if (rawProjectInfo.status === 'FUNDING')
      return publish(projectId, requesterId);
    return innerUpdate(projectId, rawProjectInfo, requesterId);
  }

  /**
   * Deletes an existing project
   *
   * @returns {Promise} uuid
   */
  async function remove(projectId, requesterId) {
    const { status } = await getSimpleProject(projectId);
    if (status !== 'DRAFT')
      throw errors.create(
        409,
        'Projects that have been already published cannot be deleted.'
      );

    await projectRepository.remove(projectId, requesterId);

    // Remove tags and reviewers
    await Promise.all([
      tagRepository.removeForProject(projectId),
      reviewerRepository.removeForProject(projectId)
    ]);

    return projectId;
  }

  // Aux

  /**
   * Updates project info
   */
  async function innerUpdate(projectId, rawProjectInfo, requesterId) {
    const currentProjectInfo = await getSimpleProject(projectId);
    if (currentProjectInfo.status !== 'DRAFT')
      throw errors.create(409, 'You can only edit DRAFT projects');

    let projectInfo = projectUtils.buildProjectInfo(rawProjectInfo);
    validationUtils.validateProjectInfo(projectInfo);

    const { tags, reviewers } = projectInfo;
    projectInfo = _.omit(projectInfo, ['reviewers']);

    if (!_.isEmpty(projectInfo)) {
      await projectRepository.update(projectId, projectInfo, requesterId);
    } else {
      await validatePermissions(projectId, requesterId);
    }

    // Update tags and reviewers
    const promises = [];

    if (reviewers)
      promises.push(reviewerRepository.updateForProject(projectId, reviewers));

    if (tags) promises.push(tagRepository.updateForProject(projectId, tags));

    await Promise.all(promises);

    return projectId;
  }

  /**
   * Tries to publish the project
   */
  async function publish(projectId, requesterId) {
    const possibleReviewers = await reviewerRepository.get({
      filters: { projectId, status: 'ACCEPTED' },
      select: ['reviewerId']
    });

    if (!possibleReviewers.length)
      throw errors.create(404, 'There is no project with the specified id.');

    const projectInfo = await getSimpleProject(projectId);

    // 404 will be returned if project is not in draft
    // or if user is not the owner
    const reviewerId = _.sample(
      possibleReviewers.map((reviewer) => reviewer.reviewerId)
    );

    await projectRepository.updateBy(
      { id: projectId, status: 'DRAFT', userId: requesterId },
      {
        status: 'FUNDING',
        reviewerId
      }
    );

    // We can now create the smart contract's project
    const projectTxHash = await scGateway.createProject({
      ownerId: await walletService.getWalletId(projectInfo.userId),
      reviewerId: await walletService.getWalletId(reviewerId),
      stagesCost: projectInfo.stages.map((stage) => stage.cost)
    });

    await projectRepository.registerTxHash(projectId, projectTxHash);

    // We remove all reviewers
    await reviewerRepository.removeForProject(projectId);
  }

  /**
   * Gets a project from repository if it exists
   */
  async function getSimpleProject(projectId) {
    const projects = await projectRepository.get({
      filters: {
        id: projectId
      }
    });

    if (!projects.length)
      throw errors.create(404, 'There is no project with the specified id.');

    return projects[0];
  }

  /**
   * Validates permissions for project
   */
  async function validatePermissions(projectId, requesterId) {
    const { userId } = await getSimpleProject(projectId);
    if (userId !== requesterId)
      throw errors.create(404, 'There is no project with the specified id.');
  }
};
