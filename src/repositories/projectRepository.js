const _ = require('lodash');

module.exports = function $projectRepository(dbUtils, errors, knex, logger) {
  return {
    create,
    get,
    update,
    updateBy,
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
