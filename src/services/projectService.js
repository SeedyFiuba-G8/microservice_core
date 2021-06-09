const { v4: uuidv4 } = require('uuid');

module.exports = function usersService(projectRepository) {
  return {
    create,
    getAll
  };

  /**
   * Creates a new project
   *
   * @returns {uuid} id
   */
  async function create(projectInfo) {
    const id = uuidv4();

    /* TODO Logic validations */

    await projectRepository.create({ id, ...projectInfo });

    return id;
  }

  /**
   * Fetchs all users data from db
   *
   * @returns {Promise}
   */
  async function getAll() {
    return projectRepository.getAll();
  }
};
