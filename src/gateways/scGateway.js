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
    getFundings,
    getAllFundings,
    getProject,
    getWallet,
    transfer,
    pushToken
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

  async function getFundings(walletId) {
    const url = urlFactory(
      `/wallets/${walletId}/fundings`,
      services.sc.baseUrl
    );
    const { sc: apikey } = await apikeys;

    return fetch(url, {
      method: 'GET',
      headers: apikeyUtils.headers(apikey)
    }).then(({ data }) => data);
  }

  async function getAllFundings() {
    const url = urlFactory(`/wallets/fundings`, services.sc.baseUrl);
    const { sc: apikey } = await apikeys;

    return fetch(url, {
      method: 'GET',
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

  async function transfer(walletId, address, amount) {
    const url = urlFactory(`/wallets/${address}/funds`, services.sc.baseUrl);
    const { sc: apikey } = await apikeys;

    return fetch(url, {
      method: 'POST',
      body: { walletId, amount },
      headers: apikeyUtils.headers(apikey)
    }).then(({ data }) => data);
  }

  async function pushToken(walletId, token) {
    const url = urlFactory(
      `/wallets/${walletId}/pushToken`,
      services.sc.baseUrl
    );
    const { sc: apikey } = await apikeys;

    return fetch(url, {
      method: 'POST',
      body: { token },
      headers: apikeyUtils.headers(apikey)
    }).then(({ data }) => data);
  }
};
