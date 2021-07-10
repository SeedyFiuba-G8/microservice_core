module.exports = function $validationUtils(config, errors) {
  return {
    validateProjectInfo
  };

  /**
   * Validates that projectInfo respects the model constraints
   */
  function validateProjectInfo(projectInfo) {
    Object.keys(config.constraints.project).forEach((field) => {
      if (projectInfo[field] === undefined) return;

      const { min: minLength, max: maxLength } =
        config.constraints.project[field];

      if (!validLength(projectInfo[field], minLength, maxLength))
        throw errors.create(
          400,
          `${field} is invalid: its length must be within ${minLength} and ${maxLength} chars.`
        );
    });

    // Tags validation

    const { max, maxTagLength } = config.constraints.tags;
    const { tags } = projectInfo;

    if (tags.length > max)
      throw errors.create(400, `Too many tags! Up to ${max} are allowed`);

    tags.forEach((tag) => {
      if (!validLength(tag, 0, maxTagLength))
        throw errors.create(
          400,
          `Tag too long. Its length must be less than ${maxTagLength}`
        );
    });
  }

  /**
   * Generic length validator
   */
  function validLength(field, minLength, maxLength) {
    let valid = true;
    if (minLength !== undefined) valid = valid && field.length >= minLength;
    if (maxLength !== undefined) valid = valid && field.length <= maxLength;

    return valid;
  }
};
