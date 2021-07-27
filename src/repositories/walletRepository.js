module.exports = function $walletRepository(dbUtils, errors, knex, logger) {
  return {
    create,
    get,
    getUserId,
    remove
  };

  /**
   * Inserts a new wallet to the db
   *
   * @returns {Promise}
   */
  async function create(walletData) {
    return knex('wallets')
      .insert(dbUtils.mapToDb(walletData))
      .catch((err) => {
        if (err.code === '23505')
          throw errors.create(
            409,
            'There is an existing wallet of the user with specified id.'
          );

        logger.error(err);
        throw errors.UnknownError;
      });
  }

  /**
   * Generic get abstraction
   *
   * @returns {Promise}
   */
  async function get(userId) {
    const wallet = await knex('wallets')
      .where(dbUtils.mapToDb({ userId }))
      .then(dbUtils.mapFromDb);

    if (!wallet.length) {
      throw errors.create(404, 'There is no wallet of the specified user.');
    }

    return wallet[0];
  }

  /**
   * Gets the userId of a wallet, by its id.
   *
   * @param {String} walletId
   * @returns {Promise} userId
   */
  async function getUserId(walletId) {
    const userId = (
      await knex('wallets')
        .where(dbUtils.mapToDb({ walletId }))
        .select('user_id')
        .then(dbUtils.mapFromDb)
    )[0];

    if (!userId) {
      throw errors.create(
        404,
        `The wallet with id ${walletId} was not found in the database. UserId could not be retrieved.`
      );
    }

    return userId.userId;
  }

  /**
   * Removes a wallet with specified id
   *
   * @returns {Promise}
   */
  async function remove(userId) {
    const result = await knex('wallets')
      .where(dbUtils.mapToDb({ userId }))
      .del();

    if (!result) {
      throw errors.create(404, 'There is no user with the specified id.');
    }
  }
};
