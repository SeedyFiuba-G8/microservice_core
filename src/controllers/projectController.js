const _ = require('lodash');

module.exports = function $projectController(
  errors,
  expressify,
  projectService,
  projectUtils
) {
  return expressify({
    create,
    get,
    getBy,
    modify,
    remove
  });

  /**
   * Creates a new project and returns its id
   *
   * @returns {Promise}
   */
  async function create(req, res) {
    const projectInfo = req.body;
    const parsedProjectInfo = parseProjectInfo(projectInfo);
    const id = await projectService.create(parsedProjectInfo);

    return res.status(200).json({ id });
  }

  /**
   * Gets a project by its id
   *
   * @returns {Promise}
   */
  async function get(req, res) {
    const { projectId } = req.params;
    const projectInfo = await projectService.getByProjectId(projectId);

    return res
      .status(200)
      .json(projectUtils.buildProjectResponseObject(projectInfo));
  }

  /**
   * Fetchs projects data from db that match filters specified in req.query.
   *
   * If no filters are specified, it retrieves all projects.
   *
   * @returns {Promise}
   */
  async function getBy(req, res) {
    const filters = parseFilters(req.query);

    const projects = await projectService.getBy(filters);

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
  async function modify(req, res) {
    const { projectId } = req.params;
    const { userId } = req.body;
    const newProjectInfo = _.omit(req.body, ['userId']);

    const parsedNewProjectInfo = parseProjectInfo(newProjectInfo);
    await projectService.modify(userId, projectId, parsedNewProjectInfo);

    return res.status(200).json({ id: projectId });
  }

  /**
   * Removes a project
   *
   * @returns {Promise}
   */
  async function remove(req, res) {
    const { projectId } = req.params;
    const { userId } = req.body;
    const deletedProjectId = await projectService.remove(userId, projectId);

    return res.status(200).json({ id: deletedProjectId });
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
        throw errors.create(404, 'finalizedBy Date format is invalid.');
      }
    }

    return parsedProjectInfo;
  }

  function parseFilters(filters) {
    const parsedFilters = _.pick(filters, ['userId', 'limit', 'offset']);

    /* TODO: Validate filters are coherent */

    return parsedFilters;
  }
};
