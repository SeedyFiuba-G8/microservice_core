module.exports = function $walletRepository(dbUtils, errors, knex, logger) {
  return {
    create,
    get,
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
    return wallet[0];
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
