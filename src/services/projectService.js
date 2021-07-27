const _ = require('lodash');
const { v4: uuidv4 } = require('uuid');

module.exports = function $projectService(
  errors,
  events,
  eventRepository,
  logger,
  likeRepository,
  projectRepository,
  projectUtils,
  reviewerRepository,
  scGateway,
  tagRepository,
  validationUtils,
  walletService
) {
  return {
    // Create
    create,

    // Get
    get,
    getPreviewsBy,
    getSimpleProject,

    // Modify
    fund,
    update,
    remove,

    // Likes
    like,
    dislike,

    // Block
    block,
    unblock
  };

  // CREATE -------------------------------------------------------------------

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

    eventRepository.log(events.CREATE, userId);
    logger.info({
      message: 'Project created',
      project: {
        id,
        userId,
        ..._.omit(projectInfo, ['reviewers'])
      }
    });

    return id;
  }

  // GET ----------------------------------------------------------------------

  /**
   * Fetchs project data of projectId
   *
   * @returns {Promise} Project
   */
  async function get(projectId, requesterId) {
    let project = await getSimpleProject(projectId);
    project = _.omitBy(project, _.isNull);

    project.liked = await likeRepository.check({
      projectId,
      userId: requesterId
    });

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
      'blocked',
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
    const { tags } = filters;
    const parsedFilters = _.omit(filters, 'tags');

    // Search by tags
    let projectIds;
    if (tags) {
      projectIds = await tagRepository.getProjects(tags);
    }

    return projectRepository.get({
      filters: parsedFilters,
      select: previewFields,
      limit,
      offset,
      projectIds
    });
  }

  // MODIFY -------------------------------------------------------------------

  /**
   * Creates a new funding transaction in sc microservice
   *
   * @returns {Promise} uuid
   */
  async function fund(userId, projectId, amount) {
    const projectTxHash = await projectRepository.getTxHash(projectId);
    const walletId = await walletService.getWalletId(userId);
    const txHash = await scGateway.fundProject(walletId, projectTxHash, amount);

    logger.info(
      `user ${userId} funded ${amount} ETHs in project ${projectId}. Transaction: ${txHash}`
    );

    return txHash;
  }

  /**
   * Modifies project data
   *
   * @returns {Promise} Project
   */
  async function update(projectId, rawProjectInfo, requesterId) {
    if (rawProjectInfo.status === 'FUNDING')
      return publish(projectId, requesterId);

    if (rawProjectInfo.lastCompletedStage !== undefined) {
      return updateLastCompletedStage(
        projectId,
        rawProjectInfo.lastCompletedStage,
        requesterId
      );
    }

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

  // LIKES --------------------------------------------------------------------

  async function like(projectId, requesterId) {
    await likeRepository.add({ projectId, userId: requesterId });

    logger.info({
      message: 'Project liked by user',
      project: {
        id: projectId
      },
      user: {
        id: requesterId
      }
    });
  }

  async function dislike(projectId, requesterId) {
    await likeRepository.remove({
      projectId,
      userId: requesterId
    });

    logger.info({
      message: 'Project disliked by user',
      project: {
        id: projectId
      },
      user: {
        id: requesterId
      }
    });
  }

  // BLOCK --------------------------------------------------------------------

  async function block(projectId) {
    await projectRepository.updateBy(
      {
        id: projectId,
        blocked: false
      },
      {
        blocked: true
      }
    );

    logger.info({
      message: 'Project blocked',
      project: {
        id: projectId
      }
    });
  }

  async function unblock(projectId) {
    await projectRepository.updateBy(
      {
        id: projectId,
        blocked: true
      },
      {
        blocked: false
      }
    );

    logger.info({
      message: 'Project unblocked',
      project: {
        id: projectId
      }
    });
  }

  // AUX ----------------------------------------------------------------------

  /**
   * Sets the current stage of a project.
   * Must be called by reviewer.
   * Project must be IN_PROGRESS.
   *
   * @param {String} projectId
   * @param {Integer} newStage
   * @param {String} requesterId
   * @returns {Promise}
   */
  async function updateLastCompletedStage(
    projectId,
    lastCompletedStage,
    requesterId
  ) {
    const { status, currentStage, reviewerId, stages } = await getSimpleProject(
      projectId
    );

    if (status !== 'IN_PROGRESS')
      throw errors.create(
        409,
        'Only projects in progress can have stages set as completed.'
      );

    if (requesterId !== reviewerId)
      throw errors.create(401, 'Only reviewer can set stages as completed.');

    if (lastCompletedStage >= stages.length)
      throw errors.create(
        400,
        `Project has only ${stages.length} stages. Cannot set stage ${lastCompletedStage} as completed`
      );

    if (currentStage - 1 >= lastCompletedStage)
      throw errors.create(
        400,
        `Stage ${lastCompletedStage} has already been marked as completed. Current stage: ${currentStage}. LastCompletedStage: ${
          currentStage - 1
        }`
      );

    // the sc endpoint works setting completed stage. The project's currentStage will be lastCompletedStage + 1
    // (or will be marked) as COMPLETED, if lastCompletedStage is the last stage.
    // funds of the stages in range [currentStage + 1, (lastCompletedStage + 1)] will be transferred to entrepeneur if transaction succeeds.
    return scGateway.setProjectLastCompletedStage(
      await walletService.getWalletId(reviewerId),
      await projectRepository.getTxHash(projectId),
      lastCompletedStage
    );
  }

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

    // We log project publication
    eventRepository.log(events.PUBLISH, requesterId);
    logger.info({
      message: 'Project published',
      project: {
        id: projectId,
        userId: requesterId,
        reviewerId
      }
    });
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
