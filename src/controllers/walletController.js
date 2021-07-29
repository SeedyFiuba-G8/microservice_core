const _ = require('lodash');

module.exports = function $walletController(expressify, walletService) {
  return expressify({
    create,
    get,
    getFundings,
    getAllFundings,
    transfer
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

  /**
   * Gets the information of a user's wallet fundings by its id
   *
   * @returns {Promise}
   */
  async function getFundings(req, res) {
    const { userId } = req.params;
    const fundings = await walletService.getFundings(userId);
    return res.status(200).json(fundings);
  }

  /**
   * Gets the information of all user's wallet fundings
   *
   * @returns {Promise}
   */
  async function getAllFundings(req, res) {
    const fundings = await walletService.getAllFundings();
    return res.status(200).json(fundings);
  }

  /**
   * Transfer funds of a user's wallet to an address specified
   *
   * @returns {Promise}
   */
  async function transfer(req, res) {
    const { uid } = req.headers;
    const { walletAddress } = req.params;
    const { amount } = req.body;
    const txHash = await walletService.transfer(uid, walletAddress, amount);
    return res.status(200).json({ txHash });
  }
};
