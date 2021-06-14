module.exports = function projectController(
  errors,
  projectService,
  projectUtils
) {
  return {
    create,
    get,
    getAll,
    remove
  };

  /**
   * @returns {Promise}
   */
  async function create(req, res, next) {
    let projectId;
    const projectInfo = req.body;

    projectInfo.finalizedBy = new Date(projectInfo.finalizedBy);

    /* TODO: Validate body is complete. */

    try {
      // eslint-disable-next-line
      if (isNaN(projectInfo.finalizedBy)) {
        throw errors.BadRequest('finalizedBy Date format is invalid.');
      }

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
   * Fetchs all projects data from db.
   *
   * If userId is specified in req.query, it gets all projects
   * created by that user. Else, it retrieves all projects.
   *
   * @returns {Promise}
   */
  async function getAll(req, res, next) {
    const { userId } = req.query;
    let projects;
    const method = userId ? 'getByUserId' : 'getAll';

    try {
      projects = await projectService[method](userId);
    } catch (err) {
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
