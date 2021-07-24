const _ = require('lodash');

module.exports = function $walletController(expressify, walletService) {
  return expressify({
    create,
    get
  });

  /**
   * Creates a new wallet
   *
   * @returns {Promise}
   */
  async function create(req, res) {
    const userId = req.body.uid;
    const walletData = await walletService.create(userId);
    return res.status(201).json(walletData);
  }

  /**
   * Gets the information of a user's wallet by its id
   *
   * @returns {Promise}
   */
  async function get(req, res) {
    const { userId } = req.params;
    const walletData = await walletService.get(userId);
    return res.status(200).json(_.pick(walletData, ['address', 'balance']));
  }
};
