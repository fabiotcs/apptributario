import { CompanyService } from '../src/services/CompanyService';
import prisma from '../src/lib/db';

describe('CompanyService', () => {
  // Test user IDs
  const empresarioId = 'test-empresario-1';
  const contadorId = 'test-contador-1';
  const adminId = 'test-admin-1';

  beforeAll(async () => {
    // Create test users
    await prisma.user.createMany({
      data: [
        {
          id: empresarioId,
          email: 'empresario@test.com',
          name: 'Test Empresario',
          passwordHash: 'hashed',
          role: 'EMPRESARIO',
        },
        {
          id: contadorId,
          email: 'contador@test.com',
          name: 'Test Contador',
          passwordHash: 'hashed',
          role: 'CONTADOR',
        },
        {
          id: adminId,
          email: 'admin@test.com',
          name: 'Test Admin',
          passwordHash: 'hashed',
          role: 'ADMIN',
        },
      ],
      skipDuplicates: true,
    });
  });

  afterEach(async () => {
    // Clean up test companies
    await prisma.company.deleteMany({
      where: {
        cnpj: { startsWith: '00' },
      },
    });
  });

  // ============================================================================
  // CNPJ VALIDATION TESTS
  // ============================================================================

  describe('CNPJ Validation', () => {
    test('should accept valid CNPJ with formatting', () => {
      const validCNPJ = '11.222.333/0001-81';
      expect(CompanyService.validateCNPJ(validCNPJ)).toBe(true);
    });

    test('should accept valid CNPJ without formatting', () => {
      const validCNPJ = '11222333000181';
      expect(CompanyService.validateCNPJ(validCNPJ)).toBe(true);
    });

    test('should reject CNPJ with wrong length', () => {
      expect(CompanyService.validateCNPJ('123456789')).toBe(false);
    });

    test('should reject CNPJ with all same digits', () => {
      expect(CompanyService.validateCNPJ('11111111111111')).toBe(false);
    });

    test('should reject CNPJ with invalid checksum', () => {
      expect(CompanyService.validateCNPJ('11.222.333/0001-82')).toBe(false);
    });

    test('should reject empty CNPJ', () => {
      expect(CompanyService.validateCNPJ('')).toBe(false);
    });
  });

  // ============================================================================
  // CREATE COMPANY TESTS
  // ============================================================================

  describe('Create Company', () => {
    test('should create company successfully as EMPRESARIO', async () => {
      const result = await CompanyService.create(
        {
          name: 'Tech Company Ltd',
          cnpj: '11.222.333/0001-81',
          legalName: 'Tech Company LTDA',
          industry: 'TECH',
          address: '123 Main St',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01310-100',
          employees: 50,
          revenue: 5000000,
          taxRegime: 'LUCRO_REAL',
        },
        empresarioId,
        'EMPRESARIO'
      );

      expect(result.success).toBe(true);
      expect(result.company?.name).toBe('Tech Company Ltd');
      expect(result.company?.cnpj).toBe('11.222.333/0001-81');
      expect(result.company?.ownerId).toBe(empresarioId);
    });

    test('should create company successfully as ADMIN', async () => {
      const result = await CompanyService.create(
        {
          name: 'Admin Created Company',
          cnpj: '11.222.333/0001-82',
          industry: 'SERVICES',
        },
        adminId,
        'ADMIN'
      );

      expect(result.success).toBe(true);
      expect(result.company?.ownerId).toBe(adminId);
    });

    test('should reject company creation by CONTADOR', async () => {
      const result = await CompanyService.create(
        {
          name: 'Contador Company',
          cnpj: '11.222.333/0001-83',
        },
        contadorId,
        'CONTADOR'
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('EMPRESARIO or ADMIN');
    });

    test('should reject missing required fields', async () => {
      const result = await CompanyService.create(
        {
          name: '',
          cnpj: '',
        },
        empresarioId,
        'EMPRESARIO'
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('required');
    });

    test('should reject invalid CNPJ format', async () => {
      const result = await CompanyService.create(
        {
          name: 'Invalid CNPJ Company',
          cnpj: '12345678901234',
        },
        empresarioId,
        'EMPRESARIO'
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid CNPJ');
    });

    test('should reject duplicate CNPJ', async () => {
      const cnpj = '11.222.333/0001-81';

      // Create first company
      await CompanyService.create(
        {
          name: 'First Company',
          cnpj,
        },
        empresarioId,
        'EMPRESARIO'
      );

      // Try to create duplicate
      const result = await CompanyService.create(
        {
          name: 'Duplicate Company',
          cnpj,
        },
        empresarioId,
        'EMPRESARIO'
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('already exists');
    });
  });

  // ============================================================================
  // FIND COMPANY TESTS
  // ============================================================================

  describe('Find Company by ID', () => {
    let testCompanyId: string;

    beforeAll(async () => {
      const result = await CompanyService.create(
        {
          name: 'Find Test Company',
          cnpj: '11.222.333/0001-84',
        },
        empresarioId,
        'EMPRESARIO'
      );
      testCompanyId = result.company?.id!;
    });

    test('should find company as owner (EMPRESARIO)', async () => {
      const result = await CompanyService.findById(
        testCompanyId,
        empresarioId,
        'EMPRESARIO'
      );

      expect(result.success).toBe(true);
      expect(result.company?.id).toBe(testCompanyId);
      expect(result.company?.name).toBe('Find Test Company');
    });

    test('should find company as ADMIN', async () => {
      const result = await CompanyService.findById(
        testCompanyId,
        adminId,
        'ADMIN'
      );

      expect(result.success).toBe(true);
      expect(result.company?.id).toBe(testCompanyId);
    });

    test('should reject access for other EMPRESARIO', async () => {
      const result = await CompanyService.findById(
        testCompanyId,
        'other-empresario-id',
        'EMPRESARIO'
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Not authorized');
    });

    test('should return error for non-existent company', async () => {
      const result = await CompanyService.findById(
        'non-existent-id',
        empresarioId,
        'EMPRESARIO'
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });
  });

  // ============================================================================
  // LIST COMPANIES TESTS
  // ============================================================================

  describe('List Companies', () => {
    beforeAll(async () => {
      // Create test companies for listing
      for (let i = 0; i < 3; i++) {
        await CompanyService.create(
          {
            name: `List Test Company ${i}`,
            cnpj: `11.222.${333 + i}/0001-81`,
            industry: i % 2 === 0 ? 'TECH' : 'SERVICES',
          },
          empresarioId,
          'EMPRESARIO'
        );
      }
    });

    test('should list all companies for EMPRESARIO owner', async () => {
      const result = await CompanyService.findByUserId(
        empresarioId,
        'EMPRESARIO',
        1,
        20
      );

      expect(result.success).toBe(true);
      expect(Array.isArray(result.companies)).toBe(true);
      expect(result.total).toBeGreaterThanOrEqual(3);
    });

    test('should return empty list for CONTADOR with no assignments', async () => {
      const result = await CompanyService.findByUserId(
        contadorId,
        'CONTADOR',
        1,
        20
      );

      expect(result.success).toBe(true);
      expect(result.total).toBe(0);
    });

    test('should list all companies for ADMIN', async () => {
      const result = await CompanyService.findByUserId(
        adminId,
        'ADMIN',
        1,
        20
      );

      expect(result.success).toBe(true);
      expect(Array.isArray(result.companies)).toBe(true);
    });

    test('should support pagination', async () => {
      const result1 = await CompanyService.findByUserId(
        empresarioId,
        'EMPRESARIO',
        1,
        2
      );

      expect(result1.limit).toBe(2);
      expect(result1.page).toBe(1);
      expect(result1.companies?.length).toBeLessThanOrEqual(2);
    });

    test('should filter by industry', async () => {
      const result = await CompanyService.findByUserId(
        empresarioId,
        'EMPRESARIO',
        1,
        20,
        { industry: 'TECH' }
      );

      expect(result.success).toBe(true);
      result.companies?.forEach((company) => {
        expect(company.industry).toBe('TECH');
      });
    });

    test('should filter by search term', async () => {
      const result = await CompanyService.findByUserId(
        empresarioId,
        'EMPRESARIO',
        1,
        20,
        { search: 'List Test' }
      );

      expect(result.success).toBe(true);
      result.companies?.forEach((company) => {
        expect(company.name).toContain('List Test');
      });
    });
  });

  // ============================================================================
  // UPDATE COMPANY TESTS
  // ============================================================================

  describe('Update Company', () => {
    let updateTestCompanyId: string;

    beforeAll(async () => {
      const result = await CompanyService.create(
        {
          name: 'Update Test Company',
          cnpj: '11.222.333/0001-85',
          employees: 10,
        },
        empresarioId,
        'EMPRESARIO'
      );
      updateTestCompanyId = result.company?.id!;
    });

    test('should update company as owner', async () => {
      const result = await CompanyService.update(
        updateTestCompanyId,
        {
          name: 'Updated Company Name',
          employees: 50,
          taxRegime: 'LUCRO_REAL',
        },
        empresarioId,
        'EMPRESARIO'
      );

      expect(result.success).toBe(true);
      expect(result.company?.name).toBe('Updated Company Name');
      expect(result.company?.employees).toBe(50);
    });

    test('should update company as ADMIN', async () => {
      const result = await CompanyService.update(
        updateTestCompanyId,
        {
          status: 'INACTIVE',
        },
        adminId,
        'ADMIN'
      );

      expect(result.success).toBe(true);
      expect(result.company?.status).toBe('INACTIVE');
    });

    test('should reject update by non-owner', async () => {
      const result = await CompanyService.update(
        updateTestCompanyId,
        { name: 'Unauthorized Update' },
        'other-user-id',
        'EMPRESARIO'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });

    test('should reject update for non-existent company', async () => {
      const result = await CompanyService.update(
        'non-existent-id',
        { name: 'Update' },
        empresarioId,
        'EMPRESARIO'
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });
  });

  // ============================================================================
  // DELETE COMPANY TESTS
  // ============================================================================

  describe('Delete Company', () => {
    test('should have delete method available', () => {
      expect(typeof CompanyService.delete).toBe('function');
    });

    test('should reject delete for non-existent company', async () => {
      const result = await CompanyService.delete(
        'non-existent-id',
        empresarioId,
        'EMPRESARIO'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });

    test('should reject delete by non-owner', async () => {
      const createResult = await CompanyService.create(
        {
          name: 'Delete Test Company',
          cnpj: '11.222.333/0001-86',
        },
        empresarioId,
        'EMPRESARIO'
      );

      const deleteResult = await CompanyService.delete(
        createResult.company?.id!,
        'other-user-id',
        'EMPRESARIO'
      );

      expect(deleteResult.success).toBe(false);
      expect(deleteResult.error).toBeTruthy();
    });
  });

  // ============================================================================
  // ACCOUNTANT ASSIGNMENT TESTS (Integration Testing - Deferred to Phase 3)
  // ============================================================================

  describe('Assign Accountant (Integration)', () => {
    test('should have assignAccountant method available', () => {
      expect(typeof CompanyService.assignAccountant).toBe('function');
    });

    test('should have removeAccountant method available', () => {
      expect(typeof CompanyService.removeAccountant).toBe('function');
    });

    test('should have getAccountants method available', () => {
      expect(typeof CompanyService.getAccountants).toBe('function');
    });
  });

  // ============================================================================
  // AUTHORIZATION TESTS
  // ============================================================================

  describe('Authorization and Access Control', () => {
    test('EMPRESARIO can view their own companies', async () => {
      const result = await CompanyService.findByUserId(
        empresarioId,
        'EMPRESARIO'
      );

      expect(result.success).toBe(true);
      expect(Array.isArray(result.companies)).toBe(true);
      // All companies should belong to this user
      result.companies?.forEach((company) => {
        expect(company.ownerId).toBe(empresarioId);
      });
    });

    test('CONTADOR sees empty list if not assigned to companies', async () => {
      const result = await CompanyService.findByUserId(
        'unused-contador-id',
        'CONTADOR'
      );

      expect(result.success).toBe(true);
      expect(result.companies?.length).toBe(0);
    });

    test('ADMIN can see all companies', async () => {
      const result = await CompanyService.findByUserId(adminId, 'ADMIN');

      expect(result.success).toBe(true);
      expect(Array.isArray(result.companies)).toBe(true);
      expect(result.companies?.length).toBeGreaterThan(0);
    });
  });
});
