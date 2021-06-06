module.exports = function usersRepository(knex) {
  /**
   * Get all data from projects table
   *
   * @returns {Promise}
   */
  function getAll() {
    return knex('projects');
  }

  /**
   * Gets db version
   *
   * @returns {Promise}
   */
  function getVersion() {
    return knex.raw('SELECT version()');
  }

  return {
    getAll,
    getVersion
  };
};
