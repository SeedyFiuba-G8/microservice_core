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
      'reviewers'
    ]);

    // We make sure there are no duplicated tags
    if (projectInfo.tags) projectInfo.tags = _.uniq(projectInfo.tags);

    if (addFinalizationDate && projectInfo.finalizedBy) {
      projectInfo.finalizedBy = new Date(projectInfo.finalizedBy);

      // eslint-disable-next-line
      if (isNaN(projectInfo.finalizedBy))
        throw errors.create(400, 'finalizedBy Date format is invalid.');
    }

    return projectInfo;
  }
};
