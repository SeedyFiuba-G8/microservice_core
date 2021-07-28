module.exports = function $recommendationService(
  logger,
  projectRepository,
  likeRepository
) {
  return {
    recommendFor
  };

  async function recommendFor(userId, interests) {
    logger.debug({
      mesasge: 'Recommendation services called',
      user: {
        id: userId,
        interests
      }
    });

    // Fetch projects that user liked to get useful info
    const likedProjectIds = await likeRepository.getProjectsForUser(userId);

    const projects = await projectRepository.getByIdOrUser(
      {
        projectIds: likedProjectIds,
        userId
      },
      ['type', 'tags']
    );

    const { tags, types } = projects.reduce(projectsReducer, {
      tags: new Set(),
      types: new Set()
    });

    const mergeWithInterests = (data) => [
      ...new Set([...(interests || []), ...data])
    ];

    return projectRepository.getMatchingIds(
      { tags: mergeWithInterests(tags), types: mergeWithInterests(types) },
      userId
    );
  }

  // Aux

  function projectsReducer({ tags, types }, { tags: newTags, type: newType }) {
    return {
      tags: new Set([...tags, ...newTags]),
      types: new Set([...types, newType])
    };
  }
};
