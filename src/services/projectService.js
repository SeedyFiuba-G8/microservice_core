const { v4: uuidv4 } = require('uuid');

module.exports = function $projectService(
  errors,
  projectRepository,
  projectUtils,
  tagRepository,
  validationUtils
) {
  return {
    create,
    get,
    getPreviewsBy,
    update,
    remove
  };

  /**
   * Creates a new project
   *
   * @returns {Promise} uuid
   */
  async function create(userId, rawProjectInfo) {
    const projectInfo = projectUtils.buildProjectInfo(rawProjectInfo, true);
    validationUtils.validateProjectInfo(projectInfo);

    const id = uuidv4();
    const data = {
      id,
      userId,
      ...projectInfo
    };

    await projectRepository.create(data);
    await tagRepository.updateForProject(id, projectInfo.tags);

    return id;
  }

  /**
   * Fetchs project data of projectId
   *
   * @returns {Promise} Project
   */
  async function get(projectId) {
    console.log(
      `(projectService:get) calling projetRepository:get with: {
        filters: ${JSON.stringify({
          filters: {
            id: projectId
          }
        })}
      }`
    );
    const projects = await projectRepository.get({
      filters: {
        id: projectId
      }
    });
    console.log(
      `(projectService:get) projetRepository:get returned projects: ${JSON.stringify(
        projects
      )}`
    );

    if (!projects.length)
      throw errors.create(404, 'There is no project with the specified id.');

    return projects[0];
  }

  /**
   * Fetchs all projects that match filters,
   *
   * @returns {Promise} Project[]
   */
  async function getPreviewsBy(filters, limit, offset) {
    const previewFields = [
      'id',
      'title',
      'description',
      'type',
      'objective',
      'country',
      'city',
      'finalizedBy',
      'tags'
    ];

    console.log(
      `(projectService:getPreviewsBy) calling projetRepository:get with: {
        filters: ${JSON.stringify(filters)},
        select: ${JSON.stringify(previewFields)},
        limit: ${JSON.stringify(limit)},
        offset: ${JSON.stringify(offset)}
      }`
    );
    return projectRepository.get({
      filters,
      select: previewFields,
      limit,
      offset
    });
  }

  /**
   * Modifies project data
   *
   * @returns {Promise} Project
   */
  async function update(projectId, rawProjectInfo, requesterId) {
    const projectInfo = projectUtils.buildProjectInfo(rawProjectInfo);
    validationUtils.validateProjectInfo(projectInfo);

    await Promise.all([
      projectRepository.update(projectId, projectInfo, requesterId),
      tagRepository.updateForProject(projectId, projectInfo.tags)
    ]);

    return projectId;
  }

  /**
   * Deletes an existing project
   *
   * @returns {Promise} uuid
   */
  async function remove(projectId, requesterId) {
    await Promise.all([
      projectRepository.remove(projectId, requesterId),
      tagRepository.removeForProject(projectId)
    ]);

    return projectId;
  }
};
