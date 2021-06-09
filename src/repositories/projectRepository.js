module.exports = function usersRepository(errors, knex, logger) {
  return {
    create,
    getAll
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
   * @returns {undefined}
   */
  async function create(projectInfo) {
    try {
      await knex('projects').insert({
        id: projectInfo.id,
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
   * @returns {Promise}
   */
  function getAll() {
    return knex('projects');
  }
};
