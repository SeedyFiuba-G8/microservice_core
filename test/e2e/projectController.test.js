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
  let scGateway;
  let spyLikeRepository;
  let spyProjectRepository;
  let spyRatingRepository;
  let spyReviewerRepository;
  let spyScGateway;
  let spyTagRepository;
  let spyWalletService;
  let tagRepository;
  let walletService;

  // API Keys
  let fakeApikey;
  let apikeyHeader;

  beforeEach(() => {
    spyLikeRepository = {};
    spyProjectRepository = {};
    spyRatingRepository = {};
    spyReviewerRepository = {};
    spyScGateway = {};
    spyTagRepository = {};
    spyWalletService = {};
    config = container.get('config');
    // errors = container.get('errors');
    eventRepository = container.get('eventRepository');
    likeRepository = container.get('likeRepository');
    mockData = container.get('mockData');
    projectRepository = container.get('projectRepository');
    ratingRepository = container.get('ratingRepository');
    reviewerRepository = container.get('reviewerRepository');
    scGateway = container.get('scGateway');
    tagRepository = container.get('tagRepository');
    walletService = container.get('walletService');
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

      describe('when an entrepeneur publishes a DRAFT project', () => {
        const requesterId = '123e4567-e89b-12d3-a456-426614174000';
        const mockValues = {
          status: 'FUNDING'
        };
        const walletId = 'walletId';
        const txHash = 'txHash';

        beforeEach(async () => {
          spyProjectRepository.get = jest
            .spyOn(projectRepository, 'get')
            .mockResolvedValue([mockData.getProject]);
          spyProjectRepository.updateBy = jest
            .spyOn(projectRepository, 'updateBy')
            .mockResolvedValue();
          spyProjectRepository.registerTxHash = jest
            .spyOn(projectRepository, 'registerTxHash')
            .mockResolvedValue();
          spyProjectRepository.update = jest
            .spyOn(projectRepository, 'update')
            .mockResolvedValue();
          spyReviewerRepository.get = jest
            .spyOn(reviewerRepository, 'get')
            .mockResolvedValue(
              mockData.getProject.reviewers.map((reviewer) => ({
                reviewerId: reviewer
              }))
            );
          spyScGateway.createProject = jest
            .spyOn(scGateway, 'createProject')
            .mockResolvedValue(txHash);
          spyReviewerRepository.removeForProject = jest
            .spyOn(reviewerRepository, 'removeForProject')
            .mockResolvedValue();
          spyWalletService.getWalletId = jest
            .spyOn(walletService, 'getWalletId')
            .mockResolvedValue(walletId);

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

        it('should have called projectRepository.get twice', () => {
          expect(spyProjectRepository.get).toHaveBeenCalledTimes(2);
          expect(spyProjectRepository.get).toHaveBeenCalledWith({
            filters: { id: mockData.getProject.id },
            limit: undefined,
            offset: undefined,
            select: undefined
          });
        });

        it('should have called reviewerRepository.get once', () => {
          expect(spyReviewerRepository.get).toHaveBeenCalledTimes(1);
          expect(spyReviewerRepository.get).toHaveBeenCalledWith({
            filters: { projectId: mockData.getProject.id, status: 'ACCEPTED' },
            select: ['reviewerId']
          });
        });

        it('should have called projectRepository.updateBy once', () => {
          expect(spyProjectRepository.updateBy).toHaveBeenCalledTimes(1);
          expect(spyProjectRepository.updateBy).toHaveBeenCalledWith(
            {
              id: mockData.getProject.id,
              status: 'DRAFT',
              userId: requesterId
            },
            {
              status: 'FUNDING',
              reviewerId: mockData.getProject.reviewers[0]
            }
          );
        });

        it('should have called scGateway.createProject once', () => {
          expect(spyScGateway.createProject).toHaveBeenCalledTimes(1);
          expect(spyScGateway.createProject).toHaveBeenCalledWith({
            ownerId: walletId,
            reviewerId: walletId,
            stagesCost: mockData.getProject.stages.map((stage) => stage.cost)
          });
        });

        it('should have called projectRepository.registerTxHash once', () => {
          expect(spyProjectRepository.registerTxHash).toHaveBeenCalledTimes(1);
          expect(spyProjectRepository.registerTxHash).toHaveBeenCalledWith(
            mockData.getProject.id,
            txHash
          );
        });

        it('should have called reviewerRepository.removeForProject once', () => {
          expect(spyReviewerRepository.removeForProject).toHaveBeenCalledTimes(
            1
          );
          expect(spyReviewerRepository.removeForProject).toHaveBeenCalledWith(
            mockData.getProject.id
          );
        });
      });
    });

    describe('DELETE', () => {
      describe('when it exists', () => {
        const requesterId = '123e4567-e89b-12d3-a456-426614174002';

        beforeEach(async () => {
          spyProjectRepository.get = jest
            .spyOn(projectRepository, 'get')
            .mockResolvedValue([mockData.getProject]);
          spyProjectRepository.remove = jest
            .spyOn(projectRepository, 'remove')
            .mockResolvedValue([mockData.getProject]);
          spyReviewerRepository.removeForProject = jest
            .spyOn(reviewerRepository, 'removeForProject')
            .mockResolvedValue();
          spyTagRepository.removeForProject = jest
            .spyOn(tagRepository, 'removeForProject')
            .mockResolvedValue();

          res = await request
            .delete(`${path}/${mockData.getProject.id}`)
            .set('uid', requesterId)
            .set(apikeyHeader, fakeApikey);
        });

        it('should respond with correct status and body', () => {
          expect(res.status).toEqual(200);
          expect(res.header['content-type']).toMatch(/json/);
          expect(res.body).toEqual({ id: mockData.getProject.id });
        });

        it('should have called projectRepository.get once', () => {
          expect(spyProjectRepository.get).toHaveBeenCalledTimes(2);
          expect(spyProjectRepository.get).toHaveBeenCalledWith({
            filters: { id: mockData.getProject.id },
            limit: undefined,
            offset: undefined,
            select: undefined
          });
        });

        it('should have called projectRepository.remove once', () => {
          expect(spyProjectRepository.remove).toHaveBeenCalledTimes(1);
          expect(spyProjectRepository.remove).toHaveBeenCalledWith(
            mockData.getProject.id,
            requesterId
          );
        });

        it('should have called reviewerRepository.removeForProject once', () => {
          expect(spyReviewerRepository.removeForProject).toHaveBeenCalledTimes(
            1
          );
          expect(spyReviewerRepository.removeForProject).toHaveBeenCalledWith(
            mockData.getProject.id
          );
        });

        it('should have called tagRepository.removeForProject once', () => {
          expect(spyTagRepository.removeForProject).toHaveBeenCalledTimes(1);
          expect(spyTagRepository.removeForProject).toHaveBeenCalledWith(
            mockData.getProject.id
          );
        });
      });
    });

    describe('POST funds', () => {
      describe('when we fund a project', () => {
        const requesterId = '123e4567-e89b-12d3-a456-426614174002';
        const walletId = 'walletId';
        const txHash = 'txHash';
        const amount = 0.001;

        beforeEach(async () => {
          spyProjectRepository.getTxHash = jest
            .spyOn(projectRepository, 'getTxHash')
            .mockResolvedValue(txHash);
          spyWalletService.getWalletId = jest
            .spyOn(walletService, 'getWalletId')
            .mockResolvedValue(walletId);
          spyScGateway.fundProject = jest
            .spyOn(scGateway, 'fundProject')
            .mockResolvedValue(txHash);

          res = await request
            .post(`${path}/${mockData.getFundingProject.id}/funds`)
            .set('uid', requesterId)
            .set(apikeyHeader, fakeApikey)
            .send({ amount });
        });

        it('should succeed with status 200', () => {
          expect(res.status).toEqual(200);
          expect(res.header['content-type']).toMatch(/json/);
          expect(res.body).toEqual({ txHash });
        });

        it('should have called projectRepository.getTxHash correctly', () => {
          expect(spyProjectRepository.getTxHash).toHaveBeenCalledTimes(1);
          expect(spyProjectRepository.getTxHash).toHaveBeenCalledWith(
            mockData.getFundingProject.id
          );
        });

        it('should have called walletService.getWalletId correctly', () => {
          expect(spyWalletService.getWalletId).toHaveBeenCalledTimes(1);
          expect(spyWalletService.getWalletId).toHaveBeenCalledWith(
            requesterId
          );
        });

        it('should have called scGateway.fundProject correctly', () => {
          expect(spyScGateway.fundProject).toHaveBeenCalledTimes(1);
          expect(spyScGateway.fundProject).toHaveBeenCalledWith(
            walletId,
            txHash,
            amount
          );
        });
      });
    });

    describe('BLOCK project', () => {
      describe('when and admin blocks a project', () => {
        const requesterId = '123e4567-e89b-12d3-a456-426614174002';

        beforeEach(async () => {
          spyProjectRepository.updateBy = jest
            .spyOn(projectRepository, 'updateBy')
            .mockResolvedValue();

          res = await request
            .post(`${path}/${mockData.getProject.id}/block`)
            .set('uid', requesterId)
            .set(apikeyHeader, fakeApikey);
        });

        it('should succeed with status 204', () => {
          expect(res.status).toEqual(204);
        });

        it('should have called projectRepository.updateBy correctly', () => {
          expect(spyProjectRepository.updateBy).toHaveBeenCalledTimes(1);
          expect(spyProjectRepository.updateBy).toHaveBeenCalledWith(
            {
              id: mockData.getProject.id,
              blocked: false
            },
            {
              blocked: true
            }
          );
        });
      });
    });

    describe('UNBLOCK project', () => {
      describe('when and admin unblocks a blocked project', () => {
        const requesterId = '123e4567-e89b-12d3-a456-426614174002';

        beforeEach(async () => {
          spyProjectRepository.updateBy = jest
            .spyOn(projectRepository, 'updateBy')
            .mockResolvedValue();

          res = await request
            .delete(`${path}/${mockData.getProject.id}/block`)
            .set('uid', requesterId)
            .set(apikeyHeader, fakeApikey);
        });

        it('should succeed with status 204', () => {
          expect(res.status).toEqual(204);
        });

        it('should have called projectRepository.updateBy correctly', () => {
          expect(spyProjectRepository.updateBy).toHaveBeenCalledTimes(1);
          expect(spyProjectRepository.updateBy).toHaveBeenCalledWith(
            {
              id: mockData.getProject.id,
              blocked: true
            },
            {
              blocked: false
            }
          );
        });
      });
    });

    describe('LIKE project', () => {
      describe('when a user likes a project', () => {
        const requesterId = '123e4567-e89b-12d3-a456-426614174002';

        beforeEach(async () => {
          spyLikeRepository.add = jest
            .spyOn(likeRepository, 'add')
            .mockResolvedValue();

          res = await request
            .post(`${path}/${mockData.getProject.id}/like`)
            .set('uid', requesterId)
            .set(apikeyHeader, fakeApikey);
        });

        it('should succeed with status 204', () => {
          expect(res.status).toEqual(204);
        });

        it('should have called likeRepository.add correctly', () => {
          expect(spyLikeRepository.add).toHaveBeenCalledTimes(1);
          expect(spyLikeRepository.add).toHaveBeenCalledWith({
            projectId: mockData.getProject.id,
            userId: requesterId
          });
        });
      });
    });

    describe('DISLIKE project', () => {
      describe('when a user dislikes a project', () => {
        const requesterId = '123e4567-e89b-12d3-a456-426614174002';

        beforeEach(async () => {
          spyLikeRepository.remove = jest
            .spyOn(likeRepository, 'remove')
            .mockResolvedValue();

          res = await request
            .delete(`${path}/${mockData.getProject.id}/like`)
            .set('uid', requesterId)
            .set(apikeyHeader, fakeApikey);
        });

        it('should succeed with status 204', () => {
          expect(res.status).toEqual(204);
        });

        it('should have called likeRepository.remove correctly', () => {
          expect(spyLikeRepository.remove).toHaveBeenCalledTimes(1);
          expect(spyLikeRepository.remove).toHaveBeenCalledWith({
            projectId: mockData.getProject.id,
            userId: requesterId
          });
        });
      });
    });

    describe("PUT project's rating", () => {
      describe('when a user rates a project', () => {
        const requesterId = '123e4567-e89b-12d3-a456-426614174002';
        const rating = 4;

        beforeEach(async () => {
          spyRatingRepository.patch = jest
            .spyOn(ratingRepository, 'patch')
            .mockResolvedValue();

          res = await request
            .put(`${path}/${mockData.getProject.id}/rating`)
            .set('uid', requesterId)
            .set(apikeyHeader, fakeApikey)
            .send({ rating });
        });

        it('should succeed with status 204', () => {
          expect(res.status).toEqual(204);
        });

        it('should have called ratingRepository.patch correctly', () => {
          expect(spyRatingRepository.patch).toHaveBeenCalledTimes(1);
          expect(spyRatingRepository.patch).toHaveBeenCalledWith({
            projectId: mockData.getProject.id,
            userId: requesterId,
            rating
          });
        });
      });
    });
  });
});
