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
  let ratingRepository;
  let reviewerRepository;
  let request;
  let res;
  let spyLikeRepository;
  let spyProjectRepository;
  let spyRatingRepository;
  let spyReviewerRepository;
  let spyTagRepository;
  let tagRepository;

  // API Keys
  let fakeApikey;
  let apikeyHeader;

  beforeEach(() => {
    spyLikeRepository = {};
    spyProjectRepository = {};
    spyRatingRepository = {};
    spyReviewerRepository = {};
    spyTagRepository = {};
    config = container.get('config');
    // errors = container.get('errors');
    eventRepository = container.get('eventRepository');
    likeRepository = container.get('likeRepository');
    mockData = container.get('mockData');
    projectRepository = container.get('projectRepository');
    ratingRepository = container.get('ratingRepository');
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

    describe('GET all projects', () => {
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
    describe('GET a project by id', () => {
      describe('when it exists', () => {
        const requesterId = '123e4567-e89b-12d3-a456-426614174002';
        const mockValues = {
          liked: true,
          likes: 4,
          rating: {
            samples: 25,
            mean: 3.6
          },
          rated: 3,
          reviewers: [
            {
              reviewerId: '123e4567-e89b-12d3-a456-426614174000',
              status: 'PENDING'
            }
          ]
        };

        beforeEach(async () => {
          spyProjectRepository.get = jest
            .spyOn(projectRepository, 'get')
            .mockResolvedValue([mockData.getProject]);
          spyReviewerRepository.get = jest
            .spyOn(reviewerRepository, 'get')
            .mockResolvedValue(mockValues.reviewers);
          spyLikeRepository.check = jest
            .spyOn(likeRepository, 'check')
            .mockResolvedValue(mockValues.liked);
          spyLikeRepository.countForProject = jest
            .spyOn(likeRepository, 'countForProject')
            .mockResolvedValue(mockValues.likes);
          spyRatingRepository.get = jest
            .spyOn(ratingRepository, 'get')
            .mockResolvedValue(mockValues.rated);
          spyRatingRepository.getForProject = jest
            .spyOn(ratingRepository, 'getForProject')
            .mockResolvedValue(mockValues.rating);

          res = await request
            .get(`${path}/${mockData.getProject.id}`)
            .set('uid', requesterId)
            .set(apikeyHeader, fakeApikey);
        });

        it('should respond with correct status and body', () => {
          expect(res.status).toEqual(200);
          expect(res.header['content-type']).toMatch(/json/);
          expect(res.body).toEqual({ ...mockData.getProject, ...mockValues });
        });

        it('should have called projectRepository once', () => {
          expect(spyProjectRepository.get).toHaveBeenCalledTimes(1);
          expect(spyProjectRepository.get).toHaveBeenCalledWith({
            filters: { id: mockData.getProject.id },
            limit: undefined,
            offset: undefined,
            select: undefined
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
    describe('PATCH', () => {
      describe('when we change the title, reviewers and tags of an existing DRAFT project', () => {
        const requesterId = '123e4567-e89b-12d3-a456-426614174000';
        const mockValues = {
          title: 'New title',
          reviewers: ['423e4567-e89b-12d3-a456-426614174000'],
          tags: ['programming']
        };

        beforeEach(async () => {
          spyProjectRepository.get = jest
            .spyOn(projectRepository, 'get')
            .mockResolvedValue([mockData.getProject]);
          spyProjectRepository.update = jest
            .spyOn(projectRepository, 'update')
            .mockResolvedValue();
          spyReviewerRepository.updateForProject = jest
            .spyOn(reviewerRepository, 'updateForProject')
            .mockResolvedValue();
          spyTagRepository.updateForProject = jest
            .spyOn(tagRepository, 'updateForProject')
            .mockResolvedValue();

          res = await request
            .patch(`${path}/${mockData.getProject.id}`)
            .set('uid', requesterId)
            .set(apikeyHeader, fakeApikey)
            .send(mockValues);
        });

        it('should respond with correct status and body', () => {
          expect(res.status).toEqual(200);
          expect(res.header['content-type']).toMatch(/json/);
          expect(res.body).toEqual({ id: mockData.getProject.id });
        });

        it('should have called projectRepository once', () => {
          expect(spyProjectRepository.get).toHaveBeenCalledTimes(2);
          expect(spyProjectRepository.get).toHaveBeenCalledWith({
            filters: { id: mockData.getProject.id },
            limit: undefined,
            offset: undefined,
            select: undefined
          });
        });
        it('should have called tagRepository once', () => {
          expect(spyTagRepository.updateForProject).toHaveBeenCalledTimes(1);
          expect(spyTagRepository.updateForProject).toHaveBeenCalledWith(
            mockData.getProject.id,
            mockValues.tags
          );
        });
        it('should have called reviewerRepository once', () => {
          expect(spyReviewerRepository.updateForProject).toHaveBeenCalledTimes(
            1
          );
          expect(spyReviewerRepository.updateForProject).toHaveBeenCalledWith(
            mockData.getProject.id,
            mockValues.reviewers
          );
        });
      });
    });
  });
});
