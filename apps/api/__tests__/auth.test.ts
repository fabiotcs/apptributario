import { AuthService } from '../src/services/AuthService';

/**
 * Authentication Service Tests
 * Tests for password hashing, JWT generation, and auth logic
 */

describe('AuthService', () => {
  // ============================================================================
  // PASSWORD HASHING & VALIDATION TESTS
  // ============================================================================

  describe('Password Hashing', () => {
    test('should hash password with bcrypt', async () => {
      const password = 'TestPassword123!';
      const hash = await AuthService.hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(0);
    });

    test('should generate different hashes for same password', async () => {
      const password = 'TestPassword123!';
      const hash1 = await AuthService.hashPassword(password);
      const hash2 = await AuthService.hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });

    test('should verify correct password', async () => {
      const password = 'TestPassword123!';
      const hash = await AuthService.hashPassword(password);
      const isValid = await AuthService.verifyPassword(password, hash);

      expect(isValid).toBe(true);
    });

    test('should reject incorrect password', async () => {
      const password = 'TestPassword123!';
      const wrongPassword = 'WrongPassword123!';
      const hash = await AuthService.hashPassword(password);
      const isValid = await AuthService.verifyPassword(wrongPassword, hash);

      expect(isValid).toBe(false);
    });
  });

  // ============================================================================
  // PASSWORD STRENGTH VALIDATION TESTS
  // ============================================================================

  describe('Password Strength Validation', () => {
    test('should reject password less than 8 characters', () => {
      const result = AuthService.validatePasswordStrength('Pass1!');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('8 characters');
    });

    test('should reject password without uppercase letter', () => {
      const result = AuthService.validatePasswordStrength('password123!');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('uppercase');
    });

    test('should reject password without lowercase letter', () => {
      const result = AuthService.validatePasswordStrength('PASSWORD123!');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('lowercase');
    });

    test('should reject password without number', () => {
      const result = AuthService.validatePasswordStrength('Password!');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('number');
    });

    test('should reject password without special character', () => {
      const result = AuthService.validatePasswordStrength('Password123');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('special character');
    });

    test('should accept strong password', () => {
      const result = AuthService.validatePasswordStrength('StrongPass123!');
      expect(result.valid).toBe(true);
      expect(result.message).toBeUndefined();
    });

    test('should accept password with various special characters', () => {
      const passwords = [
        'Test@Pass1',
        'Test#Pass1',
        'Test$Pass1',
        'Test%Pass1',
        'Test_Pass1',
        'Test-Pass1',
      ];

      passwords.forEach((password) => {
        const result = AuthService.validatePasswordStrength(password);
        expect(result.valid).toBe(true);
      });
    });
  });

  // ============================================================================
  // JWT TOKEN GENERATION & VERIFICATION TESTS
  // ============================================================================

  describe('JWT Token Generation', () => {
    test('should generate valid JWT token', () => {
      const payload = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'EMPRESARIO',
      };

      const token = AuthService.generateToken(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3); // JWT format: header.payload.signature
    });

    test('should generate valid tokens with correct payload', () => {
      const payload = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'EMPRESARIO',
      };

      const token1 = AuthService.generateToken(payload);
      const decoded1 = AuthService.verifyToken(token1);

      expect(decoded1).toBeDefined();
      expect(decoded1?.id).toBe('user-123');
      expect(decoded1?.role).toBe('EMPRESARIO');
    });

    test('should generate refresh token', () => {
      const payload = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'EMPRESARIO',
      };

      const refreshToken = AuthService.generateRefreshToken(payload);

      expect(refreshToken).toBeDefined();
      expect(typeof refreshToken).toBe('string');
      expect(refreshToken.split('.').length).toBe(3);
    });

    test('should generate password reset token', () => {
      const payload = {
        userId: 'user-123',
        email: 'test@example.com',
      };

      const resetToken = AuthService.generatePasswordResetToken(payload);

      expect(resetToken).toBeDefined();
      expect(typeof resetToken).toBe('string');
      expect(resetToken.split('.').length).toBe(3);
    });
  });

  // ============================================================================
  // JWT TOKEN VERIFICATION TESTS
  // ============================================================================

  describe('JWT Token Verification', () => {
    test('should verify valid token and decode payload', () => {
      const payload = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'ADMIN',
      };

      const token = AuthService.generateToken(payload);
      const decoded = AuthService.verifyToken(token);

      expect(decoded).toBeDefined();
      expect(decoded?.id).toBe('user-123');
      expect(decoded?.email).toBe('test@example.com');
      expect(decoded?.role).toBe('ADMIN');
    });

    test('should return null for invalid token', () => {
      const invalidToken = 'invalid.token.here';
      const decoded = AuthService.verifyToken(invalidToken);

      expect(decoded).toBeNull();
    });

    test('should return null for tampered token', () => {
      const payload = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'EMPRESARIO',
      };

      const token = AuthService.generateToken(payload);
      const tamperedToken = token + 'tampered';
      const decoded = AuthService.verifyToken(tamperedToken);

      expect(decoded).toBeNull();
    });

    test('should verify password reset token', () => {
      const payload = {
        userId: 'user-123',
        email: 'test@example.com',
      };

      const resetToken = AuthService.generatePasswordResetToken(payload);
      const decoded = AuthService.verifyPasswordResetToken(resetToken);

      expect(decoded).toBeDefined();
      expect(decoded?.userId).toBe('user-123');
      expect(decoded?.email).toBe('test@example.com');
    });

    test('should return null for invalid reset token', () => {
      const invalidToken = 'invalid.reset.token';
      const decoded = AuthService.verifyPasswordResetToken(invalidToken);

      expect(decoded).toBeNull();
    });
  });

  // ============================================================================
  // INTEGRATION TESTS (with database)
  // ============================================================================

  describe('User Registration', () => {
    test('should successfully register new user', async () => {
      const input = {
        email: `test-${Date.now()}@example.com`,
        password: 'StrongPass123!',
        name: 'Test User',
        role: 'EMPRESARIO' as const,
      };

      const result = await AuthService.register(input);

      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user?.email).toBe(input.email);
      expect(result.user?.name).toBe(input.name);
      expect(result.user?.role).toBe(input.role);
      expect(result.token).toBeDefined();
      expect(result.refreshToken).toBeDefined();

      // Cleanup
      if (result.user) {
        // In a real test, we'd delete the user here
        // await prisma.user.delete({ where: { id: result.user.id } });
      }
    });

    test('should reject duplicate email', async () => {
      const email = `duplicate-${Date.now()}@example.com`;

      // Create first user
      const result1 = await AuthService.register({
        email,
        password: 'StrongPass123!',
        name: 'User 1',
        role: 'EMPRESARIO',
      });

      expect(result1.success).toBe(true);

      // Try to create user with same email
      const result2 = await AuthService.register({
        email,
        password: 'StrongPass123!',
        name: 'User 2',
        role: 'CONTADOR',
      });

      expect(result2.success).toBe(false);
      expect(result2.error).toContain('already exists');

      // Cleanup
      if (result1.user) {
        // await prisma.user.delete({ where: { id: result1.user.id } });
      }
    });

    test('should reject weak password', async () => {
      const result = await AuthService.register({
        email: `test-${Date.now()}@example.com`,
        password: 'weak',
        name: 'Test User',
        role: 'EMPRESARIO',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('should reject invalid email', async () => {
      const result = await AuthService.register({
        email: 'invalid-email',
        password: 'StrongPass123!',
        name: 'Test User',
        role: 'EMPRESARIO',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid email');
    });
  });

  describe('User Login', () => {
    test('should successfully login with valid credentials', async () => {
      const email = `login-test-${Date.now()}@example.com`;
      const password = 'StrongPass123!';

      // Create user first
      const registerResult = await AuthService.register({
        email,
        password,
        name: 'Test User',
        role: 'EMPRESARIO',
      });

      expect(registerResult.success).toBe(true);

      // Login
      const loginResult = await AuthService.login({
        email,
        password,
      });

      expect(loginResult.success).toBe(true);
      expect(loginResult.user).toBeDefined();
      expect(loginResult.user?.email).toBe(email);
      expect(loginResult.token).toBeDefined();
      expect(loginResult.refreshToken).toBeDefined();

      // Cleanup
      if (registerResult.user) {
        // await prisma.user.delete({ where: { id: registerResult.user.id } });
      }
    });

    test('should reject login with wrong password', async () => {
      const email = `wrong-pass-${Date.now()}@example.com`;
      const password = 'StrongPass123!';

      // Create user
      const registerResult = await AuthService.register({
        email,
        password,
        name: 'Test User',
        role: 'EMPRESARIO',
      });

      expect(registerResult.success).toBe(true);

      // Try to login with wrong password
      const loginResult = await AuthService.login({
        email,
        password: 'WrongPassword123!',
      });

      expect(loginResult.success).toBe(false);
      expect(loginResult.error).toContain('Invalid');

      // Cleanup
      if (registerResult.user) {
        // await prisma.user.delete({ where: { id: registerResult.user.id } });
      }
    });

    test('should reject login with non-existent email', async () => {
      const result = await AuthService.login({
        email: 'nonexistent@example.com',
        password: 'SomePassword123!',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid');
    });
  });

  describe('Token Refresh', () => {
    test('should refresh token with valid refresh token', async () => {
      const email = `refresh-${Date.now()}@example.com`;
      const password = 'StrongPass123!';

      // Register and login
      const registerResult = await AuthService.register({
        email,
        password,
        name: 'Test User',
        role: 'EMPRESARIO',
      });

      expect(registerResult.success).toBe(true);
      expect(registerResult.refreshToken).toBeDefined();

      // Refresh token
      const refreshResult = await AuthService.refreshToken(registerResult.refreshToken!);

      expect(refreshResult.success).toBe(true);
      expect(refreshResult.token).toBeDefined();

      // Verify new token has valid payload
      const decoded = AuthService.verifyToken(refreshResult.token!);
      expect(decoded).toBeDefined();
      expect(decoded?.id).toBe(registerResult.user?.id);

      // Cleanup
      if (registerResult.user) {
        // await prisma.user.delete({ where: { id: registerResult.user.id } });
      }
    });

    test('should reject invalid refresh token', async () => {
      const result = await AuthService.refreshToken('invalid.refresh.token');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Password Reset', () => {
    test('should successfully request password reset', async () => {
      const email = `reset-${Date.now()}@example.com`;
      const password = 'StrongPass123!';

      // Create user
      const registerResult = await AuthService.register({
        email,
        password,
        name: 'Test User',
        role: 'EMPRESARIO',
      });

      expect(registerResult.success).toBe(true);

      // Request reset
      const resetRequest = await AuthService.requestPasswordReset(email);

      expect(resetRequest.success).toBe(true);
      expect(resetRequest.token).toBeDefined();

      // Cleanup
      if (registerResult.user) {
        // await prisma.user.delete({ where: { id: registerResult.user.id } });
      }
    });

    test('should reset password with valid token', async () => {
      const email = `reset-pass-${Date.now()}@example.com`;
      const oldPassword = 'StrongPass123!';
      const newPassword = 'NewPassword456!';

      // Create user
      const registerResult = await AuthService.register({
        email,
        password: oldPassword,
        name: 'Test User',
        role: 'EMPRESARIO',
      });

      expect(registerResult.success).toBe(true);

      // Request reset
      const resetRequest = await AuthService.requestPasswordReset(email);
      expect(resetRequest.token).toBeDefined();

      // Reset password
      const resetResult = await AuthService.resetPassword(
        resetRequest.token!,
        newPassword
      );

      expect(resetResult.success).toBe(true);

      // Try to login with new password
      const loginResult = await AuthService.login({
        email,
        password: newPassword,
      });

      expect(loginResult.success).toBe(true);

      // Cleanup
      if (registerResult.user) {
        // await prisma.user.delete({ where: { id: registerResult.user.id } });
      }
    });

    test('should reject reset with invalid token', async () => {
      const result = await AuthService.resetPassword(
        'invalid.reset.token',
        'NewPassword456!'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Change Password', () => {
    test('should change password with correct old password', async () => {
      const email = `change-pass-${Date.now()}@example.com`;
      const oldPassword = 'StrongPass123!';
      const newPassword = 'NewPassword456!';

      // Create user
      const registerResult = await AuthService.register({
        email,
        password: oldPassword,
        name: 'Test User',
        role: 'EMPRESARIO',
      });

      expect(registerResult.success).toBe(true);

      // Change password
      const changeResult = await AuthService.changePassword(
        registerResult.user!.id,
        oldPassword,
        newPassword
      );

      expect(changeResult.success).toBe(true);

      // Try to login with new password
      const loginResult = await AuthService.login({
        email,
        password: newPassword,
      });

      expect(loginResult.success).toBe(true);

      // Cleanup
      if (registerResult.user) {
        // await prisma.user.delete({ where: { id: registerResult.user.id } });
      }
    });

    test('should reject change password with wrong old password', async () => {
      const email = `wrong-old-${Date.now()}@example.com`;
      const password = 'StrongPass123!';

      // Create user
      const registerResult = await AuthService.register({
        email,
        password,
        name: 'Test User',
        role: 'EMPRESARIO',
      });

      expect(registerResult.success).toBe(true);

      // Try to change with wrong old password
      const changeResult = await AuthService.changePassword(
        registerResult.user!.id,
        'WrongPassword123!',
        'NewPassword456!'
      );

      expect(changeResult.success).toBe(false);
      expect(changeResult.error).toContain('incorrect');

      // Cleanup
      if (registerResult.user) {
        // await prisma.user.delete({ where: { id: registerResult.user.id } });
      }
    });

    test('should reject if new password same as old password', async () => {
      const email = `same-pass-${Date.now()}@example.com`;
      const password = 'StrongPass123!';

      // Create user
      const registerResult = await AuthService.register({
        email,
        password,
        name: 'Test User',
        role: 'EMPRESARIO',
      });

      expect(registerResult.success).toBe(true);

      // Try to change to same password
      const changeResult = await AuthService.changePassword(
        registerResult.user!.id,
        password,
        password
      );

      expect(changeResult.success).toBe(false);
      expect(changeResult.error).toContain('different');

      // Cleanup
      if (registerResult.user) {
        // await prisma.user.delete({ where: { id: registerResult.user.id } });
      }
    });
  });
});
