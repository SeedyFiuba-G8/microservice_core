const _ = require('lodash');

module.exports = function $walletService(scGateway, walletRepository) {
  return {
    create,
    get
  };

  async function create(userId) {
    const { walletId, address } = await scGateway.createWallet();
    await walletRepository.create({ userId, walletId });
    return address;
  }

  async function get(userId) {
    const { walletId } = await walletRepository.get(userId);
    const walletData = await scGateway.getWallet(walletId);
    return _.pick(walletData, ['address', 'balance']);
  }
};
