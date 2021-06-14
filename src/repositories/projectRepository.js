module.exports = function usersRepository(errors, knex, logger, projectUtils) {
  return {
    create,
    getAll,
    getByUserId,
    getByProjectId,
    getUserId,
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
    try {
      await knex('projects').insert({
        id: projectInfo.id,
        user_id: projectInfo.userId,
        title: projectInfo.title,
        description: projectInfo.description,
        type: projectInfo.type,
        objective: projectInfo.objective,
        country: projectInfo.country,
        city: projectInfo.city,
        finalized_by: projectInfo.finalizedBy
      });
    } catch (err) {
      if (err.code === '23505')
        throw errors.Conflict('A project with specified id already exists.');

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
};
