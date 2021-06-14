const { v4: uuidv4 } = require('uuid');

module.exports = function projectService(errors, projectRepository) {
  return {
    create,
    getAll,
    getByProjectId,
    remove
  };

  /**
   * Creates a new project
   *
   * @returns {Promise} uuid
   */
  async function create(projectInfo) {
    const projectId = uuidv4();

    /* TODO Logic validations */

    await projectRepository.create({ id: projectId, ...projectInfo });

    return projectId;
  }

  async function getByProjectId(projectId) {
    return projectRepository.getByProjectId(projectId);
  }

  /**
   * Deletes an existing project
   *
   * @returns {Promise} uuid
   */
  async function remove(userId, projectId) {
    const creatorId = await projectRepository.getCreatorId(projectId);

    if (creatorId !== userId) {
      throw errors.Unauthorized(
        'You do not have permissions over the specified project.'
      );
    }

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
