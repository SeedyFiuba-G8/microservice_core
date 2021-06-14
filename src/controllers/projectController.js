module.exports = function projectController(
  projectService,
  projectUtils,
  logger
) {
  return {
    create,
    getAll,
    get,
    remove
  };

  /**
   * @returns {Promise}
   */
  async function create(req, res, next) {
    let projectId;
    const projectInfo = req.body;

    /* TODO: Validate body is complete. */

    try {
      projectId = await projectService.create(projectInfo);
    } catch (err) {
      return next(err);
    }

    return res.status(200).send({ id: projectId });
  }

  async function get(req, res, next) {
    const { projectId } = req.params;
    let projectInfo;

    try {
      projectInfo = await projectService.getByProjectId(projectId);
    } catch (err) {
      return next(err);
    }

    return res
      .status(200)
      .send(projectUtils.buildProjectResponseObject(projectInfo));
  }

  /**
   * Fetchs all projects data from db
   *
   * @returns {Promise}
   */
  async function getAll(req, res, next) {
    let projects;

    try {
      projects = await projectService.getAll();
    } catch (err) {
      logger.warn('projectsService.getAll:', err);
      err.status = 409;
      err.name = 'Error in projectsService.getAll';
      return next(err);
    }

    return res.status(200).json({
      projects: projects.map((project) =>
        projectUtils.buildProjectResponseObject(project)
      )
    });
  }

  /**
   * @returns {Promise}
   */
  async function remove(req, res, next) {
    const { projectId } = req.params;
    const { userId } = req.body;
    let deletedProjectId;

    try {
      deletedProjectId = await projectService.remove(userId, projectId);
    } catch (err) {
      return next(err);
    }

    return res.status(200).send({ id: deletedProjectId });
  }
};
