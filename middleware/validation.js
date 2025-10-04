const { bookValidation, publisherValidation } = require('../utils/validators');

// Middleware to validate request body
const validateBody = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors
      });
    }

    next();
  };
};

// Middleware to validate query parameters
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.query, { abortEarly: false });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        error: 'Query validation failed',
        details: errors
      });
    }

    next();
  };
};

// Middleware to validate request parameters (like ID)
const validateParams = (paramName, pattern = /^[0-9a-fA-F]{24}$/) => {
  return (req, res, next) => {
    const value = req.params[paramName];

    if (!pattern.test(value)) {
      return res.status(400).json({
        success: false,
        error: `Invalid ${paramName}`,
        message: `${paramName} must be a valid identifier`
      });
    }

    next();
  };
};

// Specific validation middleware for books
const validateBookCreation = validateBody(bookValidation.create);
const validateBookUpdate = validateBody(bookValidation.update);

// Specific validation middleware for publishers
const validatePublisherCreation = validateBody(publisherValidation.create);
const validatePublisherUpdate = validateBody(publisherValidation.update);

module.exports = {
  validateBody,
  validateQuery,
  validateParams,
  validateBookCreation,
  validateBookUpdate,
  validatePublisherCreation,
  validatePublisherUpdate
};
