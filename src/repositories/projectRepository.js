const _ = require('lodash');

module.exports = function $projectRepository(
  dbUtils,
  errors,
  knex,
  logger,
  scGateway
) {
  return {
    count,
    create,
    get,
    getByIdOrUser,
    getMatchingIds,
    getProjectId,
    getTxHash,
    update,
    updateBy,
    registerTxHash,
    remove,
    removeStagesForProject
  };

  /**
   * Counts values
   *
   * @returns {Promise}
   */
  function count({ filters = {} } = {}) {
    return knex('projects')
      .where(dbUtils.mapToDb(filters))
      .count('id')
      .then((result) => Number(result[0].count));
  }

  /**
   * Inserts a new project to the db
   *
   * @returns {Promise}
   */
  async function create(projectInfo) {
    await knex('projects')
      .insert(dbUtils.mapToDb(_.omit(projectInfo, ['stages'])))
      .catch((err) => {
        if (err.code === '23505')
          throw errors.create(
            500,
            'A project with specified ID already exists.'
          );

        throw err;
      });

    return addStages(projectInfo.id, projectInfo.stages);
  }

  /**
   * Generic get abstraction
   *
   * @returns {Promise}
   */
  async function get({ select, filters = {}, limit, offset, projectIds } = {}) {
    const query = knex('projects')
      .select(_.isArray(select) ? dbUtils.mapToDb(select) : '*')
      .where(dbUtils.mapToDb(_.omit(filters, ['status'])))
      .orderBy('published_on', 'desc');

    if (projectIds) query.whereIn('id', projectIds);
    if (limit) query.limit(limit);
    if (offset) query.offset(offset);

    let projects = await Promise.all(
      (
        await query
          .then(dbUtils.mapFromDb)
          .then((res) => res.map((project) => _.omitBy(project, _.isNull)))
      ).map(async (project) => ({
        ...project,
        ...(await getFundingInfo(project.id, project.status)),
        stages: await getStages(project.id)
      }))
    );

    // Status source of truth is the sc
    if (filters.status) {
      projects = projects.filter(
        (project) => project.status === filters.status
      );
    }

    return projects;
  }

  /**
   * Gets projects by id or created by user
   *
   * @returns {Promise}
   */
  async function getByIdOrUser({ projectIds, userId }, select) {
    return knex('projects')
      .select(dbUtils.mapToDb(select))
      .whereIn('id', projectIds)
      .orWhere('user_id', userId)
      .then(dbUtils.mapFromDb)
      .then((res) => res.map((project) => _.omitBy(project, _.isNull)));
  }

  /**
   * Gets project ids for matching projects
   */
  async function getMatchingIds({ tags, types }, userId) {
    // Fun fact: tags are injected rawless in query,
    // so... I can wait to see all those ';DROP DATABASE` tags :P
    // TODO: Sanitize tags.

    return (
      knex('projects')
        .select(['id'])
        .whereNot(dbUtils.mapToDb({ userId }))

        // eslint-disable-next-line
        .andWhere(function () {
          const reducer = (query, tag) =>
            query.orWhereRaw('? = ANY(tags)', tag);

          tags.reduce(reducer, this.whereIn('type', types));
        })

        .then(dbUtils.mapFromDb)
        .then((res) => res.map((project) => _.omitBy(project, _.isNull)))
        .then((res) => res.map(({ id }) => id))
    );
  }

  /**
   * Updates a project info
   *
   * @returns {Promise}
   */
  async function update(projectId, updateFields, requesterId) {
    const result = await knex('projects')
      .update(dbUtils.mapToDb(_.omit(updateFields, ['stages'])))
      .where({
        id: projectId,
        user_id: requesterId
      });

    if (!result) {
      throw errors.create(404, 'There is no project with the specified id.');
    }

    if (updateFields.stages) updateStages(projectId, updateFields.stages);
  }

  /**
   * Updates a project info by filters
   *
   * @returns {Promise}
   */
  async function updateBy(filters, updateFields) {
    const result = await knex('projects')
      .update(dbUtils.mapToDb(updateFields))
      .where(dbUtils.mapToDb(filters));

    if (!result) {
      throw errors.create(404, 'There is no project with the specified id.');
    }
  }

  /**
   * Gets the txHash of a project, by its id.
   *
   * The txHash is the smart contract's id of the project.
   *
   * @param {String} projectId
   * @returns projectTxHash
   */
  async function getTxHash(projectId) {
    const projectHash = (
      await knex('project_hashes')
        .where(dbUtils.mapToDb({ projectId }))
        .select('tx_hash')
        .then(dbUtils.mapFromDb)
    )[0];

    if (!projectHash) {
      throw errors.create(
        404,
        `The project with id ${projectId} was not found in the smart contract`
      );
    }

    return projectHash.txHash;
  }

  /**
   * Gets the txHash of a project, by its id.
   *
   * The txHash is the smart contract's id of the project.
   *
   * @param {String} projectTxHash
   * @returns {Promise} projectId
   */
  async function getProjectId(txHash) {
    const projectId = (
      await knex('project_hashes')
        .where(dbUtils.mapToDb({ txHash }))
        .select('project_id')
        .then(dbUtils.mapFromDb)
    )[0];

    if (!projectId) {
      throw errors.create(
        404,
        `The project with ${txHash} was not found in the database`
      );
    }

    return projectId.projectId;
  }

  /**
   * Registers the mapping projectId <=> txHash.
   *
   * The smart contracts service indexes projects by their creating transaction hash.
   * This is because the smart contracts saves them this way.
   *
   * @returns {Promise}
   */
  async function registerTxHash(projectId, txHash) {
    return knex('project_hashes').insert(
      dbUtils.mapToDb({ projectId, txHash })
    );
  }

  /**
   * Removes a project with specified id from projects table
   *
   * @returns {Promise}
   */
  async function remove(projectId, requesterId) {
    const result = await knex('projects')
      .where({ id: projectId, user_id: requesterId })
      .del();

    if (!result) {
      throw errors.create(404, 'There is no project with the specified id.');
    }
  }

  // HELPER FUNCTIONS
  /**
   * Adds funding info of a project.
   *
   * If it is not draft, it gathers it from the smart contract microservice.
   *
   * @param {String} projectId
   * @param {String} status
   * @returns {Promise} Project
   */
  async function getFundingInfo(projectId, status) {
    const draftInfo = {
      totalFunded: 0,
      currentStage: 0,
      contributions: 0,
      contributors: 0
    };

    if (status === 'DRAFT') return draftInfo;

    let scProjectInfo;
    try {
      scProjectInfo = await scGateway.getProject(await getTxHash(projectId));
    } catch (err) {
      // Project could not be published in smart contract => it is still draft
      logger.error(err);
      return { ...draftInfo, status: 'DRAFT' };
    }

    const {
      totalFunded,
      currentStage,
      currentStatus,
      contributions,
      contributors
    } = scProjectInfo;

    return {
      totalFunded,
      status: currentStatus,
      currentStage,
      contributions,
      contributors
    };
  }

  /**
   * Adds the stages of a project to the database
   *
   * @param {String} projectId
   * @param {List} stages
   * @returns {Promise}
   */
  async function addStages(projectId, stages) {
    const stagesList = stages.map((stageInfo, i) => {
      const stage = {
        projectId,
        stage: i,
        ...stageInfo
      };

      return stage;
    });

    return knex('stages').insert(dbUtils.mapToDb(stagesList));
  }

  /**
   * Gets the stages of a project from the database
   *
   * @param {String} projectId
   * @returns {Promise}
   */
  async function getStages(projectId) {
    return (
      await knex('stages')
        .where('project_id', projectId)
        .orderBy('stage', 'asc')
        .then(dbUtils.mapFromDb)
    ).map((stage) => ({ ...stage, cost: Number(stage.cost) }));
  }

  /**
   * Updates the stages of a project in the database
   *
   * @param {String} projectId
   * @param {List} stages
   * @returns {Promise}
   */
  async function updateStages(projectId, stages) {
    await removeStagesForProject(projectId);
    return addStages(projectId, stages);
  }

  /**
   * Removes the stages of a project from the database
   *
   * @param {String} projectId
   * @returns {Promise}
   */
  async function removeStagesForProject(projectId) {
    return knex('stages').where(dbUtils.mapToDb({ projectId })).del();
  }
};
