module.exports = function projectsUtils() {
  function buildProjectObject(projectInfo) {
    return {
      id: projectInfo.id,
      title: projectInfo.title,
      description: projectInfo.description,
      type: projectInfo.type,
      objective: projectInfo.objective,
      country: projectInfo.country,
      city: projectInfo.city,
      published_on: projectInfo.published_on, // Posible mapeo futuro a Date
      finalized_by: projectInfo.finalized_by // Posible mapeo futuro a Date
    };
  }

  return {
    buildProjectObject
  };
};
