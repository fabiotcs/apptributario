import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../lib/db';
import { EmailService } from './EmailService';

interface JwtPayload {
  id: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

interface CreateUserInput {
  email: string;
  password: string;
  name: string;
  role: 'ADMIN' | 'CONTADOR' | 'EMPRESARIO';
}

interface LoginInput {
  email: string;
  password: string;
}

interface AuthResponse {
  success: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  token?: string;
  refreshToken?: string;
  error?: string;
}

interface ResetTokenPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

/**
 * AuthService
 * Handles password hashing, JWT generation, and authentication logic
 */
export class AuthService {
  private static JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';
  private static JWT_EXPIRY = '7d';
  private static REFRESH_TOKEN_EXPIRY = '30d';
  private static BCRYPT_SALT_ROUNDS = 10;
  private static PASSWORD_RESET_EXPIRY = '24h';

  /**
   * Hash a password using bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.BCRYPT_SALT_ROUNDS);
  }

  /**
   * Verify a password against a hash
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Validate password strength
   * Requirements:
   * - Minimum 8 characters
   * - At least 1 uppercase letter
   * - At least 1 lowercase letter
   * - At least 1 number
   * - At least 1 special character
   */
  static validatePasswordStrength(password: string): { valid: boolean; message?: string } {
    if (password.length < 8) {
      return { valid: false, message: 'Password must be at least 8 characters' };
    }
    if (!/[A-Z]/.test(password)) {
      return { valid: false, message: 'Password must contain at least 1 uppercase letter' };
    }
    if (!/[a-z]/.test(password)) {
      return { valid: false, message: 'Password must contain at least 1 lowercase letter' };
    }
    if (!/[0-9]/.test(password)) {
      return { valid: false, message: 'Password must contain at least 1 number' };
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return { valid: false, message: 'Password must contain at least 1 special character' };
    }
    return { valid: true };
  }

  /**
   * Generate JWT token
   */
  static generateToken(payload: JwtPayload, expiresIn: string | number = this.JWT_EXPIRY): string {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const options: any = { expiresIn };
    return jwt.sign(payload, this.JWT_SECRET, options);
  }

  /**
   * Generate refresh token
   */
  static generateRefreshToken(payload: JwtPayload): string {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const options: any = { expiresIn: this.REFRESH_TOKEN_EXPIRY };
    return jwt.sign(payload, this.JWT_SECRET, options);
  }

  /**
   * Generate password reset token
   */
  static generatePasswordResetToken(payload: ResetTokenPayload): string {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const options: any = { expiresIn: this.PASSWORD_RESET_EXPIRY };
    return jwt.sign(payload, this.JWT_SECRET, options);
  }

  /**
   * Verify and decode JWT token
   */
  static verifyToken(token: string): JwtPayload | null {
    try {
      return jwt.verify(token, this.JWT_SECRET) as JwtPayload;
    } catch (error) {
      return null;
    }
  }

  /**
   * Verify and decode password reset token
   */
  static verifyPasswordResetToken(token: string): ResetTokenPayload | null {
    try {
      return jwt.verify(token, this.JWT_SECRET) as ResetTokenPayload;
    } catch (error) {
      return null;
    }
  }

  /**
   * Register a new user
   */
  static async register(input: CreateUserInput): Promise<AuthResponse> {
    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(input.email)) {
        return { success: false, error: 'Invalid email format' };
      }

