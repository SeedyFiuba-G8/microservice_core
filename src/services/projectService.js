const { v4: uuidv4 } = require('uuid');

module.exports = function usersService(projectRepository) {
  return {
    create,
    getAll,
    remove
  };

  /**
   * Creates a new project
   *
   * @returns {Promise} uuid
   */
  async function create(projectInfo) {
    const id = uuidv4();

    /* TODO Logic validations */

    await projectRepository.create({ id, ...projectInfo });

    return id;
  }

  /**
   * Deletes an existing project
   *
   * @returns {Promise} uuid
   */
  async function remove(projectId) {
    return projectRepository.remove(projectId);
  }

  /**
   * Fetchs all projects data from db
   *
   * @returns {Promise} Project[]
   */
  async function getAll() {
    return projectRepository.getAll();
  }
};
