const _ = require('lodash');

module.exports = function usersRepository(errors, knex, logger, projectUtils) {
  return {
    create,
    getAll,
    getByUserId,
    getByProjectId,
    getUserId,
    update,
    remove
  };

  /**
   * @param {uuid} projectInfo.id
   * @param {String} projectInfo.title
   * @param {String} projectInfo.description
   * @param {String} projectInfo.type
   * @param {String} projectInfo.objective
   * @param {String} projectInfo.country
   * @param {String} projectInfo.city
   * @param {String} projectInfo.finalizedBy "2021-06-09T20:28:32.190Z"
   *
   * @returns {Promise}
   */
  async function create(projectInfo) {
    const projectRow = mapProjectInfoToRow(projectInfo);

    try {
      await knex('projects').insert(projectRow);
    } catch (err) {
      if (err.code === '23505')
        throw errors.InternalServerError(
          'A project with specified id already exists.'
        );

      logger.error(err);
      throw errors.InternalServerError();
    }
  }

  /**
   * Get all data from projects table
   *
   * @returns {Promise} Project[]
   */
  async function getAll() {
    const projectsInfo = await knex('projects').orderBy('published_on', 'desc');

    const projects = projectsInfo.map((projectInfo) =>
      projectUtils.buildProjectObject(projectInfo)
    );

    return projects;
  }

  /**
   * Get all data of projects created by userId
   *
   * @returns {Promise} Project
   */
  async function getByUserId(userId) {
    const projectsInfo = await knex('projects')
      .where('user_id', userId)
      .orderBy('published_on', 'desc');

    if (!projectsInfo.length) {
      throw errors.NotFound(
        'There are no projects created by the specified user.'
      );
    }

    const projects = projectsInfo.map((projectInfo) =>
      projectUtils.buildProjectObject(projectInfo)
    );

    return projects;
  }

  /**
   * Get all data of project with projectId
   *
   * @returns {Promise} Project
   */
  async function getByProjectId(projectId) {
    const projectInfo = await knex('projects').where('id', projectId).first();

    if (!projectInfo) {
      throw errors.NotFound('There is no project with the specified id.');
    }

    return projectUtils.buildProjectObject(projectInfo);
  }

  /**
   * Get userId of project with projectId
   *
   * @returns {Promise} Project
   */
  async function getUserId(projectId) {
    const result = await knex('projects')
      .select('user_id')
      .where('id', projectId)
      .first();

    if (!result) {
      throw errors.NotFound('There is no project with the specified id.');
    }

    return result.user_id;
  }

  /**
   * Updates a project info
   *
   * @returns {Promise} id
   */
  async function update(projectId, newProjectInfo) {
    const fieldsToUpdate = mapProjectInfoToRow(newProjectInfo);

    const result = await knex('projects')
      .update(fieldsToUpdate)
      .where('id', projectId);

    if (!result) {
      throw errors.NotFound('There is no project with the specified id.');
    }

    return projectId;
  }

  /**
   * Removes a project with specified id from projects table
   *
   * @returns {Promise} uuid
   */
  async function remove(projectId) {
    const result = await knex('projects').where('id', projectId).del();

    if (!result) {
      throw errors.NotFound('There is no project with the specified id.');
    }

    return projectId;
  }

  function mapProjectInfoToRow(projectInfo) {
    return _.mapKeys(projectInfo, (value, key) => {
      if (key === 'finalizedBy') return 'finalized_by';
      if (key === 'userId') return 'user_id';
      if (key === 'publishedOn') return 'published_on';
      return key;
    });
  }
};
