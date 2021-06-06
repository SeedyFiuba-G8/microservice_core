module.exports = function usersService(projectsRepository) {
  /**
   * Fetchs all users data from db
   *
   * @returns {Promise}
   */
  async function getAll() {
    return projectsRepository.getAll();
  }

  return {
    getAll
  };
};
