module.exports = function $tagRepository(knex) {
  return {
    getProjects,
    removeForProject,
    updateForProject
  };

  /**
   * Gets projects for an array of tags
   */
  async function getProjects(tags) {
    return knex('tags')
      .whereIn('tag', tags)
      .select('project_id')
      .then((results) => results.map((row) => row.project_id));
  }

  /**
   * Removes tags for project
   */
  async function removeForProject(projectId) {
    await knex('tags').where({ project_id: projectId }).del();
  }

  /**
   * Updates tags for project
   */
  async function updateForProject(projectId, tags) {
    // We remove existent tags for that project
    removeForProject(projectId);

    if (!tags.length) return;

    // We add new ones
    const rows = tags.map((tag) => ({
      tag,
      project_id: projectId
    }));

    await knex('tags').insert(rows);
  }
};
