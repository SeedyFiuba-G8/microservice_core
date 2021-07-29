module.exports = function $validationUtils(config, errors) {
  return {
    validateProjectInfo,
    validateRating
  };

  function validateRating(rating) {
    if (rating <= 0 || rating > 5)
      throw errors.create(400, 'Invalid rating. It must be within 1-5!');
  }

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

    const { tags, reviewers, stages } = projectInfo;

    // Reviewers validation
    if (reviewers !== undefined) {
      const { max: maxReviewers } = config.constraints.reviewers;

      if (reviewers && reviewers.length > maxReviewers)
        throw errors.create(
          400,
          `Too many reviewers! Up to ${maxReviewers} are allowed`
        );
    }

    // Tags validation
    if (tags !== undefined) {
      const { max: maxTags, maxTagLength } = config.constraints.tags;

      if (tags.length > maxTags)
        throw errors.create(400, `Too many tags! Up to ${maxTags} are allowed`);

      tags.forEach((tag) => {
        if (!validLength(tag, 0, maxTagLength))
          throw errors.create(
            400,
            `Tag too long. Its length must be less than ${maxTagLength}`
          );
      });
    }

    // Stages validation
    if (stages !== undefined) {
      const { max: maxStages, maxDescriptionLength } =
        config.constraints.stages;

      if (stages.length > maxStages)
        throw errors.create(
          400,
          `Too many stages! Up to ${maxStages} are allowed`
        );

      stages.forEach((stage) => {
        if (!validLength(stage.description, 0, maxDescriptionLength))
          throw errors.create(
            400,
            `Stage description too long. Its length must be less than ${maxDescriptionLength}`
          );
      });
    }
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
