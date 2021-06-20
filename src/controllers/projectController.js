const _ = require('lodash');

module.exports = function $projectController(
  expressify,
  projectService,
  projectUtils,
  validationUtils
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
    const userId = req.headers.uid;
    const parsedProjectInfo = parseProjectInfo(projectInfo);

    const id = await projectService.create(userId, parsedProjectInfo);

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
    const userId = req.headers.uid;
    const changedProjectInfo = req.body;

    const parsedChangedProjectInfo = parseProjectInfo(changedProjectInfo);
    await projectService.modify(userId, projectId, parsedChangedProjectInfo);

    return res.status(200).json({ id: projectId });
  }

  /**
   * Removes a project
   *
   * @returns {Promise}
   */
  async function remove(req, res) {
    const { projectId } = req.params;
    const userId = req.headers.uid;

    const deletedProjectId = await projectService.remove(userId, projectId);

    return res.status(200).json({ id: deletedProjectId });
  }

  /**
   * Parse a project's info by picking the valid fields and validating them
   *
   * @param {Object} projectInfo
   *
   * @returns {Object} parsedProjectInfo
   */
  function parseProjectInfo(projectInfo) {
    const parsedProjectInfo = _.pick(projectInfo, [
      'title',
      'objective',
      'description',
      'type',
      'city',
      'country',
      'finalizedBy'
    ]);

    return validationUtils.validateProjectInfo(parsedProjectInfo);
  }

  /**
   * Parse the filters and pick the valid ones
   *
   * @param {Object} filters
   *
   * @returns {Object} parsedFilters
   */
  function parseFilters(filters) {
    const parsedFilters = _.pick(filters, ['userId', 'limit', 'offset']);

    return parsedFilters;
  }
};
