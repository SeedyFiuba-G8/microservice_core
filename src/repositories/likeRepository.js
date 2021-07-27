module.exports = function $likeRepository(dbUtils, errors, knex, logger) {
  return {
    add,
    check,
    countForProject,
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

        logger.error(err);
        throw errors.UnknownError;
      });
  }

  async function check(likeData) {
    const result = await knex('likes')
      .where(dbUtils.mapToDb(likeData))
      .select('*')
      .catch((err) => {
        logger.error(err);
        throw errors.UnknownError;
      });

    return !!result.length;
  }

  async function countForProject(projectId) {
    const result = await knex('likes')
      .where(dbUtils.mapToDb({ projectId }))
      .select('*')
      .catch((err) => {
        logger.error(err);
        throw errors.UnknownError;
      });

    return result.length;
  }

  async function remove(likeData) {
    logger.debug({
      message: 'Removing like from project',
      likeData
    });

    const result = await knex('likes')
      .where(dbUtils.mapToDb(likeData))
      .del()
      .catch((err) => {
        logger.error(err);
        throw errors.UnknownError;
      });

    if (!result) throw errors.create(409, 'Project was not liked');
  }
};
