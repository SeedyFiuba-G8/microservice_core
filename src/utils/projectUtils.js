module.exports = function projectUtils() {
  return {
    buildProjectObject
  };

  function buildProjectObject(projectInfo) {
    return {
      id: projectInfo.id,
      userId: projectInfo.user_id,
      title: projectInfo.title,
      description: projectInfo.description,
      type: projectInfo.type,
      objective: projectInfo.objective,
      country: projectInfo.country,
      city: projectInfo.city,
      publishedOn: projectInfo.published_on,
      finalizedBy: projectInfo.finalized_by
    };
  }
};
