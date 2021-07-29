const _ = require('lodash');

module.exports = function projectUtils(errors) {
  const previewFields = [
    'id',
    'status',
    'blocked',
    'title',
    'description',
    'type',
    'objective',
    'country',
    'city',
    'finalizedBy',
    'tags',
    'coverPicUrl'
  ];

  return {
    buildProjectInfo,
    getIdsToFilter,
    previewFields
  };

  /**
   * Parse a project's info by picking the valid fields and validating them
   *
   * @returns {Object}
   */
  function buildProjectInfo(rawProjectInfo, addFinalizationDate = false) {
    const projectInfo = _.pick(rawProjectInfo, [
      'title',
      'objective',
      'description',
      'type',
      'city',
      'country',
      'finalizedBy',
      'tags',
      'reviewers',
      'coverPicUrl',
      'stages'
    ]);

    // We make sure there are no duplicated tags
    if (projectInfo.tags) projectInfo.tags = _.uniq(projectInfo.tags);

    if (addFinalizationDate && projectInfo.finalizedBy) {
      const finalizedByDate = new Date(projectInfo.finalizedBy);

      // eslint-disable-next-line
      if (isNaN(finalizedByDate))
        throw errors.create(400, 'finalizedBy Date format is invalid.');

      if (finalizedByDate < new Date())
        throw errors.create(400, 'finalizedBy Date is in the past!');

      projectInfo.finalizedBy = finalizedByDate;
    }

    return projectInfo;
  }

  function getIdsToFilter(recommendedProjectIds, tagSearchProjectIds) {
    if (
      recommendedProjectIds === undefined &&
      tagSearchProjectIds === undefined
    )
      return undefined;

    return _.union(
      recommendedProjectIds?.length > 0 ? recommendedProjectIds : [],
      tagSearchProjectIds?.length > 0 ? tagSearchProjectIds : []
    );
  }
};
