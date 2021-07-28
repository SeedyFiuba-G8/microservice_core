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
    const mergedTypes = new Set([...(interests || []), ...types]);

    return projectRepository.getMatchingIds(
      { tags: [...tags], types: [...mergedTypes] },
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
