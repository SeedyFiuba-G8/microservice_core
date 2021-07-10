const _ = require('lodash');

module.exports = function $projectRepository(dbUtils, errors, knex, logger) {
  return {
    create,
    get,
    update,
    remove
  };

  /**
   * Inserts a new project to the db
   *
   * @returns {Promise}
   */
  async function create(projectInfo) {
    return knex('projects')
      .insert(dbUtils.mapToDb(projectInfo))
      .catch((err) => {
        if (err.code === '23505')
          throw errors.create(
            500,
            'A project with specified ID already exists.'
          );

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
    console.log(`(projectRepository:get) querying knex with: {
      select: ${JSON.stringify(
        _.isArray(select) ? dbUtils.mapToDb(select) : '*'
      )},
      where: ${JSON.stringify(dbUtils.mapToDb(filters))},
      limit: ${JSON.stringify(limit)},
      offset: ${JSON.stringify(offset)},
    }`);

    const query = knex('projects')
      .select(_.isArray(select) ? dbUtils.mapToDb(select) : '*')
      .where(dbUtils.mapToDb(filters))
      .orderBy('published_on', 'desc');

    if (limit) query.limit(limit);
    if (offset) query.offset(offset);

    return query.then(dbUtils.mapFromDb);
  }

  /**
   * Updates a project info
   *
   * @returns {Promise}
   */
  async function update(projectId, newProjectInfo, requesterId) {
    const result = await knex('projects')
      .update(dbUtils.mapToDb(newProjectInfo))
      .where({
        id: projectId,
        user_id: requesterId
      });

    if (!result) {
      throw errors.create(404, 'There is no project with the specified id.');
    }
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
};
