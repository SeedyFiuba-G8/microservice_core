module.exports = function $validationUtils(config, errors) {
  return {
    validateProjectInfo
  };

  /**
   * Validates that projectInfo respects the model constraints
   *
   * @param {Object} projectInfo
   *
   * @returns {Object} validatedProjectInfo
   */
  function validateProjectInfo(projectInfo) {
    Object.keys(config.constraints.project).forEach((field) => {
      if (projectInfo[field] === undefined) return;

      const minLength = config.constraints.project[field].min;
      const maxLength = config.constraints.project[field].max;

      if (!validLength(projectInfo[field], minLength, maxLength))
        throw errors.create(
          400,
          `${field} is invalid: its length must be within ${minLength} and ${maxLength} chars.`
        );
    });

    const validatedProjectInfo = { ...projectInfo };

    if (projectInfo.finalizedBy) {
      validatedProjectInfo.finalizedBy = new Date(projectInfo.finalizedBy);
      // eslint-disable-next-line
      if (isNaN(validatedProjectInfo.finalizedBy)) {
        throw errors.create(400, 'finalizedBy Date format is invalid.');
      }
    }

    return validatedProjectInfo;
  }

  function validLength(field, minLength, maxLength) {
    let valid = true;
    if (minLength !== undefined) valid = valid && field.length >= minLength;
    if (maxLength !== undefined) valid = valid && field.length <= maxLength;

    return valid;
  }
};
