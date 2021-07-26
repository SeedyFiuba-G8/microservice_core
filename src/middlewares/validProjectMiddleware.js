module.exports = function $validProjectMiddleware(errors, projectService) {
  return async function validProjectMiddleware(req, res, next) {
    const { projectId } = req.params;
    const { blocked } = await projectService.getSimpleProject(projectId);
    if (blocked)
      return next(
        errors.create(
          409,
          'Project is blocked! Contact an admin for more information.'
        )
      );

    return next();
  };
};
