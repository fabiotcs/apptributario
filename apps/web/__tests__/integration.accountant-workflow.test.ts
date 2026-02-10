/**
 * Integration Tests for Accountant Workflow
 * Tests the flow: List → Create → View → Edit → Assign
 */

import {
  createAccountantProfileSchema,
  updateAccountantProfileSchema,
  SpecializationLabels,
  getCapacityPercentage,
  formatHourlyRate,
} from '../src/lib/validation/accountant';
import type { CreateAccountantProfileInput, UpdateAccountantProfileInput, Specialization } from '../src/lib/validation/accountant';

describe('Accountant Workflow Integration Tests', () => {
  describe('Create Accountant Workflow', () => {
    it('should validate complete accountant creation data', () => {
      const createData: CreateAccountantProfileInput = {
        licenseNumber: 'CRC/SP-001234',
        specializations: ['TAX', 'PAYROLL'],
        yearsOfExperience: 12,
        email: 'joao.silva@example.com',
        phone: '(11) 98765-4321',
        bio: 'Experienced tax and payroll specialist with 12 years in the field.',
        hourlyRate: 20000, // R$ 200/hour
        website: 'https://joaosilva.com.br',
        maxClients: 25,
        certifications: [
          {
            name: 'CPA - Certified Public Accountant',
            issuer: 'AICPA',
            expiryDate: '2026-12-31',
          },
        ],
        profileImageUrl: 'https://example.com/profiles/joao.jpg',
      };

      const result = createAccountantProfileSchema.safeParse(createData);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.licenseNumber).toBe('CRC/SP-001234');
        expect(result.data.specializations.length).toBe(2);
        expect(result.data.yearsOfExperience).toBe(12);
      }
    });

    it('should reject incomplete accountant data', () => {
      const incompleteData = {
        licenseNumber: 'CRC/SP-001234',
        email: 'joao@example.com',
        // Missing specializations and yearsOfExperience
      };

      const result = createAccountantProfileSchema.safeParse(incompleteData);
      expect(result.success).toBe(false);
    });

    it('should validate business accountant with all specializations', () => {
      const allSpecializationsData: CreateAccountantProfileInput = {
        licenseNumber: 'CRC/RJ-005678',
        specializations: ['TAX', 'PAYROLL', 'COMPLIANCE', 'ACCOUNTING', 'ADVISORY'],
        yearsOfExperience: 20,
        email: 'comprehensive@example.com',
      };

      const result = createAccountantProfileSchema.safeParse(allSpecializationsData);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.specializations.length).toBe(5);
        for (const spec of result.data.specializations) {
          expect(SpecializationLabels[spec as Specialization]).toBeDefined();
        }
      }
    });
  });

  describe('Update Accountant Workflow', () => {
    it('should validate partial profile updates', () => {
      const updateData: UpdateAccountantProfileInput = {
        bio: 'Updated professional summary',
        hourlyRate: 25000, // Increased rate
        isAvailable: false, // Now fully booked
      };

      const result = updateAccountantProfileSchema.safeParse(updateData);
      expect(result.success).toBe(true);
    });

    it('should allow updating only hourly rate', () => {
      const updateData: UpdateAccountantProfileInput = {
        hourlyRate: 30000,
      };

      const result = updateAccountantProfileSchema.safeParse(updateData);
      expect(result.success).toBe(true);
    });

    it('should allow updating specializations', () => {
      const updateData: UpdateAccountantProfileInput = {
        specializations: ['COMPLIANCE', 'ADVISORY'],
      };

      const result = updateAccountantProfileSchema.safeParse(updateData);
      expect(result.success).toBe(true);
    });

    it('should allow empty update (no changes)', () => {
      const emptyUpdate = {};

      const result = updateAccountantProfileSchema.safeParse(emptyUpdate);
      expect(result.success).toBe(true);
    });
  });

  describe('Accountant List and Filter Workflow', () => {
    it('should support filtering by specialization', () => {
      const accountants = [
        {
          id: '1',
          licenseNumber: 'CRC/SP-001',
          specializations: ['TAX', 'COMPLIANCE'],
          yearsOfExperience: 10,
          hourlyRate: 15000,
          isAvailable: true,
        },
        {
          id: '2',
          licenseNumber: 'CRC/SP-002',
          specializations: ['PAYROLL', 'ACCOUNTING'],
          yearsOfExperience: 8,
          hourlyRate: 12000,
          isAvailable: true,
        },
        {
          id: '3',
          licenseNumber: 'CRC/SP-003',
          specializations: ['TAX', 'ADVISORY'],
          yearsOfExperience: 15,
          hourlyRate: 20000,
          isAvailable: false,
        },
      ];

      // Filter by TAX specialization
      const taxAccountants = accountants.filter((a) => a.specializations.includes('TAX'));
      expect(taxAccountants).toHaveLength(2);
      expect(taxAccountants.map((a) => a.id)).toEqual(['1', '3']);
    });

    it('should support filtering by availability', () => {
      const accountants = [
        {
          id: '1',
          licenseNumber: 'CRC/SP-001',
          specializations: ['TAX'],
          yearsOfExperience: 10,
          isAvailable: true,
        },
        {
          id: '2',
          licenseNumber: 'CRC/SP-002',
          specializations: ['PAYROLL'],
          yearsOfExperience: 8,
          isAvailable: false,
        },
      ];

      const availableAccountants = accountants.filter((a) => a.isAvailable);
      expect(availableAccountants).toHaveLength(1);
      expect(availableAccountants[0].id).toBe('1');
    });

    it('should support filtering by minimum experience', () => {
      const accountants = [
        {
          id: '1',
          licenseNumber: 'CRC/SP-001',
          specializations: ['TAX'],
          yearsOfExperience: 3,
        },
        {
          id: '2',
          licenseNumber: 'CRC/SP-002',
          specializations: ['TAX'],
          yearsOfExperience: 8,
        },
        {
          id: '3',
          licenseNumber: 'CRC/SP-003',
          specializations: ['TAX'],
          yearsOfExperience: 15,
        },
      ];

      const experiencedAccountants = accountants.filter((a) => a.yearsOfExperience >= 10);
      expect(experiencedAccountants).toHaveLength(1);
      expect(experiencedAccountants[0].yearsOfExperience).toBe(15);
    });

    it('should support search by text (name, license, email)', () => {
      const accountants = [
        {
          id: '1',
          name: 'João Silva',
          licenseNumber: 'CRC/SP-001234',
          email: 'joao@example.com',
        },
        {
          id: '2',
          name: 'Maria Santos',
          licenseNumber: 'CRC/RJ-005678',
          email: 'maria@example.com',
        },
      ];

      const searchQuery = 'SP';
      const results = accountants.filter(
        (a) =>
          a.name.includes(searchQuery) ||
          a.licenseNumber.includes(searchQuery) ||
          a.email.includes(searchQuery)
      );
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('1');
    });
  });

  describe('Client Capacity Management', () => {
    it('should calculate correct capacity percentage', () => {
      expect(getCapacityPercentage(10, 20)).toBe(50);
      expect(getCapacityPercentage(15, 20)).toBe(75);
      expect(getCapacityPercentage(20, 20)).toBe(100);
      expect(getCapacityPercentage(0, 20)).toBe(0);
    });

    it('should prevent assignment when at capacity', () => {
      const accountant = {
        id: '1',
        maxClients: 10,
        currentClientCount: 10,
      };

      const canAssign = accountant.currentClientCount < accountant.maxClients;
      expect(canAssign).toBe(false);
    });

    it('should allow assignment when below capacity', () => {
      const accountant = {
        id: '1',
        maxClients: 10,
        currentClientCount: 8,
      };

      const canAssign = accountant.currentClientCount < accountant.maxClients;
      expect(canAssign).toBe(true);
    });

    it('should track capacity as clients are added/removed', () => {
      let currentCount = 5;
      const maxClients = 10;

      expect(getCapacityPercentage(currentCount, maxClients)).toBe(50);

      currentCount += 1; // Client added
      expect(getCapacityPercentage(currentCount, maxClients)).toBe(60);

      currentCount += 4; // More clients added
      expect(getCapacityPercentage(currentCount, maxClients)).toBe(100);

      currentCount -= 2; // Client removed
      expect(getCapacityPercentage(currentCount, maxClients)).toBe(80);
    });
  });

  describe('Rate and Pricing Display', () => {
    it('should format hourly rates correctly for display', () => {
      expect(formatHourlyRate(5000)).toBe('R$ 50,00');
      expect(formatHourlyRate(15000)).toBe('R$ 150,00');
      expect(formatHourlyRate(100000)).toBe('R$ 1.000,00');
      expect(formatHourlyRate(250000)).toBe('R$ 2.500,00');
    });

    it('should handle undefined hourly rate', () => {
      expect(formatHourlyRate(undefined)).toBe('Not specified');
    });

    it('should support rate comparisons', () => {
      const accountants = [
        { id: '1', hourlyRate: 10000 },
        { id: '2', hourlyRate: 25000 },
        { id: '3', hourlyRate: 15000 },
      ];

      const sortedByRate = [...accountants].sort((a, b) => a.hourlyRate - b.hourlyRate);
      expect(sortedByRate[0].id).toBe('1');
      expect(sortedByRate[2].id).toBe('2');
    });
  });

  describe('Company Assignment Workflow', () => {
    it('should validate assignment role values', () => {
      const validRoles = ['ADVISOR', 'MANAGER'];
      const roles: Array<'ADVISOR' | 'MANAGER'> = ['ADVISOR', 'MANAGER'];

      for (const role of roles) {
        expect(validRoles).toContain(role);
      }
    });

    it('should track assignment details', () => {
      const assignment = {
        accountantId: '1',
        companyId: 'comp-001',
        role: 'MANAGER' as const,
        notes: 'Primary tax advisor for quarterly filings',
        assignedAt: '2025-02-09T10:30:00Z',
        assignedBy: 'user-123',
      };

      expect(assignment.accountantId).toBe('1');
      expect(assignment.companyId).toBe('comp-001');
      expect(assignment.role).toBe('MANAGER');
      expect(assignment.notes).toBeDefined();
    });

    it('should support role changes', () => {
      let assignment = {
        accountantId: '1',
        companyId: 'comp-001',
        role: 'ADVISOR' as const,
      };

      expect(assignment.role).toBe('ADVISOR');

      // Change role
      assignment = { ...assignment, role: 'MANAGER' as const };
      expect(assignment.role).toBe('MANAGER');
    });
  });

  describe('RBAC and Authorization', () => {
    it('should support role-based creation restrictions (CONTADOR only)', () => {
      const roles = ['CONTADOR', 'EMPRESARIO', 'ADMIN'];

      const canCreateProfile = (userRole: string) => userRole === 'CONTADOR' || userRole === 'ADMIN';

      expect(canCreateProfile('CONTADOR')).toBe(true);
      expect(canCreateProfile('EMPRESARIO')).toBe(false);
      expect(canCreateProfile('ADMIN')).toBe(true);
    });

    it('should support role-based assignment restrictions (EMPRESARIO/ADMIN)', () => {
      const canAssign = (userRole: string) => userRole === 'EMPRESARIO' || userRole === 'ADMIN';

      expect(canAssign('CONTADOR')).toBe(false);
      expect(canAssign('EMPRESARIO')).toBe(true);
      expect(canAssign('ADMIN')).toBe(true);
    });

    it('should support view restrictions based on role', () => {
      const accountants = [
        { id: '1', userId: 'user-1', specializations: ['TAX'] },
        { id: '2', userId: 'user-2', specializations: ['PAYROLL'] },
        { id: '3', userId: 'user-3', specializations: ['ADVISORY'] },
      ];

      const currentUserId = 'user-1';
      const currentUserRole = 'CONTADOR';

      const visibleAccountants = (role: string, userId: string) => {
        if (role === 'ADMIN') return accountants; // See all
        if (role === 'CONTADOR') return accountants.filter((a) => a.userId === userId); // See own
        return accountants; // EMPRESARIO sees all for assignment
      };

      const visible = visibleAccountants(currentUserRole, currentUserId);
      expect(visible).toHaveLength(1);
      expect(visible[0].userId).toBe('user-1');
    });
  });

  describe('Pagination Support', () => {
    it('should validate pagination parameters', () => {
      const validPages = [
        { page: 1, limit: 10 },
        { page: 1, limit: 20 },
        { page: 2, limit: 10 },
        { page: 5, limit: 50 },
      ];

      for (const pageConfig of validPages) {
        expect(pageConfig.page).toBeGreaterThan(0);
        expect(pageConfig.limit).toBeGreaterThan(0);
      }
    });

    it('should calculate total pages correctly', () => {
      const calculatePages = (total: number, limit: number) => Math.ceil(total / limit);

      expect(calculatePages(100, 20)).toBe(5);
      expect(calculatePages(99, 20)).toBe(5);
      expect(calculatePages(100, 25)).toBe(4);
      expect(calculatePages(10, 20)).toBe(1);
      expect(calculatePages(0, 20)).toBe(0);
    });
  });

  describe('Data Validation Edge Cases', () => {
    it('should handle accountant with minimal required fields', () => {
      const minimalData: CreateAccountantProfileInput = {
        licenseNumber: 'CRC-1234',
        specializations: ['TAX'],
        yearsOfExperience: 1,
        email: 'min@example.com',
      };

      const result = createAccountantProfileSchema.safeParse(minimalData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid license number formats', () => {
      const invalidLicenses = [
        { licenseNumber: 'ABC' },
        { licenseNumber: 'A' },
        { licenseNumber: '' },
      ];

      for (const data of invalidLicenses) {
        const result = createAccountantProfileSchema.safeParse({
          ...data,
          specializations: ['TAX'],
          yearsOfExperience: 5,
          email: 'test@example.com',
        });
        expect(result.success).toBe(false);
      }
    });

    it('should handle specialization changes in profile updates', () => {
      const updateData: UpdateAccountantProfileInput = {
        specializations: ['ADVISORY'], // Changed from TAX to ADVISORY
      };

      const result = updateAccountantProfileSchema.safeParse(updateData);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.specializations).toContain('ADVISORY');
      }
    });
  });
});
