module.exports = function $likeRepository(dbUtils, errors, knex) {
  return {
    add,
    check,
    countForProject,
    getProjectsForUser,
    remove
  };

  async function add(likeData) {
    await knex('likes')
      .insert(dbUtils.mapToDb(likeData))
      .catch((err) => {
        if (err.code === '23503')
          // Project not valid
          throw errors.create(
            404,
            'There is no project with the specified id.'
          );

        if (err.code === '23505')
          // Row already exists
          throw errors.create(409, 'Project is already liked.');

        throw err;
      });
  }

  async function check(likeData) {
    const result = await knex('likes')
      .where(dbUtils.mapToDb(likeData))
      .select('*');
    return !!result.length;
  }

  async function countForProject(projectId) {
    const result = await knex('likes')
      .where(dbUtils.mapToDb({ projectId }))
      .select('*');
    return result.length;
  }

  async function getProjectsForUser(userId) {
    return knex('likes')
      .select(['project_id'])
      .where(dbUtils.mapToDb({ userId }))
      .then(dbUtils.mapFromDb)
      .then((res) => res.map(({ projectId }) => projectId));
  }

  async function remove(likeData) {
    const result = await knex('likes').where(dbUtils.mapToDb(likeData)).del();
    if (!result) throw errors.create(409, 'Project was not liked');
  }
};
