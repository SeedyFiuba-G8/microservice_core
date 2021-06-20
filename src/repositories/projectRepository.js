const _ = require('lodash');

module.exports = function $projectRepository(
  errors,
  knex,
  logger,
  projectUtils
) {
  return {
    create,
    getBy,
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
        throw errors.create(
          500,
          'A project with specified ID already exists, please retry.'
        );

      logger.error(err);
      throw errors.UnknownError;
    }
  }

  /**
   * Get all data of projects that match filters
   *
   * If no filters specified, it returns all projects
   *
   * @returns {Promise} Project
   */
  async function getBy(filters) {
    const query = knex('projects').orderBy('published_on', 'desc');

    if (filters.userId) query.where('user_id', filters.userId);
    if (filters.limit) query.limit(filters.limit);
    if (filters.offset) query.offset(filters.offset);

    return query.then((projects) =>
      projects.map((projectInfo) =>
        projectUtils.buildProjectObject(projectInfo)
      )
    );
  }

  /**
   * Get all data of project with projectId
   *
   * @returns {Promise} Project
   */
  async function getByProjectId(projectId) {
    const projectInfo = await knex('projects').where('id', projectId).first();

    if (!projectInfo) {
      throw errors.create(404, 'There is no project with the specified id.');
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
      throw errors.create(404, 'There is no project with the specified id.');
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
      throw errors.create(404, 'There is no project with the specified id.');
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
      throw errors.create(404, 'There is no project with the specified id.');
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
