import { Request, Response, NextFunction } from 'express';

/**
 * RBAC Middleware
 * Checks if user has one of the required roles
 * Must be used AFTER authMiddleware
 */
export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Check if user is authenticated (should be attached by authMiddleware)
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
      return;
    }

    // Check if user has one of the allowed roles
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: 'Forbidden',
        message: `This action requires one of the following roles: ${allowedRoles.join(', ')}`,
      });
      return;
    }

    next();
  };
};

/**
 * Require specific single role
 */
export const requireAdminRole = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required',
    });
    return;
  }

  if (req.user.role !== 'ADMIN') {
    res.status(403).json({
      error: 'Forbidden',
      message: 'This action is only available to administrators',
    });
    return;
  }

  next();
};

export const requireContadorRole = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required',
    });
    return;
  }

  if (req.user.role !== 'CONTADOR' && req.user.role !== 'ADMIN') {
    res.status(403).json({
      error: 'Forbidden',
      message: 'This action is only available to accountants and administrators',
    });
    return;
  }

  next();
};

export const requireEmprersarioRole = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required',
    });
    return;
  }

  if (
    req.user.role !== 'EMPRESARIO' &&
    req.user.role !== 'CONTADOR' &&
    req.user.role !== 'ADMIN'
  ) {
    res.status(403).json({
      error: 'Forbidden',
      message: 'This action is not available',
    });
    return;
  }

  next();
};
