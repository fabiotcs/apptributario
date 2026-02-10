import prisma from '../src/lib/db';

/**
 * Database Integration Tests
 *
 * Tests for Prisma client initialization, database connectivity,
 * and basic CRUD operations.
 */

describe('Database Integration', () => {
  // ============================================================================
  // CONNECTION TESTS
  // ============================================================================

  describe('Connection', () => {
    test('should connect to the database', async () => {
      expect(prisma).toBeDefined();
    });

    test('should execute a raw query', async () => {
      const result = await prisma.$queryRaw`SELECT 1 as value`;
      expect(Array.isArray(result)).toBe(true);
      expect((result as unknown[]).length).toBeGreaterThan(0);
    });

    test('should disconnect without errors', async () => {
      await expect(prisma.$disconnect()).resolves.not.toThrow();
    });
  });

  // ============================================================================
  // SCHEMA VALIDATION TESTS
  // ============================================================================

  describe('Schema Validation', () => {
    test('User table should exist', async () => {
      const users = await prisma.user.findMany({
        take: 1,
      });
      expect(Array.isArray(users)).toBe(true);
    });

    test('Company table should exist', async () => {
      const companies = await prisma.company.findMany({
        take: 1,
      });
      expect(Array.isArray(companies)).toBe(true);
    });

    test('should have seed data in database', async () => {
      const userCount = await prisma.user.count();
      expect(userCount).toBeGreaterThan(0);

      const companyCount = await prisma.company.count();
      expect(companyCount).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // BASIC CRUD TESTS
  // ============================================================================

  describe('CRUD Operations', () => {
    test('should create a user', async () => {
      const user = await prisma.user.create({
        data: {
          email: `test-${Date.now()}@example.com`,
          passwordHash: 'test-hash',
          name: 'Test User',
          role: 'EMPRESARIO',
        },
      });

      expect(user.id).toBeDefined();
      expect(user.email).toContain('test-');
      expect(user.role).toBe('EMPRESARIO');

      // Cleanup
      await prisma.user.delete({
        where: { id: user.id },
      });
    });

    test('should read a user', async () => {
      const user = await prisma.user.findFirst({
        where: {
          role: 'ADMIN',
        },
      });

      expect(user).toBeDefined();
      if (user) {
        expect(user.email).toBeDefined();
        expect(user.role).toBe('ADMIN');
      }
    });

    test('should update a user', async () => {
      // Create a test user
      const testUser = await prisma.user.create({
        data: {
          email: `update-test-${Date.now()}@example.com`,
          passwordHash: 'test-hash',
          name: 'Original Name',
          role: 'EMPRESARIO',
        },
      });

      // Update the user
      const updated = await prisma.user.update({
        where: { id: testUser.id },
        data: { name: 'Updated Name' },
      });

      expect(updated.name).toBe('Updated Name');
      expect(updated.id).toBe(testUser.id);

      // Cleanup
      await prisma.user.delete({
        where: { id: testUser.id },
      });
    });

    test('should find companies by regime', async () => {
      const companies = await prisma.company.findMany({
        where: {
          taxRegime: 'SIMPLES_NACIONAL',
        },
      });

      expect(Array.isArray(companies)).toBe(true);
      if (companies.length > 0) {
        expect(companies[0].taxRegime).toBe('SIMPLES_NACIONAL');
      }
    });
  });

  // ============================================================================
  // RELATIONSHIP TESTS
  // ============================================================================

  describe('Relationships', () => {
    test('should load company with owner', async () => {
      const company = await prisma.company.findFirst({
        include: {
          owner: true,
        },
      });

      expect(company).toBeDefined();
      if (company) {
        expect(company.owner).toBeDefined();
        expect(company.ownerId).toBe(company.owner.id);
      }
    });

    test('should load user with companies', async () => {
      const user = await prisma.user.findFirst({
        include: {
          companies: true,
        },
      });

      expect(user).toBeDefined();
      if (user) {
        expect(Array.isArray(user.companies)).toBe(true);
      }
    });

    test('should load company with branches', async () => {
      const company = await prisma.company.findFirst({
        include: {
          branches: true,
        },
      });

      expect(company).toBeDefined();
      if (company) {
        expect(Array.isArray(company.branches)).toBe(true);
      }
    });

    test('should load notifications for user', async () => {
      const user = await prisma.user.findFirst({
        include: {
          notifications: true,
        },
      });

      expect(user).toBeDefined();
      if (user) {
        expect(Array.isArray(user.notifications)).toBe(true);
      }
    });
  });

  // ============================================================================
  // ENUM TESTS
  // ============================================================================

  describe('Enums', () => {
    test('should support all UserRole values', async () => {
      const roles = ['ADMIN', 'CONTADOR', 'EMPRESARIO'];

      for (const role of roles) {
        const users = await prisma.user.findMany({
          where: {
            role: role as any,
          },
          take: 1,
        });

        // Should find users or just confirm role type is valid
        expect(Array.isArray(users)).toBe(true);
      }
    });

    test('should support all RegimeType values', async () => {
      const regimes = [
        'SIMPLES_NACIONAL',
        'LUCRO_PRESUMIDO',
        'LUCRO_REAL',
      ];

      for (const regime of regimes) {
        const companies = await prisma.company.findMany({
          where: {
            taxRegime: regime as any,
          },
          take: 1,
        });

        expect(Array.isArray(companies)).toBe(true);
      }
    });
  });

  // ============================================================================
  // AGGREGATION TESTS
  // ============================================================================

  describe('Aggregations', () => {
    test('should count users', async () => {
      const count = await prisma.user.count();
      expect(typeof count).toBe('number');
      expect(count).toBeGreaterThan(0);
    });

    test('should count companies', async () => {
      const count = await prisma.company.count();
      expect(typeof count).toBe('number');
      expect(count).toBeGreaterThan(0);
    });

    test('should group companies by regime', async () => {
      const grouped = await prisma.company.groupBy({
        by: ['taxRegime'],
        _count: true,
      });

      expect(Array.isArray(grouped)).toBe(true);
      if (grouped.length > 0) {
        expect(grouped[0].taxRegime).toBeDefined();
        expect(grouped[0]._count).toBeGreaterThan(0);
      }
    });
  });

  // ============================================================================
  // ERROR HANDLING TESTS
  // ============================================================================

  describe('Error Handling', () => {
    test('should throw on duplicate email', async () => {
      const email = `duplicate-${Date.now()}@example.com`;

      // Create first user
      const user1 = await prisma.user.create({
        data: {
          email,
          passwordHash: 'hash',
          name: 'User 1',
          role: 'EMPRESARIO',
        },
      });

      // Try to create duplicate
      await expect(
        prisma.user.create({
          data: {
            email,
            passwordHash: 'hash',
            name: 'User 2',
            role: 'EMPRESARIO',
          },
        })
      ).rejects.toThrow();

      // Cleanup
      await prisma.user.delete({
        where: { id: user1.id },
      });
    });

    test('should throw on invalid role', async () => {
      await expect(
        prisma.user.create({
          data: {
            email: `test-${Date.now()}@example.com`,
            passwordHash: 'hash',
            name: 'Test',
            role: 'INVALID_ROLE' as any,
          },
        })
      ).rejects.toThrow();
    });

    test('should throw on missing required fields', async () => {
      await expect(
        prisma.user.create({
          data: {
            email: `test-${Date.now()}@example.com`,
            // missing passwordHash and name
          } as any,
        })
      ).rejects.toThrow();
    });
  });
});
