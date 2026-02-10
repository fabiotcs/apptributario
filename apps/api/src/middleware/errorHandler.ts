import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';

export interface ApiError extends Error {
  status?: number;
  code?: string;
  details?: any;
}

export class AppError extends Error implements ApiError {
  constructor(
    public status: number = 500,
    message: string = 'Internal Server Error',
    public code: string = 'INTERNAL_ERROR',
    public details?: any
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Global error handling middleware
 * Catches all errors and formats response
 */
export const errorHandler = (
  err: ApiError | Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const status = (err as ApiError).status || 500;
  const message = err.message || 'Internal Server Error';
  const code = (err as ApiError).code || 'INTERNAL_ERROR';
  const details = (err as ApiError).details;

  // Log error with context
  const errorLog = {
    timestamp: new Date().toISOString(),
    status,
    code,
    message,
    path: req.path,
    method: req.method,
    userId: (req as any).user?.id,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    body: req.body,
  };

  if (status >= 500) {
    logger.error('Server error:', errorLog, err.stack);
  } else {
    logger.warn('Client error:', errorLog);
  }

  // Send response
  res.status(status).json({
    error: true,
    code,
    message,
    status,
    ...(process.env.NODE_ENV === 'development' && { details, stack: err.stack }),
  });
};

/**
 * Async route wrapper to catch errors
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Common error constructors
 */
export const Errors = {
  badRequest: (message: string, details?: any) =>
    new AppError(400, message, 'BAD_REQUEST', details),

  unauthorized: (message: string = 'Unauthorized') =>
    new AppError(401, message, 'UNAUTHORIZED'),

  forbidden: (message: string = 'Access denied') =>
    new AppError(403, message, 'FORBIDDEN'),

  notFound: (resource: string = 'Resource') =>
    new AppError(404, `${resource} not found`, 'NOT_FOUND'),

  conflict: (message: string, details?: any) =>
    new AppError(409, message, 'CONFLICT', details),

  unprocessable: (message: string, details?: any) =>
    new AppError(422, message, 'UNPROCESSABLE_ENTITY', details),

  tooMany: (message: string = 'Too many requests') =>
    new AppError(429, message, 'TOO_MANY_REQUESTS'),

  serverError: (message: string = 'Internal server error', details?: any) =>
    new AppError(500, message, 'INTERNAL_ERROR', details),
};

/**
 * Validation error handler
 */
export const validationError = (
  fieldErrors: Record<string, string[]>
) => {
  return Errors.badRequest(
    'Validation failed',
    Object.entries(fieldErrors).reduce((acc, [field, messages]) => {
      acc[field] = messages[0]; // First error per field
      return acc;
    }, {} as Record<string, string>)
  );
};
