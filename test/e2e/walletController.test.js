const supertest = require('supertest');
const containerFactory = require('../testContainerFactory');
const mockData = require('../support/mockedData');

const container = containerFactory.createContainer();

const { invalidUserId, userId, walletId, address } = mockData;

describe('walletController', () => {
  let request;
  let config;
  let errors;
  let walletRepository;
  let projectRepository;
  let spyWalletRepository;
  let spyProjectRepository;

  // API Keys
  let fakeApikey;
  let apikeyHeader;

  beforeEach(() => {
    spyWalletRepository = {};
    spyProjectRepository = {};
    request = supertest(container.get('app'));
    config = container.get('config');
    walletRepository = container.get('walletRepository');
    projectRepository = container.get('projectRepository');
    errors = container.get('errors');

    // API Keys
    fakeApikey = 'fake-apikey';
    apikeyHeader = config.services.apikeys.header;
  });

  describe('/wallets', () => {
    const path = '/wallets';
    const { dupUserId } = mockData;

    beforeEach(() => {
      spyWalletRepository.create = jest
        .spyOn(walletRepository, 'create')
        .mockImplementation((data) => {
          if (data.userId === dupUserId) {
            throw errors.create(409);
          }
        });
    });

    describe('POST', () => {
      describe('when a user creates a new wallet', () => {
        it('should return the transaction id and success code 201', () =>
          request
            .post(path)
            .set(apikeyHeader, fakeApikey)
            .send({ uid: userId })
            .expect(201, `"${address}"`));
      });

      describe('when an existing user requests for another wallet', () => {
        it('should return error code 409', () =>
          request
            .post(path)
            .set(apikeyHeader, fakeApikey)
            .send({ uid: dupUserId })
            .expect(409));
      });
    });
  });

  describe('/wallets/:userId', () => {
    const path = `/wallets/${userId}`;

    beforeEach(() => {
      spyWalletRepository.get = jest
        .spyOn(walletRepository, 'get')
        .mockImplementation((id) => {
          if (id === invalidUserId) {
            throw errors.create(404);
          }
          return { walletId };
        });
    });

    describe('GET', () => {
      describe('when a existing user´s wallets gets retrieved', () => {
        it('should return the information and code 200', () =>
          request
            .get(path)
            .set(apikeyHeader, fakeApikey)
            .expect(200, mockData.wallets.get.response));
      });

      describe('when an invalid user´s wallet is requested', () => {
        it('should return 404', () =>
          request
            .get(`/wallets/${invalidUserId}`)
            .set(apikeyHeader, fakeApikey)
            .expect(404));
      });
    });
  });

  describe('/wallets/:walletAddress/funds', () => {
    const path = `/wallets/${address}/funds`;

    beforeEach(() => {
      const aux = { walletId };
      spyWalletRepository.get = jest
        .spyOn(walletRepository, 'get')
        .mockImplementation(() => aux);
    });

    describe('POST', () => {
      describe('when a user extracts fund to a wallet address', () => {
        it('should return with code 200', () =>
          request
            .post(path)
            .set(apikeyHeader, fakeApikey)
            .set('uid', userId)
            .send(mockData.wallets.funds.post.body)
            .expect(200));
      });
    });
  });

  describe('/users/:userId/fundings', () => {
    const path = `/users/${userId}/fundings`;

    beforeEach(() => {
      const wid = { walletId };
      spyWalletRepository.get = jest
        .spyOn(walletRepository, 'get')
        .mockImplementation(() => wid);
      spyWalletRepository.getUserId = jest
        .spyOn(walletRepository, 'getUserId')
        .mockImplementation(() => userId);
      spyProjectRepository.getProjectId = jest
        .spyOn(projectRepository, 'getProjectId')
        .mockImplementation(() => mockData.projectId);
      spyProjectRepository.get = jest
        .spyOn(projectRepository, 'get')
        .mockImplementation(() => mockData.projects.get.response.projects);
    });
    describe('GET', () => {
      describe('when a user requests their funding activity', () => {
        it('should return a list of transactions and code 200', () =>
          request
            .get(path)
            .set(apikeyHeader, fakeApikey)
            .expect(200, mockData.users.fundings.get.response));
      });
    });
  });

  describe('/users/fundings', () => {
    const path = '/users/fundings';

    beforeEach(() => {
      const wid = { walletId };
      spyWalletRepository.get = jest
        .spyOn(walletRepository, 'get')
        .mockImplementation(() => wid);
      spyWalletRepository.getUserId = jest
        .spyOn(walletRepository, 'getUserId')
        .mockImplementation(() => userId);
      spyProjectRepository.getProjectId = jest
        .spyOn(projectRepository, 'getProjectId')
        .mockImplementation(() => mockData.projectId);
      spyProjectRepository.get = jest
        .spyOn(projectRepository, 'get')
        .mockImplementation(() => mockData.projects.get.response.projects);
    });

    describe('GET', () => {
      describe('when all fundings are requested', () => {
        it('should return the complete list and status 200', () =>
          request
            .get(path)
            .set(apikeyHeader, fakeApikey)
            .expect(200, mockData.users.fundings.get.response));
      });
    });
  });
});
