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

        logger.error(err);
        throw errors.UnknownError;
      });

    return addStages(projectInfo.id, projectInfo.stages);
  }

  /**
   * Generic get abstraction
   *
   * @returns {Promise}
   */
  async function get({ select, filters = {}, limit, offset } = {}) {
    const query = knex('projects')
      .select(_.isArray(select) ? dbUtils.mapToDb(select) : '*')
      .where(dbUtils.mapToDb(filters))
      .orderBy('published_on', 'desc');

    if (limit) query.limit(limit);
    if (offset) query.offset(offset);

    const projects = (await query.then(dbUtils.mapFromDb)).map(
      async (project) => ({
        ...project,
        ...(await getFundingInfo(project.id, project.status)),
        stages: await getStages(project.id)
      })
    );

    return Promise.all(projects);
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
    if (status === 'DRAFT') return { totalFunded: 0, currentStage: 0 };

    const { totalFunded, currentStatus, currentStage } =
      await scGateway.getProject(await getTxHash(projectId));
    return { totalFunded, status: currentStatus, currentStage };
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

    return knex('stages')
      .insert(dbUtils.mapToDb(stagesList))
      .catch((err) => {
        logger.error(err);
        throw errors.UnknownError;
      });
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
