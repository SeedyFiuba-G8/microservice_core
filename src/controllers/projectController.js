const _ = require('lodash');

module.exports = function projectController(
  errors,
  projectService,
  projectUtils
) {
  return {
    create,
    get,
    getAll,
    modify,
    remove
  };

  /**
   * Creates a new project and returns its id
   *
   * @returns {Promise}
   */
  async function create(req, res, next) {
    let projectId;
    const projectInfo = req.body;

    try {
      const parsedProjectInfo = parseProjectInfo(projectInfo);
      projectId = await projectService.create(parsedProjectInfo);
    } catch (err) {
      return next(err);
    }

    return res.status(200).send({ id: projectId });
  }

  /**
   * Gets a project by its id
   *
   * @returns {Promise}
   */
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
   * Modifies an existing project and returns its id
   *
   * @returns {Promise}
   */
  async function modify(req, res, next) {
    const { projectId } = req.params;
    const { userId } = req.body;
    const newProjectInfo = _.omit(req.body, ['userId']);

    try {
      const parsedNewProjectInfo = parseProjectInfo(newProjectInfo);
      await projectService.modify(userId, projectId, parsedNewProjectInfo);
    } catch (err) {
      return next(err);
    }

    return res.status(200).send({ id: projectId });
  }

  /**
   * Removes a project
   *
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

  /* Possible migration of this function to a middleware in a future */
  function parseProjectInfo(projectInfo) {
    const parsedProjectInfo = _.pick(projectInfo, [
      'userId',
      'title',
      'objective',
      'description',
      'type',
      'city',
      'country',
      'finalizedBy'
    ]);

    /* TODO: Validate body is complete. */
    if (parsedProjectInfo.finalizedBy) {
      parsedProjectInfo.finalizedBy = new Date(projectInfo.finalizedBy);
      // eslint-disable-next-line
      if (isNaN(parsedProjectInfo.finalizedBy)) {
        throw errors.BadRequest('finalizedBy Date format is invalid.');
      }
    }

    return parsedProjectInfo;
  }
};
