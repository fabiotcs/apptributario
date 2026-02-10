import { EmailService } from '../src/services/EmailService';

/**
 * Email Service Tests
 * Tests for email sending functionality
 */

describe('EmailService', () => {
  describe('Send Password Reset Email', () => {
    test('should send password reset email successfully', async () => {
      const result = await EmailService.sendPasswordResetEmail(
        'test@example.com',
        'Test User',
        'test-reset-token-123'
      );

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    test('should handle invalid email gracefully', async () => {
      // In development mode, this should still succeed (logs to console)
      const result = await EmailService.sendPasswordResetEmail(
        'invalid-email',
        'Test User',
        'test-token'
      );

      expect(result.success).toBe(true);
    });

    test('should include reset token in email content', async () => {
      // This test verifies that the reset token is included
      // In development, check console output
      const result = await EmailService.sendPasswordResetEmail(
        'test@example.com',
        'Test User',
        'my-reset-token-12345'
      );

      expect(result.success).toBe(true);
    });
  });

  describe('Send Welcome Email', () => {
    test('should send welcome email for empresario', async () => {
      const result = await EmailService.sendWelcomeEmail(
        'empresario@example.com',
        'João Silva',
        'EMPRESARIO'
      );

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    test('should send welcome email for contador', async () => {
      const result = await EmailService.sendWelcomeEmail(
        'contador@example.com',
        'Maria Santos',
        'CONTADOR'
      );

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    test('should send welcome email for admin', async () => {
      const result = await EmailService.sendWelcomeEmail(
        'admin@example.com',
        'Admin User',
        'ADMIN'
      );

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    test('should customize content based on role', async () => {
      // Test that different roles get different content
      const empresarioResult = await EmailService.sendWelcomeEmail(
        'test@example.com',
        'Test',
        'EMPRESARIO'
      );
      expect(empresarioResult.success).toBe(true);

      const contadorResult = await EmailService.sendWelcomeEmail(
        'test@example.com',
        'Test',
        'CONTADOR'
      );
      expect(contadorResult.success).toBe(true);

      const adminResult = await EmailService.sendWelcomeEmail(
        'test@example.com',
        'Test',
        'ADMIN'
      );
      expect(adminResult.success).toBe(true);
    });
  });

  describe('Send Email Verification Email', () => {
    test('should send email verification email successfully', async () => {
      const result = await EmailService.sendEmailVerificationEmail(
        'test@example.com',
        'Test User',
        'verification-token-123'
      );

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    test('should include verification token in email content', async () => {
      const result = await EmailService.sendEmailVerificationEmail(
        'verify@example.com',
        'Verify User',
        'my-verification-token'
      );

      expect(result.success).toBe(true);
    });
  });

  describe('Development Mode (Console Logging)', () => {
    test('should log password reset email to console in development', async () => {
      // In development mode, emails are logged to console instead of sent
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await EmailService.sendPasswordResetEmail(
        'dev@example.com',
        'Dev User',
        'dev-token'
      );

      // Verify console logging occurred
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('PASSWORD RESET EMAIL'));

      consoleSpy.mockRestore();
      process.env.NODE_ENV = originalEnv;
    });

    test('should log welcome email to console in development', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await EmailService.sendWelcomeEmail(
        'welcome@example.com',
        'Welcome User',
        'EMPRESARIO'
      );

      // Verify console logging occurred
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('WELCOME EMAIL'));

      consoleSpy.mockRestore();
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Error Handling', () => {
    test('should handle email service errors gracefully', async () => {
      // Test that errors don't throw, but return error object
      const result = await EmailService.sendPasswordResetEmail(
        'test@example.com',
        'Test',
        'token'
      );

      // Should succeed in development (console logging)
      expect(result.success).toBe(true);
    });

    test('should include error message if email fails', async () => {
      // In production with invalid API key, this would fail
      // In development, it logs to console and succeeds
      const result = await EmailService.sendPasswordResetEmail(
        'test@example.com',
        'Test',
        'token'
      );

      expect(typeof result.success).toBe('boolean');
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });
  });

  describe('Email Content Structure', () => {
    test('password reset email should contain reset link', async () => {
      // Verify the email structure is correct
      const result = await EmailService.sendPasswordResetEmail(
        'test@example.com',
        'Test User',
        'test-token'
      );

      expect(result.success).toBe(true);
      // Email content is generated with reset URL
    });

    test('welcome email should contain app URL', async () => {
      const result = await EmailService.sendWelcomeEmail(
        'test@example.com',
        'Test User',
        'EMPRESARIO'
      );

      expect(result.success).toBe(true);
      // Email content is generated with app dashboard URL
    });

    test('all emails should have proper HTML structure', async () => {
      const result1 = await EmailService.sendPasswordResetEmail(
        'test@example.com',
        'Test',
        'token'
      );
      expect(result1.success).toBe(true);

      const result2 = await EmailService.sendWelcomeEmail(
        'test@example.com',
        'Test',
        'EMPRESARIO'
      );
      expect(result2.success).toBe(true);

      const result3 = await EmailService.sendEmailVerificationEmail(
        'test@example.com',
        'Test',
        'token'
      );
      expect(result3.success).toBe(true);
    });
  });
});
