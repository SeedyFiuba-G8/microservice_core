module.exports = function usersRepository(knex) {
  return {
    getAll
  };

  /**
   * Get all data from projects table
   *
   * @returns {Promise}
   */
  function getAll() {
    return knex('projects');
  }
};