      // Validate password strength
      const passwordValidation = this.validatePasswordStrength(input.password);
      if (!passwordValidation.valid) {
        return { success: false, error: passwordValidation.message };
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: input.email },
      });

      if (existingUser) {
        return { success: false, error: 'User with this email already exists' };
      }

      // Hash password
      const passwordHash = await this.hashPassword(input.password);

      // Create user
      const user = await prisma.user.create({
        data: {
          email: input.email,
          passwordHash,
          name: input.name,
          role: input.role,
        },
      });

      // Send welcome email (fire and forget)
      EmailService.sendWelcomeEmail(user.email, user.name, user.role).catch(
        (err) => console.error('Failed to send welcome email:', err)
      );

      // Generate tokens
      const tokenPayload: JwtPayload = {
        id: user.id,
        email: user.email,
        role: user.role,
      };

      const token = this.generateToken(tokenPayload);
      const refreshToken = this.generateRefreshToken(tokenPayload);

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token,
        refreshToken,
      };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Registration failed' };
    }
  }

  /**
   * Login with email and password
   */
  static async login(input: LoginInput): Promise<AuthResponse> {
    try {
      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email: input.email },
      });

      if (!user) {
        return { success: false, error: 'Invalid email or password' };
      }

      // Verify password
      const isPasswordValid = await this.verifyPassword(input.password, user.passwordHash);

      if (!isPasswordValid) {
        return { success: false, error: 'Invalid email or password' };
      }

      // Check if account is active
      if (user.role === 'ADMIN' || user.role === 'CONTADOR' || user.role === 'EMPRESARIO') {
        // Generate tokens
        const tokenPayload: JwtPayload = {
          id: user.id,
          email: user.email,
          role: user.role,
        };

        const token = this.generateToken(tokenPayload);
        const refreshToken = this.generateRefreshToken(tokenPayload);

        return {
          success: true,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
          token,
          refreshToken,
        };
      }

      return { success: false, error: 'Invalid user role' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed' };
    }
  }

  /**
   * Refresh JWT token using refresh token
   */
  static async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      const payload = this.verifyToken(refreshToken);

      if (!payload) {
        return { success: false, error: 'Invalid or expired refresh token' };
      }

      // Verify user still exists
      const user = await prisma.user.findUnique({
        where: { id: payload.id },
      });

      if (!user) {
        return { success: false, error: 'User not found' };
      }

      // Generate new token
      const newTokenPayload: JwtPayload = {
        id: user.id,
        email: user.email,
        role: user.role,
      };

      const newToken = this.generateToken(newTokenPayload);

      return {
        success: true,
        token: newToken,
        refreshToken, // Refresh token can be reused
      };
    } catch (error) {
      console.error('Token refresh error:', error);
      return { success: false, error: 'Token refresh failed' };
    }
  }

  /**
   * Initiate password reset
   */
  static async requestPasswordReset(email: string): Promise<{ success: boolean; token?: string; error?: string }> {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        // For security, don't reveal if email exists
        return { success: true };
      }

      // Generate password reset token
      const resetToken = this.generatePasswordResetToken({
        userId: user.id,
        email: user.email,
      });

      // Send password reset email (fire and forget)
      EmailService.sendPasswordResetEmail(user.email, user.name, resetToken).catch(
        (err) => console.error('Failed to send password reset email:', err)
      );

      return {
        success: true,
        token: resetToken, // In development, return token for testing
      };
    } catch (error) {
      console.error('Password reset request error:', error);
      return { success: false, error: 'Password reset request failed' };
    }
  }

  /**
   * Reset password with token
   */
  static async resetPassword(
    token: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Verify reset token
      const payload = this.verifyPasswordResetToken(token);

      if (!payload) {
        return { success: false, error: 'Invalid or expired reset token' };
      }

      // Validate new password strength
      const passwordValidation = this.validatePasswordStrength(newPassword);
      if (!passwordValidation.valid) {
        return { success: false, error: passwordValidation.message };
      }

      // Hash new password
      const passwordHash = await this.hashPassword(newPassword);

      // Update user password
      await prisma.user.update({
        where: { id: payload.userId },
        data: { passwordHash },
      });

      return { success: true };
    } catch (error) {
      console.error('Password reset error:', error);
      return { success: false, error: 'Password reset failed' };
    }
  }

  /**
   * Change password (requires old password)
   */
  static async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return { success: false, error: 'User not found' };
      }

      // Verify old password
      const isOldPasswordValid = await this.verifyPassword(oldPassword, user.passwordHash);

      if (!isOldPasswordValid) {
        return { success: false, error: 'Current password is incorrect' };
      }

      // Validate new password strength
      const passwordValidation = this.validatePasswordStrength(newPassword);
      if (!passwordValidation.valid) {
        return { success: false, error: passwordValidation.message };
      }

      // Check that new password is different from old
      if (oldPassword === newPassword) {
        return { success: false, error: 'New password must be different from current password' };
      }

      // Hash new password
      const passwordHash = await this.hashPassword(newPassword);

      // Update password
      await prisma.user.update({
        where: { id: userId },
        data: { passwordHash },
      });

      return { success: true };
    } catch (error) {
      console.error('Change password error:', error);
      return { success: false, error: 'Password change failed' };
    }
  }
}
