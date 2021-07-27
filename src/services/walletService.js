module.exports = function $walletService(
  logger,
  projectRepository,
  scGateway,
  walletRepository
) {
  return {
    create,
    get,
    getFundings,
    getAllFundings,
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

  async function getFundings(userId) {
    const walletId = await getWalletId(userId);
    const fundings = await scGateway.getFundings(walletId).then(mapFundings);
    return fundings;
  }

  async function getAllFundings() {
    const fundings = await scGateway.getAllFundings().then(mapFundings);
    return fundings;
  }

  async function getWalletId(userId) {
    const { walletId } = await walletRepository.get(userId);
    return walletId;
  }

  // HELPER FUNCTIONS
  /**
   * Maps the fundings received from the sc microservice to the core API
   */
  async function mapFundings(fundings) {
    return (await Promise.all(fundings.map(mapFunding))).filter(Boolean);
  }

  async function mapFunding(funding) {
    let projectId;
    let userId;
    const { date, amount, txHash } = funding;

    try {
      projectId = await projectRepository.getProjectId(funding.projectId);
      userId = await walletRepository.getUserId(funding.walletId);
    } catch (err) {
      logger.warn(
        'There are projects in the smart contract that are not in core database'
      );
      return undefined;
    }

    return { userId, projectId, date, amount, txHash };
  }
};
