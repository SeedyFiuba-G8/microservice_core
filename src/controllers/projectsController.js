module.exports = function usersController(
  projectsService,
  projectsUtils,
  logger
) {
  return {
    getAll
  };

  /**
   * Fetchs all projects data from db
   *
   * @returns {Promise}
   */
  async function getAll(req, res, next) {
    let allProjects;

    try {
      allProjects = await projectsService.getAll();
    } catch (err) {
      logger.warn('projectsService.getAll:', err);
      err.status = 409;
      err.name = 'Error in projectsService.getAll';
      return next(err);
    }

    const response = {
      projects: allProjects
    };

    response.projects = response.projects.map(projectsUtils.buildProjectObject);

    return res.status(200).json(response);
  }
};
