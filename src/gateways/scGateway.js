module.exports = function $scGateway(
  apikeys,
  apikeyUtils,
  fetch,
  services,
  urlFactory
) {
  return {
    setProjectLastCompletedStage,
    createProject,
    createWallet,
    fundProject,
    getProject,
    getWallet
  };

  // WALLETS
  async function createWallet() {
    const url = urlFactory('/wallets', services.sc.baseUrl);
    const { sc: apikey } = await apikeys;

    return fetch(url, {
      method: 'POST',
      headers: apikeyUtils.headers(apikey)
    }).then(({ data }) => data);
  }

  async function getWallet(walletId) {
    const url = urlFactory(`/wallets/${walletId}`, services.sc.baseUrl);
    const { sc: apikey } = await apikeys;

    return fetch(url, {
      method: 'GET',
      headers: apikeyUtils.headers(apikey)
    }).then(({ data }) => data);
  }

  // PROJECTS
  async function setProjectLastCompletedStage(
    reviewerWalletId,
    projectTxHash,
    newStage
  ) {
    const url = urlFactory(`/projects/${projectTxHash}`, services.sc.baseUrl);
    const { sc: apikey } = await apikeys;

    return fetch(url, {
      method: 'PATCH',
      body: { reviewerId: reviewerWalletId, completedStage: newStage },
      headers: apikeyUtils.headers(apikey)
    });
  }

  async function createProject(projectInfo) {
    const url = urlFactory('/projects', services.sc.baseUrl);
    const { sc: apikey } = await apikeys;

    return fetch(url, {
      method: 'POST',
      body: projectInfo,
      headers: apikeyUtils.headers(apikey)
    }).then(({ data }) => data);
  }

  async function fundProject(walletId, projectTxHash, amount) {
    const url = urlFactory(
      `/projects/${projectTxHash}/funds`,
      services.sc.baseUrl
    );
    const { sc: apikey } = await apikeys;

    return fetch(url, {
      method: 'POST',
      body: { walletId, amount },
      headers: apikeyUtils.headers(apikey)
    }).then(({ data }) => data);
  }

  async function getProject(txHash) {
    const url = urlFactory(`/projects/${txHash}`, services.sc.baseUrl);
    const { sc: apikey } = await apikeys;

    return fetch(url, {
      method: 'GET',
      headers: apikeyUtils.headers(apikey)
    }).then(({ data }) => data);
  }
};
