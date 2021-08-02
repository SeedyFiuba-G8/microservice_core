const mockData = require('./mockedData');

module.exports = function mockFetch(config) {
  async function fetch(url, { method, body } = {}) {
    const { walletId, address } = mockData;

    switch (url) {
      // sc
      case `${config.services.sc.baseUrl}wallets`: {
        switch (method) {
          case 'POST': {
            switch (body) {
              case mockData.sc.wallets.post.body: {
                return { status: 201, data: mockData.sc.wallets.post.response };
              }
              default:
                break;
            }
            break;
          }

          default:
            return { status: 404, data: {} };
        }
        break;
      }

      case `${config.services.sc.baseUrl}wallets/${walletId}`: {
        return { status: 200, data: mockData.wallets.get.response };
      }

      case `${config.services.sc.baseUrl}wallets/${address}/funds`: {
        return {
          status: 200,
          data: '0x30b003c570eccaf1705acd4621f72993acb51715f8decbf61535f21376cfe1d2'
        };
      }

      case `${config.services.sc.baseUrl}wallets/${walletId}/fundings`: {
        return {
          status: 200,
          data: mockData.sc.wallets.fundings.get.response
        };
      }

      case `${config.services.sc.baseUrl}wallets/fundings`: {
        return {
          status: 200,
          data: mockData.sc.wallets.fundings.get.response
        };
      }

      default:
        // console.log('got fetch', method, url);
        return { status: 404, data: {} };
    }
    return { status: 404, data: {} };
  }
  return fetch;
};
