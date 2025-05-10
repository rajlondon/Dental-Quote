/**
 * Base class for custom API errors
 */
export class ApiError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 400 Bad Request - Used when the client sends a request with invalid data
 */
export class BadRequestError extends ApiError {
  constructor(message = 'Bad request') {
    super(message, 400);
  }
}

/**
 * 401 Unauthorized - Used when authentication is required but failed or not provided
 */
export class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

/**
 * 403 Forbidden - Used when the authenticated user doesn't have permission
 */
export class ForbiddenError extends ApiError {
  constructor(message = 'Access forbidden') {
    super(message, 403);
  }
}

/**
 * 404 Not Found - Used when a resource is not found
 */
export class NotFoundError extends ApiError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

/**
 * 409 Conflict - Used when there's a conflict with current state of the resource
 */
export class ConflictError extends ApiError {
  constructor(message = 'Conflict with current state') {
    super(message, 409);
  }
}

/**
 * 422 Unprocessable Entity - Used when validation fails but request syntax is correct
 */
export class ValidationError extends ApiError {
  errors?: Record<string, string> | string[];
  
  constructor(message = 'Validation failed', errors?: Record<string, string> | string[]) {
    super(message, 422);
    this.errors = errors;
  }
}

/**
 * 500 Internal Server Error - Used for unexpected server errors
 */
export class InternalServerError extends ApiError {
  constructor(message = 'Internal server error') {
    super(message, 500);
  }
}