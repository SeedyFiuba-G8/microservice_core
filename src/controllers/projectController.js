module.exports = function usersController(
  projectService,
  projectUtils,
  logger
) {
  return {
    create,
    getAll
  };

  /**
   * @returns {Promise}
   */
  async function create(req, res, next) {
    const projectInfo = req.body;

    /* TODO: Validate body is complete. */

    try {
      await projectService.create(projectInfo);
    } catch (err) {
      return next(err);
    }

    return res.status(201).send();
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

    return res
      .status(200)
      .json({
        projects: projects.map((project) =>
          projectUtils.buildProjectResponseObject(project)
        )
      });
  }
};
