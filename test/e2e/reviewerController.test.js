const supertest = require('supertest');
const containerFactory = require('../testContainerFactory');
const mockData = require('../support/mockedData');
const { userId } = require('../support/mockedData');

const container = containerFactory.createContainer();

const { reviewerId } = mockData;

describe('reviewerController', () => {
  let request;
  let config;
  let reviewRepository;
  let projectRepository;

  let spyProjectRepository;
  let spyReviewRepository;

  // API Keys
  let fakeApikey;
  let apikeyHeader;

  beforeEach(() => {
    spyReviewRepository = {};
    spyProjectRepository = {};
    request = supertest(container.get('app'));
    config = container.get('config');
    reviewRepository = container.get('reviewerRepository');
    projectRepository = container.get('projectRepository');

    // API Keys
    fakeApikey = 'fake-apikey';
    apikeyHeader = config.services.apikeys.header;
  });

  describe('/reviewrequests/:reviewerId', () => {
    const path = `/reviewrequests/${reviewerId}`;

    beforeEach(() => {
      spyReviewRepository.get = jest
        .spyOn(reviewRepository, 'get')
        .mockImplementation(() => mockData.requests);
      spyProjectRepository.get = jest
        .spyOn(projectRepository, 'get')
        .mockImplementation(() => mockData.projects.get.response.requests);
    });

    describe('GET', () => {
      describe('when a user request for others review requests', () => {
        it('should return with error code 403', () =>
          request
            .get(path)
            .set(apikeyHeader, fakeApikey)
            .set('uid', userId)
            .expect(403));
      });

      describe('when a reviewer requests their review requests', () => {
        it('should return them with code 200', () =>
          request
            .get(path)
            .set(apikeyHeader, fakeApikey)
            .set('uid', reviewerId)
            .expect(200, mockData.reviewrequests.get.response));
      });
    });
  });

  // describe('/reviewrequests/:reviewerId/:projectId', () => {
  //   const path = `/reviewerequests/${reviewerId}/${projectId}`;
  //   describe('PUT', () => {});
  // });
});
