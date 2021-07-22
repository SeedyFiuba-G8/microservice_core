module.exports = function $scGateway(fetch, services, urlFactory) {
  return {
    createWallet,
    getWallet
  };

  function createWallet() {
    const url = urlFactory('/wallets', services.sc.baseUrl);

    return fetch(url, { method: 'POST' }).then(({ data }) => data);
  }

  function getWallet(walletId) {
    const url = urlFactory(`/wallets/${walletId}`, services.sc.baseUrl);

    return fetch(url, { method: 'GET' }).then(({ data }) => data);
  }
};
