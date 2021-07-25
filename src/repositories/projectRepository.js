const _ = require('lodash');

module.exports = function $projectRepository(
  dbUtils,
  errors,
  knex,
  logger,
  scGateway
) {
  return {
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

    const stagesList = projectInfo.stages.map((stageInfo, i) => {
      const stage = {
        projectId: projectInfo.id,
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
      async (project) => {
        // Gather stages info
        const stages = (
          await knex('stages')
            .where('project_id', project.id)
            .orderBy('stage', 'asc')
            .then(dbUtils.mapFromDb)
        ).map((stage) => ({ ...stage, cost: Number(stage.cost) }));

        // Gather funding info
        return { ...(await addFundingInfo(project)), stages };
      }
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
      .update(dbUtils.mapToDb(updateFields))
      .where({
        id: projectId,
        user_id: requesterId
      });

    if (!result) {
      throw errors.create(404, 'There is no project with the specified id.');
    }
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
        500,
        `The project with id ${projectId} was not processed by blockchain`
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
   * This function should be called when a project exits DRAFT status.
   *
   * It removes its local stages cost information, because it will now be
   * stored in the smart contract's microservice
   *
   * @param {String} projectId
   */
  async function removeStagesForProject(projectId) {
    return knex('stages').where(dbUtils.mapToDb({ projectId })).del();
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

  async function addFundingInfo(project) {
    if (project.status === 'DRAFT')
      return { ...project, totalFunded: 0, currentStage: 0 };

    const { totalFunded, currentStatus, currentStage } =
      await scGateway.getProject(await getTxHash(project.id));
    return { ...project, totalFunded, status: currentStatus, currentStage };
  }
};
