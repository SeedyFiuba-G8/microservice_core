module.exports = function $tagRepository(knex, logger) {
  return {
    getProjects,
    removeForProject,
    updateForProject
  };

  /**
   * Gets projects for an array of tags
   */
  async function getProjects(tags) {
    logger.debug({
      message: 'Searching projects by tags',
      tags
    });

    return knex('tags')
      .whereIn('tag', tags)
      .select('project_id')
      .then((results) => results.map((row) => row.project_id));
  }

  /**
   * Removes tags for project
   */
  async function removeForProject(projectId) {
    logger.debug({
      message: 'Removing tags for project',
      project: {
        id: projectId
      }
    });

    await knex('tags').where({ project_id: projectId }).del();
  }

  /**
   * Updates tags for project
   */
  async function updateForProject(projectId, tags) {
    logger.debug({
      message: 'Updating tags for project',
      project: {
        id: projectId
      },
      tags
    });

    // We remove existent tags for that project
    removeForProject(projectId);

    // We add new ones
    const rows = tags.map((tag) => ({
      tag,
      project_id: projectId
    }));

    await knex('tags').insert(rows);
  }
};
