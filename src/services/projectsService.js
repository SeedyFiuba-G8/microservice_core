module.exports = function usersService(projectsRepository) {
  return {
    getAll
  };

  /**
   * Fetchs all users data from db
   *
   * @returns {Promise}
   */
  async function getAll() {
    return projectsRepository.getAll();
  }
};
