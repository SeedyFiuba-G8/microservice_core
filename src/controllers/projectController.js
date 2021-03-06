const _ = require('lodash');

module.exports = function $projectController(expressify, projectService) {
  return expressify({
    // Create
    create,

    // Get
    get,
    getPreviewsBy,

    // Modify
    fund,
    update,
    remove,

    // Rating
    rate,

    // Likes
    like,
    dislike,

    // Block
    block,
    unblock
  });

  // CREATE -------------------------------------------------------------------

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

  // GET ----------------------------------------------------------------------

  /**
   * Gets a project by its id
   *
   * @returns {Promise}
   */
  async function get(req, res) {
    const { projectId } = req.params;
    const requesterId = req.headers.uid;
    const projectInfo = await projectService.get(projectId, requesterId);

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
    const requesterId = req.headers.uid;
    const {
      filters,
      limit,
      offset,
      onlyFavorites,
      near,
      recommended,
      interests
    } = parseFilters(req.query);

    const projects = await projectService.getPreviewsBy(
      { filters, limit, offset },
      { recommended, interests },
      near,
      onlyFavorites,
      requesterId
    );

    return res.status(200).json({ projects });
  }

  // MODIFY -------------------------------------------------------------------

  /**
   * Starts a project funding transaction, and returns it hash.
   *
   * @returns {Promise}
   */
  async function fund(req, res) {
    const { amount } = req.body;
    const { projectId } = req.params;
    const userId = req.headers.uid;

    const txHash = await projectService.fund(userId, projectId, amount);

    return res.status(200).json({ txHash });
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

  // RATING -------------------------------------------------------------------

  async function rate(req, res) {
    const { projectId } = req.params;
    const requesterId = req.headers.uid;
    const { rating } = req.body;

    await projectService.rate(projectId, rating, requesterId);

    return res.status(204).send();
  }

  // LIKES --------------------------------------------------------------------

  async function like(req, res) {
    const { projectId } = req.params;
    const requesterId = req.headers.uid;
    await projectService.like(projectId, requesterId);

    return res.status(204).send();
  }

  async function dislike(req, res) {
    const { projectId } = req.params;
    const requesterId = req.headers.uid;
    await projectService.dislike(projectId, requesterId);

    return res.status(204).send();
  }

  // BLOCK --------------------------------------------------------------------

  async function block(req, res) {
    const { projectId } = req.params;
    await projectService.block(projectId);

    return res.status(204).send();
  }

  async function unblock(req, res) {
    const { projectId } = req.params;
    await projectService.unblock(projectId);

    return res.status(204).send();
  }

  // AUX ----------------------------------------------------------------------

  /**
   * Parse the filters and pick the valid ones
   *
   * @param {Object} filters
   *
   * @returns {Object}
   */
  function parseFilters(filters) {
    const nearFields = _.pick(filters, ['lat', 'long', 'radius']);
    const near = !_.isEmpty(nearFields) ? nearFields : undefined;

    return _.omitBy(
      {
        filters: _.pick(filters, [
          'userId',
          'blocked',
          'type',
          'tags',
          'status',
          'reviewerId'
        ]),
        limit: _.get(filters, 'limit'),
        offset: _.get(filters, 'offset'),
        near,
        onlyFavorites: _.get(filters, 'onlyFavorites'),
        recommended: _.get(filters, 'recommended'),
        interests: _.get(filters, 'interests')
      },
      _.isUndefined
    );
  }
};
