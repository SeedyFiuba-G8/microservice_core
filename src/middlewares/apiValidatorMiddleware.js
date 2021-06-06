const { OpenApiValidator } = require('express-openapi-validate');

module.exports = function $apiValidatorMiddleware(apiSpecs) {
  const validator = new OpenApiValidator(apiSpecs, {
    ajvOptions: {
      allErrors: true,
      removeAdditional: 'all'
    }
  });

  return validator.match();
};
