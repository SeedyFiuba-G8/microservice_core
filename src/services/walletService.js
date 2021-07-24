module.exports = function $walletService(scGateway, walletRepository) {
  return {
    create,
    get,
    getWalletId
  };

  async function create(userId) {
    const { walletId, address } = await scGateway.createWallet();
    await walletRepository.create({ userId, walletId });
    return address;
  }

  async function get(userId) {
    const walletId = await getWalletId(userId);
    const walletData = await scGateway.getWallet(walletId);
    return walletData;
  }

  async function getWalletId(userId) {
    const { walletId } = await walletRepository.get(userId);
    return walletId;
  }
};
