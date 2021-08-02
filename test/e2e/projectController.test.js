const _ = require('lodash');
const supertest = require('supertest');
const containerFactory = require('../testContainerFactory');

const container = containerFactory.createContainer();

describe('projectController', () => {
  let config;
  // let errors;
  let eventRepository;
  let likeRepository;
  let mockData;
  let projectRepository;
  let reviewerRepository;
  let request;
  let res;
  let spyLikeRepository;
  let spyProjectRepository;
  let spyReviewerRepository;
  let spyTagRepository;
  let tagRepository;

  // API Keys
  let fakeApikey;
  let apikeyHeader;

  beforeEach(() => {
    spyLikeRepository = {};
    spyProjectRepository = {};
    spyReviewerRepository = {};
    spyTagRepository = {};
    config = container.get('config');
    // errors = container.get('errors');
    eventRepository = container.get('eventRepository');
    likeRepository = container.get('likeRepository');
    mockData = container.get('mockData');
    projectRepository = container.get('projectRepository');
    reviewerRepository = container.get('reviewerRepository');
    tagRepository = container.get('tagRepository');
    request = supertest(container.get('app'));

    // API Keys
    fakeApikey = 'fake-apikey';
    apikeyHeader = config.services.apikeys.header;
  });

  beforeEach(() => {
    // Mock values for events
    jest.spyOn(eventRepository, 'log').mockImplementationOnce(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('/projects', () => {
    const path = '/projects';

    describe('GET', () => {
      describe('when there are projects', () => {
        const requesterId = '123e4567-e89b-12d3-a456-426614174002';

        beforeEach(async () => {
          spyProjectRepository.get = jest
            .spyOn(projectRepository, 'get')
            .mockReturnValue(mockData.projects);
          spyLikeRepository.check = jest
            .spyOn(likeRepository, 'check')
            .mockReturnValue(false);

          res = await request
            .get(path)
            .set('uid', requesterId)
            .set(apikeyHeader, fakeApikey);
        });

        it('should respond with correct status and body', () => {
          expect(res.status).toEqual(200);
          expect(res.header['content-type']).toMatch(/json/);
          expect(res.body).toEqual({ projects: mockData.projects });
        });

        it('should have called projectRepository once', () => {
          expect(spyProjectRepository.get).toHaveBeenCalledTimes(1);
          expect(spyProjectRepository.get).toHaveBeenCalledWith({
            filters: {},
            limit: undefined,
            offset: undefined,
            select: [
              'id',
              'status',
              'blocked',
              'title',
              'description',
              'type',
              'objective',
              'lat',
              'long',
              'finalizedBy',
              'tags',
              'coverPicUrl'
            ]
          });
        });
      });
    });

    describe('POST', () => {
      describe('when we create a new project', () => {
        const requesterId = '123e4567-e89b-12d3-a456-426614174002';

        beforeEach(async () => {
          spyProjectRepository.create = jest
            .spyOn(projectRepository, 'create')
            .mockResolvedValue();
          spyReviewerRepository.updateForProject = jest
            .spyOn(reviewerRepository, 'updateForProject')
            .mockResolvedValue();
          spyTagRepository.updateForProject = jest
            .spyOn(tagRepository, 'updateForProject')
            .mockResolvedValue();

          res = await request
            .post(path)
            .set('uid', requesterId)
            .set(apikeyHeader, fakeApikey)
            .send(mockData.postProject);
        });

        it('should succeed with status 200', () => {
          expect(res.status).toEqual(200);
        });

        it('should have called projectRepository.create correctly', () => {
          expect(spyProjectRepository.create).toHaveBeenCalledTimes(1);
          expect(spyProjectRepository.create).toHaveBeenCalledWith(
            expect.objectContaining({
              userId: requesterId,
              id: expect.any(String),
              ..._.omit(mockData.postProject, ['reviewers']),
              finalizedBy: new Date(mockData.postProject.finalizedBy)
            })
          );
        });
      });
    });
  });
});
