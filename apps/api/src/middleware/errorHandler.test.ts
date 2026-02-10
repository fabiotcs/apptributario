/**
 * Error Handler Middleware Tests
 */
import { describe, it, expect } from 'vitest';
import { Errors, AppError } from '@/middleware/errorHandler';

describe('Error Handling', () => {
  describe('AppError class', () => {
    it('should create bad request error', () => {
      const err = Errors.badRequest('Invalid data');
      expect(err.status).toBe(400);
      expect(err.code).toBe('BAD_REQUEST');
      expect(err.message).toBe('Invalid data');
    });

    it('should create unauthorized error', () => {
      const err = Errors.unauthorized();
      expect(err.status).toBe(401);
      expect(err.code).toBe('UNAUTHORIZED');
    });

    it('should create forbidden error', () => {
      const err = Errors.forbidden();
      expect(err.status).toBe(403);
      expect(err.code).toBe('FORBIDDEN');
    });

    it('should create not found error', () => {
      const err = Errors.notFound('Company');
      expect(err.status).toBe(404);
      expect(err.message).toBe('Company not found');
    });

    it('should create conflict error', () => {
      const err = Errors.conflict('Email already exists');
      expect(err.status).toBe(409);
      expect(err.code).toBe('CONFLICT');
    });

    it('should create server error', () => {
      const err = Errors.serverError();
      expect(err.status).toBe(500);
      expect(err.code).toBe('INTERNAL_ERROR');
    });

    it('should support error details', () => {
      const details = { field: 'email' };
      const err = Errors.badRequest('Validation failed', details);
      expect(err.details).toEqual(details);
    });
  });

  describe('Error status codes', () => {
    it('should have correct HTTP status codes', () => {
      expect(Errors.badRequest('test').status).toBe(400);
      expect(Errors.unauthorized().status).toBe(401);
      expect(Errors.forbidden().status).toBe(403);
      expect(Errors.notFound('test').status).toBe(404);
      expect(Errors.conflict('test').status).toBe(409);
      expect(Errors.unprocessable('test').status).toBe(422);
      expect(Errors.tooMany().status).toBe(429);
      expect(Errors.serverError().status).toBe(500);
    });
  });

  describe('Validation errors', () => {
    it('should format validation errors correctly', () => {
      const fieldErrors = {
        email: ['Invalid email format'],
        password: ['Must be at least 8 characters'],
      };

      const err = Errors.badRequest('Validation failed', fieldErrors);
      expect(err.status).toBe(400);
      expect(err.details).toEqual(fieldErrors);
    });
  });

  describe('Error inheritance', () => {
    it('should extend Error class', () => {
      const err = Errors.badRequest('test');
      expect(err instanceof Error).toBe(true);
      expect(err instanceof AppError).toBe(true);
    });

    it('should have proper error properties', () => {
      const err = Errors.badRequest('Test message');
      expect(err.message).toBe('Test message');
      expect(err.status).toBe(400);
      expect(err.code).toBe('BAD_REQUEST');
    });
  });
});

describe('Advisory Error Cases', () => {
  it('should handle unauthorized advisory access', () => {
    const err = Errors.forbidden('Only assigned accountant can review');
    expect(err.status).toBe(403);
  });

  it('should handle advisory not found', () => {
    const err = Errors.notFound('Advisory request');
    expect(err.message).toBe('Advisory request not found');
  });

  it('should handle duplicate advisory request', () => {
    const err = Errors.conflict(
      'Advisory request already exists',
      { analysisId: 'analysis-123' }
    );
    expect(err.status).toBe(409);
  });

  it('should handle accountant unavailability', () => {
    const err = Errors.badRequest('Accountant is not available for assignment');
    expect(err.status).toBe(400);
  });
});
