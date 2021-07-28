module.exports = function $notificationRepository(
  dbUtils,
  errors,
  knex,
  logger
) {
  return {
    get,
    push
  };

  function push(userId, token) {
    return knex('notification_tokens')
      .insert(dbUtils.mapToDb({ userId, token }))
      .catch((err) => {
        if (err.code === '23505') {
          // Row already exists. We do nothing.
          return;
        }
        logger.error(err);
        throw errors.UnknownError;
      });
  }

  function get(userId) {
    return knex('notification_tokens')
      .where(dbUtils.mapToDb({ userId }))
      .select('token')
      .then(dbUtils.mapFromDb)
      .then((tokens) => tokens.map((token) => token.token));
  }
};
