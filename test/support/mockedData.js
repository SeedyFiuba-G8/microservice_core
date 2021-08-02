const walletId = '12345678-0000-0000-0000-000000000000';
const address = '0xf018Be4Fe4fBD4cA1B1162A44bB139a343C2087b';
const userId = '12345678-0000-0000-1111-000000000000';
const dupUserId = '12345678-0000-0000-2222-000000000000';
const invalidUserId = '12345678-0000-0000-ffff-ffffffffffff';
const projectId = '123e4567-e89b-12d3-a456-426614174000';

module.exports = {
  userId,
  dupUserId,
  walletId,
  address,
  invalidUserId,
  projectId,
  duplicatedWalletData: {
    userId: '123e4567-e89b-12d3-a456-426614174000',
    walletId: 'a-duplicated-wallet-id'
  },
  wallets: {
    get: {
      response: {
        address,
        balance: 0.0001
      }
    },
    funds: {
      post: {
        body: { amount: 0.00001 }
      }
    }
  },
  projects: {
    get: {
      response: {
        projects: [{ title: 'Some title', type: 'test', status: 'FUNDING' }]
      }
    }
  },
  users: {
    fundings: {
      get: {
        response: [
          {
            userId,
            projectId,
            date: '2021-06-13T21:29:29.330Z',
            amount: 0.000001,
            txHash:
              '0x30b003c570eccaf1705acd4621f72993acb51715f8decbf61535f21376cfe1d2',
            title: 'Some title',
            type: 'test',
            status: 'FUNDING'
          }
        ]
      }
    }
  },
  sc: {
    wallets: {
      post: {
        body: undefined,
        response: { address, walletId }
      },
      fundings: {
        get: {
          response: [
            {
              walletId,
              txHash:
                '0x30b003c570eccaf1705acd4621f72993acb51715f8decbf61535f21376cfe1d2',
              projectId,
              amount: 0.000001,
              date: '2021-06-13T21:29:29.330Z'
            }
          ]
        }
      }
    }
  }
};
