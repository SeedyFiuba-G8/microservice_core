module.exports = function $tagRepository(knex) {
  return {
    removeForProject,
    updateForProject
  };

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

    // We add new ones
    const rows = tags.map((tag) => ({
      tag,
      project_id: projectId
    }));

    await knex('tags').insert(rows);
  }
};
