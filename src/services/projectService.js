const { v4: uuidv4 } = require('uuid');

module.exports = function $projectService(errors, projectRepository) {
  return {
    create,
    getBy,
    getByProjectId,
    modify,
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

  /**
   * Fetchs all projects that match filters.
   * If no filters specified, it fetches all projects.
   *
   * @returns {Promise} Project[]
   */
  async function getBy(filters) {
    return projectRepository.getBy(filters);
  }

  /**
   * Fetchs project data of projectId
   *
   * @returns {Promise} Project
   */
  async function getByProjectId(projectId) {
    return projectRepository.getByProjectId(projectId);
  }

  /**
   * Modifies project data
   *
   * @returns {Promise} Project
   */
  async function modify(userId, projectId, newProjectInfo) {
    await checkPermissionsOverProject(userId, projectId);

    return projectRepository.update(projectId, newProjectInfo);
  }

  /**
   * Deletes an existing project
   *
   * @returns {Promise} uuid
   */
  async function remove(userId, projectId) {
    await checkPermissionsOverProject(userId, projectId);

    return projectRepository.remove(projectId);
  }

  async function checkPermissionsOverProject(userId, projectId) {
    const creatorId = await projectRepository.getUserId(projectId);

    if (creatorId !== userId) {
      throw errors.create(
        403,
        'You do not have permissions over the specified project.'
      );
    }
  }
};
