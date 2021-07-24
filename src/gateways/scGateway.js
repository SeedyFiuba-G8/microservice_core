module.exports = function $scGateway(fetch, services, urlFactory) {
  return {
    createProject,
    createWallet,
    getProject,
    getWallet
  };

  // WALLETS
  function createWallet() {
    const url = urlFactory('/wallets', services.sc.baseUrl);

    return fetch(url, { method: 'POST' }).then(({ data }) => data);
  }

  function getWallet(walletId) {
    const url = urlFactory(`/wallets/${walletId}`, services.sc.baseUrl);

    return fetch(url, { method: 'GET' }).then(({ data }) => data);
  }

  // PROJECTS
  function createProject(projectInfo) {
    const url = urlFactory('/projects', services.sc.baseUrl);

    return fetch(url, { method: 'POST', body: projectInfo }).then(
      ({ data }) => data
    );
  }

  function getProject(txHash) {
    const url = urlFactory(`/projects/${txHash}`, services.sc.baseUrl);

    return fetch(url, { method: 'GET' }).then(({ data }) => data);
  }
};
