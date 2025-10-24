/**
 * Error handling utilities and custom error classes
 */

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, message: string) {
    super(`${service} error: ${message}`, 502);
  }
}

/**
 * Error response interface
 */
export interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
  path?: string;
}

/**
 * Creates a standardized error response
 */
export const createErrorResponse = (
  error: Error | AppError,
  path?: string
): ErrorResponse => {
  const isAppError = error instanceof AppError;
  
  return {
    error: error.name || 'Error',
    message: error.message,
    statusCode: isAppError ? error.statusCode : 500,
    timestamp: new Date().toISOString(),
    ...(path && { path }),
  };
};

/**
 * Handles API errors and returns appropriate response
 */
export const handleApiError = (error: unknown, path?: string) => {
  console.error('API Error:', error);

  if (error instanceof AppError) {
    return {
      status: error.statusCode,
      body: createErrorResponse(error, path),
    };
  }

  if (error instanceof Error) {
    return {
      status: 500,
      body: createErrorResponse(error, path),
    };
  }

  return {
    status: 500,
    body: createErrorResponse(
      new AppError('An unexpected error occurred'),
      path
    ),
  };
};

/**
 * Async error wrapper for API routes
 */
export const asyncHandler = (fn: Function) => {
  return (req: any, res: any, ...args: any[]) => {
    return Promise.resolve(fn(req, res, ...args)).catch((error) => {
      const { status, body } = handleApiError(error, req.url);
      return res.status(status).json(body);
    });
  };
};

/**
 * Logs error with context
 */
export const logError = (error: Error, context?: Record<string, any>) => {
  console.error('Error occurred:', {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Checks if error is operational (expected) or programming error
 */
export const isOperationalError = (error: Error): boolean => {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
};
