const _ = require('lodash');

module.exports = function $reviewerRepository(dbUtils, knex) {
  return {
    get,
    removeForProject,
    updateForProject
  };

  /**
   * Generic get for reviewers
   */
  async function get({ select, filters = {} } = {}) {
    return knex('reviewers')
      .select(_.isArray(select) ? dbUtils.mapToDb(select) : '*')
      .where(dbUtils.mapToDb(filters))
      .then(dbUtils.mapFromDb);
  }

  /**
   * Removes reviewers for project
   */
  async function removeForProject(projectId) {
    await knex('reviewers').where({ project_id: projectId }).del();
  }

  /**
   * Updates reviewers for project
   */
  async function updateForProject(projectId, newReviewers) {
    const promises = [];

    // Remove
    const removed = await removedReviewers(projectId, newReviewers);
    if (removed.length)
      promises.push(
        knex('reviewers')
          .where({ project_id: projectId })
          .whereIn('reviewer_id', _.union(removed, newReviewers))
          .del()
      );

    // Remove old statuses
    if (newReviewers.length)
      promises.push(
        knex('reviewers').insert(
          newReviewers.map((reviewer) => ({
            reviewer_id: reviewer,
            project_id: projectId,
            status: 'PENDING'
          }))
        )
      );

    await Promise.all(promises);
  }

  // Aux

  /**
   * Calculate removed reviewers
   */
  async function removedReviewers(projectId, newReviewers) {
    const removed = [];

    let pending = await get({
      select: ['reviewerId'],
      filters: { projectId, status: 'PENDING' }
    });

    pending = pending.map((reviewer) => reviewer.reviewerId);
    pending.forEach((reviewer) => {
      if (!newReviewers.includes(reviewer)) removed.push(reviewer);
    });

    return removed;
  }
};
