import { prisma } from '../src/lib/prisma';
import { AccountantService } from '../src/services/AccountantService';
import * as bcrypt from 'bcryptjs';

describe('AccountantService - Complete Test Suite', () => {
  // Test users
  let contadorUserId: string;
  let empresarioUserId: string;
  let adminUserId: string;
  let companyId: string;

  beforeAll(async () => {
    // Create test users
    const hash = await bcrypt.hash('password123', 10);

    const contador = await prisma.user.create({
      data: {
        email: 'contador@test.com',
        name: 'Test Contador',
        passwordHash: hash,
        role: 'CONTADOR',
      },
    });
    contadorUserId = contador.id;

    const empresario = await prisma.user.create({
      data: {
        email: 'empresario@test.com',
        name: 'Test Empresario',
        passwordHash: hash,
        role: 'EMPRESARIO',
      },
    });
    empresarioUserId = empresario.id;

    const admin = await prisma.user.create({
      data: {
        email: 'admin@test.com',
        name: 'Test Admin',
        passwordHash: hash,
        role: 'ADMIN',
      },
    });
    adminUserId = admin.id;

    // Create test company
    const company = await prisma.company.create({
      data: {
        name: 'Test Company',
        cnpj: '11.222.333/0001-81',
        ownerId: empresarioUserId,
        taxRegime: 'SIMPLES_NACIONAL',
      },
    });
    companyId = company.id;
  });

  afterAll(async () => {
    // Cleanup: Delete test data in reverse order of dependencies
    await prisma.accountantAuditLog.deleteMany({});
    await prisma.companyAccountant.deleteMany({});
    await prisma.accountantProfile.deleteMany({});
    await prisma.company.deleteMany({});
    await prisma.user.deleteMany({});
  });

  describe('Profile Creation', () => {
    test('should create accountant profile successfully', async () => {
      const profile = await AccountantService.createProfile(
        {
          licenseNumber: 'CRC/SP-123456',
          specializations: ['TAX', 'COMPLIANCE'],
          bio: 'Expert accountant',
          yearsOfExperience: 10,
          email: 'contador@example.com',
          hourlyRate: 15000, // R$ 150
          phone: '+55 11 99999-9999',
          website: 'https://contador.com',
          maxClients: 15,
        },
        contadorUserId
      );

      expect(profile).toBeDefined();
      expect(profile.userId).toBe(contadorUserId);
      expect(profile.licenseNumber).toBe('CRC/SP-123456');
      expect(profile.specializations).toContain('TAX');
      expect(profile.specializations).toContain('COMPLIANCE');
      expect(profile.yearsOfExperience).toBe(10);
      expect(profile.isAvailable).toBe(true);
      expect(profile.currentClientCount).toBe(0);
    });

    test('should reject duplicate profile for same user', async () => {
      await expect(
        AccountantService.createProfile(
          {
            licenseNumber: 'CRC/SP-999999',
            specializations: ['ACCOUNTING'],
            yearsOfExperience: 5,
            email: 'test@example.com',
          },
          contadorUserId
        )
      ).rejects.toThrow('Accountant profile already exists');
    });

    test('should reject duplicate license number', async () => {
      const user2 = await prisma.user.create({
        data: {
          email: 'contador2@test.com',
          name: 'Contador 2',
          passwordHash: 'hash',
          role: 'CONTADOR',
        },
      });

      await expect(
        AccountantService.createProfile(
          {
            licenseNumber: 'CRC/SP-123456', // Same as previous profile
            specializations: ['PAYROLL'],
            yearsOfExperience: 3,
            email: 'contador2@example.com',
          },
          user2.id
        )
      ).rejects.toThrow('License number already registered');

      await prisma.user.delete({ where: { id: user2.id } });
    });

    test('should reject invalid specializations', async () => {
      const user3 = await prisma.user.create({
        data: {
          email: 'contador3@test.com',
          name: 'Contador 3',
          passwordHash: 'hash',
          role: 'CONTADOR',
        },
      });

      await expect(
        AccountantService.createProfile(
          {
            licenseNumber: 'CRC/SP-777777',
            specializations: ['INVALID_SPEC'],
            yearsOfExperience: 5,
            email: 'contador3@example.com',
          },
          user3.id
        )
      ).rejects.toThrow('Invalid specializations');

      await prisma.user.delete({ where: { id: user3.id } });
    });

    test('should accept all valid specializations', async () => {
      const user4 = await prisma.user.create({
        data: {
          email: 'contador4@test.com',
          name: 'Contador 4',
          passwordHash: 'hash',
          role: 'CONTADOR',
        },
      });

      const profile = await AccountantService.createProfile(
        {
          licenseNumber: 'CRC/SP-888888',
          specializations: [
            'TAX',
            'PAYROLL',
            'COMPLIANCE',
            'ACCOUNTING',
            'ADVISORY',
          ],
          yearsOfExperience: 15,
          email: 'contador4@example.com',
        },
        user4.id
      );

      expect(profile.specializations).toHaveLength(5);
    });
  });

  describe('Profile Retrieval', () => {
    test('should get profile by accountant ID', async () => {
      const profile = await AccountantService.getProfile(contadorUserId);

      expect(profile.userId).toBe(contadorUserId);
      expect(profile.licenseNumber).toBe('CRC/SP-123456');
    });

    test('should throw error for non-existent profile', async () => {
      await expect(
        AccountantService.getProfile('non-existent-id')
      ).rejects.toThrow('Accountant profile not found');
    });
  });

  describe('Profile Updates', () => {
    test('should update profile bio', async () => {
      const updated = await AccountantService.updateProfile(
        contadorUserId,
        { bio: 'Updated bio' },
        adminUserId
      );

      expect(updated.bio).toBe('Updated bio');
    });

    test('should update specializations', async () => {
      const updated = await AccountantService.updateProfile(
        contadorUserId,
        { specializations: ['PAYROLL', 'ADVISORY'] },
        adminUserId
      );

      expect(updated.specializations).toEqual(['PAYROLL', 'ADVISORY']);
    });

    test('should update hourly rate', async () => {
      const updated = await AccountantService.updateProfile(
        contadorUserId,
        { hourlyRate: 20000 },
        adminUserId
      );

      expect(updated.hourlyRate).toBe(20000);
    });

    test('should log profile updates in audit log', async () => {
      await AccountantService.updateProfile(
        contadorUserId,
        { bio: 'Another update' },
        adminUserId
      );

      const logs = await AccountantService.getAuditLog(contadorUserId);
      const updateLog = logs.find(l => l.action === 'PROFILE_UPDATED');

      expect(updateLog).toBeDefined();
      expect(updateLog?.changes).toBeDefined();
    });

    test('should reject invalid specializations on update', async () => {
      await expect(
        AccountantService.updateProfile(
          contadorUserId,
          { specializations: ['INVALID'] },
          adminUserId
        )
      ).rejects.toThrow('Invalid specializations');
    });
  });

  describe('Availability Management', () => {
    test('should update availability status', async () => {
      const updated = await AccountantService.updateAvailability(
        contadorUserId,
        false,
        adminUserId
      );

      expect(updated.isAvailable).toBe(false);
    });

    test('should log availability changes', async () => {
      await AccountantService.updateAvailability(
        contadorUserId,
        true,
        adminUserId
      );

      const logs = await AccountantService.getAuditLog(contadorUserId);
      const availabilityLog = logs.find(
        l => l.action === 'AVAILABILITY_CHANGED'
      );

      expect(availabilityLog).toBeDefined();
    });

    test('should not create log for no availability change', async () => {
      const logsBefore = await AccountantService.getAuditLog(contadorUserId);
      const countBefore = logsBefore.filter(
        l => l.action === 'AVAILABILITY_CHANGED'
      ).length;

      await AccountantService.updateAvailability(
        contadorUserId,
        true, // Already true
        adminUserId
      );

      const logsAfter = await AccountantService.getAuditLog(contadorUserId);
      const countAfter = logsAfter.filter(
        l => l.action === 'AVAILABILITY_CHANGED'
      ).length;

      expect(countAfter).toBe(countBefore);
    });
  });

  describe('Listing & Searching', () => {
    test('should list accountants with pagination', async () => {
      const result = await AccountantService.listAccountants(
        undefined,
        { page: 1, limit: 10 }
      );

      expect(result.accountants).toBeDefined();
      expect(result.total).toBeGreaterThan(0);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.pages).toBeGreaterThan(0);
    });

    test('should filter accountants by specialization', async () => {
      const result = await AccountantService.listAccountants({
        specialization: 'PAYROLL',
      });

      expect(result.accountants.length).toBeGreaterThan(0);
      result.accountants.forEach(a => {
        expect(a.specializations).toContain('PAYROLL');
      });
    });

    test('should filter accountants by availability', async () => {
      const result = await AccountantService.listAccountants({
        isAvailable: true,
      });

      result.accountants.forEach(a => {
        expect(a.isAvailable).toBe(true);
      });
    });

    test('should search accountants by name', async () => {
      const result = await AccountantService.listAccountants({
        search: 'Test Contador',
      });

      expect(result.accountants.length).toBeGreaterThan(0);
    });

    test('should filter by minimum years of experience', async () => {
      const result = await AccountantService.listAccountants({
        yearsOfExperience: 5,
      });

      result.accountants.forEach(a => {
        expect(a.yearsOfExperience).toBeGreaterThanOrEqual(5);
      });
    });
  });

  describe('Company Assignment', () => {
    beforeEach(async () => {
      // Reset availability for assignment tests
      await AccountantService.updateAvailability(
        contadorUserId,
        true,
        adminUserId
      );
    });

    test('should assign accountant to company', async () => {
      const assignment = await AccountantService.assignToCompany(
        contadorUserId,
        companyId,
        'ADVISOR',
        empresarioUserId
      );

      expect(assignment.companyId).toBe(companyId);
      expect(assignment.accountantId).toBe(contadorUserId);
      expect(assignment.role).toBe('ADVISOR');
      expect(assignment.assignedBy).toBe(empresarioUserId);
    });

    test('should increment client count on assignment', async () => {
      const before = await AccountantService.getProfile(contadorUserId);
      const initialCount = before.currentClientCount;

      const company2 = await prisma.company.create({
        data: {
          name: 'Company 2',
          cnpj: '22.333.444/0001-82',
          ownerId: empresarioUserId,
        },
      });

      await AccountantService.assignToCompany(
        contadorUserId,
        company2.id,
        'MANAGER',
        empresarioUserId
      );

      const after = await AccountantService.getProfile(contadorUserId);
      expect(after.currentClientCount).toBe(initialCount + 1);

      await prisma.company.delete({ where: { id: company2.id } });
    });

    test('should reject assignment to unavailable accountant', async () => {
      await AccountantService.updateAvailability(
        contadorUserId,
        false,
        adminUserId
      );

      const company3 = await prisma.company.create({
        data: {
          name: 'Company 3',
          cnpj: '33.444.555/0001-83',
          ownerId: empresarioUserId,
        },
      });

      await expect(
        AccountantService.assignToCompany(
          contadorUserId,
          company3.id,
          'ADVISOR',
          empresarioUserId
        )
      ).rejects.toThrow('not currently accepting');

      await prisma.company.delete({ where: { id: company3.id } });
    });

    test('should reject double assignment', async () => {
      await expect(
        AccountantService.assignToCompany(
          contadorUserId,
          companyId,
          'MANAGER',
          empresarioUserId
        )
      ).rejects.toThrow('already assigned');
    });

    test('should log assignment in audit log', async () => {
      const logs = await AccountantService.getAuditLog(contadorUserId);
      const assignmentLog = logs.find(l => l.action === 'ASSIGNED');

      expect(assignmentLog).toBeDefined();
      expect(assignmentLog?.companyId).toBe(companyId);
    });
  });

  describe('Assignment Management', () => {
    test('should get assigned companies', async () => {
      const assignments = await AccountantService.getAssignedCompanies(
        contadorUserId
      );

      expect(assignments.length).toBeGreaterThan(0);
      expect(assignments[0].company).toBeDefined();
      expect(assignments[0].company.name).toBeDefined();
    });

    test('should update assignment role', async () => {
      const updated = await AccountantService.updateAssignmentRole(
        contadorUserId,
        companyId,
        'MANAGER',
        empresarioUserId
      );

      expect(updated.role).toBe('MANAGER');
    });

    test('should log role change', async () => {
      await AccountantService.updateAssignmentRole(
        contadorUserId,
        companyId,
        'ADVISOR',
        empresarioUserId
      );

      const logs = await AccountantService.getAuditLog(contadorUserId);
      const reassignLog = logs.find(l => l.action === 'REASSIGNED');

      expect(reassignLog).toBeDefined();
    });

    test('should remove assignment', async () => {
      const before = await AccountantService.getProfile(contadorUserId);
      const initialCount = before.currentClientCount;

      await AccountantService.removeAssignment(
        contadorUserId,
        companyId,
        empresarioUserId
      );

      const after = await AccountantService.getProfile(contadorUserId);
      expect(after.currentClientCount).toBe(initialCount - 1);
    });

    test('should log assignment removal', async () => {
      const logs = await AccountantService.getAuditLog(contadorUserId);
      const removalLog = logs.find(l => l.action === 'REMOVED');

      expect(removalLog).toBeDefined();
      expect(removalLog?.companyId).toBe(companyId);
    });

    test('should reject removal of non-existent assignment', async () => {
      const company4 = await prisma.company.create({
        data: {
          name: 'Company 4',
          cnpj: '44.555.666/0001-84',
          ownerId: empresarioUserId,
        },
      });

      await expect(
        AccountantService.removeAssignment(
          contadorUserId,
          company4.id,
          empresarioUserId
        )
      ).rejects.toThrow('not found');

      await prisma.company.delete({ where: { id: company4.id } });
    });
  });

  describe('Capacity Management', () => {
    test('should respect maximum client limit', async () => {
      // Create accountant with low max clients
      const user5 = await prisma.user.create({
        data: {
          email: 'contador5@test.com',
          name: 'Contador 5',
          passwordHash: 'hash',
          role: 'CONTADOR',
        },
      });

      const profile = await AccountantService.createProfile(
        {
          licenseNumber: 'CRC/SP-555555',
          specializations: ['TAX'],
          yearsOfExperience: 5,
          email: 'contador5@example.com',
          maxClients: 2,
        },
        user5.id
      );

      const company5 = await prisma.company.create({
        data: {
          name: 'Company 5',
          cnpj: '55.666.777/0001-85',
          ownerId: empresarioUserId,
        },
      });

      const company6 = await prisma.company.create({
        data: {
          name: 'Company 6',
          cnpj: '66.777.888/0001-86',
          ownerId: empresarioUserId,
        },
      });

      const company7 = await prisma.company.create({
        data: {
          name: 'Company 7',
          cnpj: '77.888.999/0001-87',
          ownerId: empresarioUserId,
        },
      });

      // Assign to 2 companies (at capacity)
      await AccountantService.assignToCompany(
        user5.id,
        company5.id,
        'ADVISOR',
        empresarioUserId
      );
      await AccountantService.assignToCompany(
        user5.id,
        company6.id,
        'ADVISOR',
        empresarioUserId
      );

      // Third assignment should fail
      await expect(
        AccountantService.assignToCompany(
          user5.id,
          company7.id,
          'ADVISOR',
          empresarioUserId
        )
      ).rejects.toThrow('maximum client limit');

      // Cleanup
      await prisma.company.deleteMany({
        where: { id: { in: [company5.id, company6.id, company7.id] } },
      });
      await prisma.user.delete({ where: { id: user5.id } });
    });
  });

  describe('Audit Logging', () => {
    test('should get complete audit log', async () => {
      const logs = await AccountantService.getAuditLog(contadorUserId);

      expect(logs).toBeDefined();
      expect(Array.isArray(logs)).toBe(true);
      expect(logs.length).toBeGreaterThan(0);
    });

    test('should have correct audit action types', async () => {
      const logs = await AccountantService.getAuditLog(contadorUserId);

      const validActions = [
        'ASSIGNED',
        'REMOVED',
        'PROFILE_UPDATED',
        'AVAILABILITY_CHANGED',
        'REASSIGNED',
      ];

      logs.forEach(log => {
        expect(validActions).toContain(log.action);
      });
    });

    test('should track who performed each action', async () => {
      const logs = await AccountantService.getAuditLog(contadorUserId);

      logs.forEach(log => {
        expect(log.performedBy).toBeDefined();
        expect(log.createdAt).toBeDefined();
      });
    });
  });

  describe('Search Functionality', () => {
    test('should search by accountant name', async () => {
      const results = await AccountantService.searchAccountants('Contador');

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].user?.name).toBeDefined();
    });

    test('should filter search by specialization', async () => {
      const results = await AccountantService.searchAccountants('Contador', {
        specializations: ['PAYROLL'],
      });

      results.forEach(r => {
        expect(r.specializations).toContain('PAYROLL');
      });
    });

    test('should filter search by minimum experience', async () => {
      const results = await AccountantService.searchAccountants('Contador', {
        minExperience: 5,
      });

      results.forEach(r => {
        expect(r.yearsOfExperience).toBeGreaterThanOrEqual(5);
      });
    });
  });
});
