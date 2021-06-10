module.exports = function projectUtils() {
  return {
    buildProjectObject,
    buildProjectResponseObject
  };

  function buildProjectObject(projectInfo) {
    return {
      id: projectInfo.id,
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

  function buildProjectResponseObject(project) {
    const projectRes = { ...project };
    projectRes.finalizedBy = project.finalizedBy.toString();
    projectRes.publishedOn = project.publishedOn.toString();
    return projectRes;
  }
};
