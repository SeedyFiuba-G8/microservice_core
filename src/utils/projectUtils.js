const _ = require('lodash');

module.exports = function projectUtils(errors) {
  return {
    buildProjectInfo
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
      'stagesCost'
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
};
