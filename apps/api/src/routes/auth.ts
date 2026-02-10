import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { AuthService } from '../services/AuthService';
import { authMiddleware } from '../middleware/auth';

const router = Router();

/**
 * Rate limiting for auth endpoints
 * 5 failed attempts -> 15 minute lockout per IP
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per windowMs
  message: 'Too many authentication attempts, please try again after 15 minutes',
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  keyGenerator: (req) => req.ip || 'unknown', // Use IP address as key
  skip: (_req) => {
    // Skip rate limiting for successful login attempts by checking status
    return false;
  },
});

/**
 * POST /api/v1/auth/register
 * Register a new user
 */
router.post('/register', authLimiter, async (req: Request, res: Response) => {
  try {
    const { email, password, name, role } = req.body;

    // Validate required fields
    if (!email || !password || !name || !role) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Missing required fields: email, password, name, role',
      });
    }

    // Validate role
    if (!['ADMIN', 'CONTADOR', 'EMPRESARIO'].includes(role)) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid role. Must be ADMIN, CONTADOR, or EMPRESARIO',
      });
    }

    // Register user
    const result = await AuthService.register({
      email: email.toLowerCase().trim(),
      password,
      name: name.trim(),
      role,
    });

    if (!result.success) {
      return res.status(400).json({
        error: 'Registration Failed',
        message: result.error,
      });
    }

    return res.status(201).json({
      success: true,
      user: result.user,
      token: result.token,
      refreshToken: result.refreshToken,
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({
      error: 'Server Error',
      message: 'Registration failed',
    });
  }
});

/**
 * POST /api/v1/auth/login
 * Login with email and password
 */
router.post('/login', authLimiter, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Email and password are required',
      });
    }

    // Login user
    const result = await AuthService.login({
      email: email.toLowerCase().trim(),
      password,
    });

    if (!result.success) {
      return res.status(401).json({
        error: 'Authentication Failed',
        message: result.error,
      });
    }

    return res.status(200).json({
      success: true,
      user: result.user,
      token: result.token,
      refreshToken: result.refreshToken,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      error: 'Server Error',
      message: 'Login failed',
    });
  }
});

/**
 * POST /api/v1/auth/refresh
 * Refresh JWT token using refresh token
 */
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Refresh token is required',
      });
    }

    const result = await AuthService.refreshToken(refreshToken);

    if (!result.success) {
      return res.status(401).json({
        error: 'Token Refresh Failed',
        message: result.error,
      });
    }

    return res.status(200).json({
      success: true,
      token: result.token,
      refreshToken: result.refreshToken,
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    return res.status(500).json({
      error: 'Server Error',
      message: 'Token refresh failed',
    });
  }
});

/**
 * GET /api/v1/auth/session
 * Get current user session
 */
router.get('/session', authMiddleware, async (req: Request, res: Response) => {
  try {
    // User is already verified by authMiddleware
    return res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    console.error('Get session error:', error);
    return res.status(500).json({
      error: 'Server Error',
      message: 'Failed to get session',
    });
  }
});

/**
 * POST /api/v1/auth/logout
 * Logout user (client-side clearing of tokens)
 * This endpoint is primarily for audit logging
 */
router.post('/logout', authMiddleware, async (_req: Request, res: Response) => {
  try {
    // In a stateless JWT system, logout is handled by client clearing tokens
    // This endpoint can be used for audit logging, blacklist management, etc.

    // TODO: Add audit log entry for logout

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({
      error: 'Server Error',
      message: 'Logout failed',
    });
  }
});

/**
 * POST /api/v1/auth/forgot-password
 * Request password reset token
 */
router.post('/forgot-password', authLimiter, async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Email is required',
      });
    }

    // Request password reset
    const result = await AuthService.requestPasswordReset(email.toLowerCase().trim());

    // For security, always return success message even if email doesn't exist
    return res.status(200).json({
      success: true,
      message: 'If an account exists with this email, a password reset link will be sent',
      token: result.token, // Only send token in development/testing
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({
      error: 'Server Error',
      message: 'Password reset request failed',
    });
  }
});

/**
 * POST /api/v1/auth/reset-password
 * Reset password with token
 */
router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    // Validate required fields
    if (!token || !newPassword || !confirmPassword) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Token, newPassword, and confirmPassword are required',
      });
    }

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Passwords do not match',
      });
    }

    // Reset password
    const result = await AuthService.resetPassword(token, newPassword);

    if (!result.success) {
      return res.status(400).json({
        error: 'Password Reset Failed',
        message: result.error,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({
      error: 'Server Error',
      message: 'Password reset failed',
    });
  }
});

/**
 * POST /api/v1/auth/change-password
 * Change password (requires current password)
 */
router.post('/change-password', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;

    // Validate required fields
    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'All fields are required',
      });
    }

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'New passwords do not match',
      });
    }

    // Change password
    const result = await AuthService.changePassword(
      req.user!.id,
      oldPassword,
      newPassword
    );

    if (!result.success) {
      return res.status(400).json({
        error: 'Password Change Failed',
        message: result.error,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({
      error: 'Server Error',
      message: 'Password change failed',
    });
  }
});

export default router;
