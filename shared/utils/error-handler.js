const logger = require('./logger');

/**
 * Standardized error handler for Lambda functions
 * @param {Error} error - The error object
 * @param {string} context - Additional context information
 * @returns {Object} Standardized error response
 */
function errorHandler(error, context = '') {
  // Log the error with context
  logger.error(`Error in ${context}:`, {
    message: error.message,
    stack: error.stack,
    name: error.name
  });

  // Handle specific error types
  if (error.name === 'ValidationError') {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: 'Bad Request',
        message: error.message,
        details: error.details || null
      })
    };
  }

  if (error.name === 'NotFoundError') {
    return {
      statusCode: 404,
      body: JSON.stringify({
        error: 'Not Found',
        message: error.message
      })
    };
  }

  if (error.name === 'UnauthorizedError') {
    return {
      statusCode: 401,
      body: JSON.stringify({
        error: 'Unauthorized',
        message: error.message
      })
    };
  }

  if (error.name === 'ConflictError') {
    return {
      statusCode: 409,
      body: JSON.stringify({
        error: 'Conflict',
        message: error.message
      })
    };
  }

  // Default to 500 for unexpected errors
  return {
    statusCode: error.statusCode || 500,
    body: JSON.stringify({
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'production' 
        ? 'An unexpected error occurred' 
        : error.message
    })
  };
}

// Custom error classes for better error handling
class ValidationError extends Error {
  constructor(message, details = null) {
    super(message);
    this.name = 'ValidationError';
    this.details = details;
    this.statusCode = 400;
  }
}

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404;
  }
}

class UnauthorizedError extends Error {
  constructor(message) {
    super(message);
    this.name = 'UnauthorizedError';
    this.statusCode = 401;
  }
}

class ConflictError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ConflictError';
    this.statusCode = 409;
  }
}

module.exports = {
  errorHandler,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ConflictError
};