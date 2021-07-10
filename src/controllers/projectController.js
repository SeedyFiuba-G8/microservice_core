const _ = require('lodash');

module.exports = function $projectController(
  expressify,
  projectService,
  validationUtils
) {
  return expressify({
    create,
    get,
    getPreviewsBy,
    update,
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
    const id = await projectService.create(userId, projectInfo);

    return res.status(200).json({ id });
  }

  /**
   * Gets a project by its id
   *
   * @returns {Promise}
   */
  async function get(req, res) {
    const { projectId } = req.params;
    const projectInfo = await projectService.get(projectId);

    return res.status(200).json(projectInfo);
  }

  /**
   * Fetchs projects data from db that match filters specified in req.query.
   *
   * If no filters are specified, it retrieves all projects.
   *
   * @returns {Promise}
   */
  async function getPreviewsBy(req, res) {
    const { filters, limit, offset } = parseFilters(req.query);
    const projects = await projectService.getPreviewsBy(filters, limit, offset);

    return res.status(200).json({ projects });
  }

  /**
   * Modifies an existing project and returns its id
   *
   * @returns {Promise}
   */
  async function update(req, res) {
    const { projectId } = req.params;
    const requesterId = req.headers.uid;
    const newProjectInfo = req.body;

    await projectService.update(projectId, newProjectInfo, requesterId);

    return res.status(200).json({ id: projectId });
  }

  /**
   * Removes a project
   *
   * @returns {Promise}
   */
  async function remove(req, res) {
    const { projectId } = req.params;
    const requesterId = req.headers.uid;

    await projectService.remove(projectId, requesterId);

    return res.status(200).json({ id: projectId });
  }

  // Aux

  /**
   * Parse the filters and pick the valid ones
   *
   * @param {Object} filters
   *
   * @returns {Object}
   */
  function parseFilters(filters) {
    return {
      filters: _.pick(filters, ['userId']),
      limit: _.get(filters, 'limit'),
      offset: _.get(filters, 'offset')
    };
  }
};
