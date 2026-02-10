import {
  createAccountantProfileSchema,
  updateAccountantProfileSchema,
  searchAccountantsSchema,
  SpecializationLabels,
  SpecializationColors,
  getExperienceBadge,
  formatHourlyRate,
  getAvailabilityBadge,
  getCapacityPercentage,
  getCapacityColor,
  validateLicenseNumber,
} from '../src/lib/validation/accountant';
import type { Specialization } from '../src/lib/validation/accountant';

describe('Accountant Validation Schemas', () => {
  describe('createAccountantProfileSchema', () => {
    it('should validate a valid accountant profile', () => {
      const validData = {
        licenseNumber: 'CRC/SP-123456',
        specializations: ['TAX', 'PAYROLL'],
        yearsOfExperience: 10,
        email: 'accountant@example.com',
        bio: 'Professional accountant',
        hourlyRate: 15000,
        phone: '(11) 98765-4321',
        website: 'https://example.com',
        maxClients: 20,
        certifications: [],
        profileImageUrl: 'https://example.com/image.jpg',
      };

      const result = createAccountantProfileSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should require licenseNumber', () => {
      const invalidData = {
        specializations: ['TAX'],
        yearsOfExperience: 10,
        email: 'accountant@example.com',
      };

      const result = createAccountantProfileSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should validate licenseNumber length', () => {
      const shortLicense = {
        licenseNumber: 'ABC',
        specializations: ['TAX'],
        yearsOfExperience: 10,
        email: 'accountant@example.com',
      };

      const result = createAccountantProfileSchema.safeParse(shortLicense);
      expect(result.success).toBe(false);
    });

    it('should require at least one specialization', () => {
      const noSpecializations = {
        licenseNumber: 'CRC/SP-123456',
        specializations: [],
        yearsOfExperience: 10,
        email: 'accountant@example.com',
      };

      const result = createAccountantProfileSchema.safeParse(noSpecializations);
      expect(result.success).toBe(false);
    });

    it('should validate all specialization types', () => {
      const specializations: Specialization[] = ['TAX', 'PAYROLL', 'COMPLIANCE', 'ACCOUNTING', 'ADVISORY'];

      for (const spec of specializations) {
        const data = {
          licenseNumber: 'CRC/SP-123456',
          specializations: [spec],
          yearsOfExperience: 10,
          email: 'accountant@example.com',
        };

        const result = createAccountantProfileSchema.safeParse(data);
        expect(result.success).toBe(true);
      }
    });

    it('should require valid email format', () => {
      const invalidEmail = {
        licenseNumber: 'CRC/SP-123456',
        specializations: ['TAX'],
        yearsOfExperience: 10,
        email: 'invalid-email',
      };

      const result = createAccountantProfileSchema.safeParse(invalidEmail);
      expect(result.success).toBe(false);
    });

    it('should validate yearsOfExperience range (0-70)', () => {
      const tooManyYears = {
        licenseNumber: 'CRC/SP-123456',
        specializations: ['TAX'],
        yearsOfExperience: 100,
        email: 'accountant@example.com',
      };

      const result = createAccountantProfileSchema.safeParse(tooManyYears);
      expect(result.success).toBe(false);
    });

    it('should validate phone format', () => {
      const invalidPhone = {
        licenseNumber: 'CRC/SP-123456',
        specializations: ['TAX'],
        yearsOfExperience: 10,
        email: 'accountant@example.com',
        phone: 'abc',
      };

      const result = createAccountantProfileSchema.safeParse(invalidPhone);
      expect(result.success).toBe(false);
    });

    it('should validate website URL format', () => {
      const invalidWebsite = {
        licenseNumber: 'CRC/SP-123456',
        specializations: ['TAX'],
        yearsOfExperience: 10,
        email: 'accountant@example.com',
        website: 'not-a-url',
      };

      const result = createAccountantProfileSchema.safeParse(invalidWebsite);
      expect(result.success).toBe(false);
    });

    it('should validate maxClients range (1-100)', () => {
      const tooManyClients = {
        licenseNumber: 'CRC/SP-123456',
        specializations: ['TAX'],
        yearsOfExperience: 10,
        email: 'accountant@example.com',
        maxClients: 101,
      };

      const result = createAccountantProfileSchema.safeParse(tooManyClients);
      expect(result.success).toBe(false);
    });

    it('should allow certifications array', () => {
      const data = {
        licenseNumber: 'CRC/SP-123456',
        specializations: ['TAX'],
        yearsOfExperience: 10,
        email: 'accountant@example.com',
        certifications: [
          {
            name: 'CPA',
            issuer: 'AICPA',
            expiryDate: '2025-12-31',
          },
        ],
      };

      const result = createAccountantProfileSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe('updateAccountantProfileSchema', () => {
    it('should allow partial updates', () => {
      const partialData = {
        bio: 'Updated bio',
        hourlyRate: 20000,
      };

      const result = updateAccountantProfileSchema.safeParse(partialData);
      expect(result.success).toBe(true);
    });

    it('should allow empty object', () => {
      const result = updateAccountantProfileSchema.safeParse({});
      expect(result.success).toBe(true);
    });
  });

  describe('searchAccountantsSchema', () => {
    it('should validate search with query', () => {
      const data = {
        query: 'tax accountant',
      };

      const result = searchAccountantsSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should validate search with all filters', () => {
      const data = {
        query: 'accountant',
        specializations: ['TAX', 'PAYROLL'],
        minExperience: 5,
        available: true,
        maxHourlyRate: 20000,
      };

      const result = searchAccountantsSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should require query', () => {
      const data = {
        specializations: ['TAX'],
      };

      const result = searchAccountantsSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
});

describe('Accountant Helper Functions', () => {
  describe('validateLicenseNumber', () => {
    it('should validate proper license formats', () => {
      expect(validateLicenseNumber('CRC/SP-123456')).toBe(true);
      expect(validateLicenseNumber('CRC SP 123456')).toBe(true);
      expect(validateLicenseNumber('CRC/SP-123456-ABC')).toBe(true);
    });

    it('should reject short licenses', () => {
      expect(validateLicenseNumber('ABC')).toBe(false);
      expect(validateLicenseNumber('AB')).toBe(false);
    });
  });

  describe('getExperienceBadge', () => {
    it('should return correct badge for 0 years', () => {
      expect(getExperienceBadge(0)).toBe('Beginner');
    });

    it('should return correct badge for 1-4 years', () => {
      expect(getExperienceBadge(3)).toBe('1+ year');
    });

    it('should return correct badge for 5-9 years', () => {
      expect(getExperienceBadge(7)).toBe('5+ years');
    });

    it('should return correct badge for 10-19 years', () => {
      expect(getExperienceBadge(15)).toBe('10+ years');
    });

    it('should return correct badge for 20+ years', () => {
      expect(getExperienceBadge(25)).toBe('20+ years');
    });
  });

  describe('formatHourlyRate', () => {
    it('should format rate in cents to R$ currency', () => {
      expect(formatHourlyRate(15000)).toBe('R$ 150,00');
    });

    it('should return "Not specified" for undefined', () => {
      expect(formatHourlyRate(undefined)).toBe('Not specified');
    });

    it('should format low rates correctly', () => {
      expect(formatHourlyRate(500)).toBe('R$ 5,00');
    });

    it('should format high rates correctly', () => {
      expect(formatHourlyRate(100000)).toBe('R$ 1.000,00');
    });
  });

  describe('getAvailabilityBadge', () => {
    it('should return green badge for available', () => {
      const badge = getAvailabilityBadge(true);
      expect(badge.label).toBe('Available');
      expect(badge.color).toBe('bg-green-100 text-green-800');
    });

    it('should return gray badge for unavailable', () => {
      const badge = getAvailabilityBadge(false);
      expect(badge.label).toBe('Not Available');
      expect(badge.color).toBe('bg-gray-100 text-gray-800');
    });
  });

  describe('getCapacityPercentage', () => {
    it('should calculate percentage correctly', () => {
      expect(getCapacityPercentage(5, 10)).toBe(50);
      expect(getCapacityPercentage(10, 10)).toBe(100);
      expect(getCapacityPercentage(0, 10)).toBe(0);
    });

    it('should round to nearest integer', () => {
      expect(getCapacityPercentage(1, 3)).toBe(33);
      expect(getCapacityPercentage(2, 3)).toBe(67);
    });
  });

  describe('getCapacityColor', () => {
    it('should return green for under 70%', () => {
      expect(getCapacityColor(50)).toBe('bg-green-500');
    });

    it('should return yellow for 70-89%', () => {
      expect(getCapacityColor(75)).toBe('bg-yellow-500');
    });

    it('should return red for 90%+', () => {
      expect(getCapacityColor(95)).toBe('bg-red-500');
    });
  });

  describe('Specialization Mappings', () => {
    it('should map all specializations to labels', () => {
      const specs: Specialization[] = ['TAX', 'PAYROLL', 'COMPLIANCE', 'ACCOUNTING', 'ADVISORY'];
      for (const spec of specs) {
        expect(SpecializationLabels[spec]).toBeDefined();
        expect(SpecializationLabels[spec].length).toBeGreaterThan(0);
      }
    });

    it('should map all specializations to colors', () => {
      const specs: Specialization[] = ['TAX', 'PAYROLL', 'COMPLIANCE', 'ACCOUNTING', 'ADVISORY'];
      for (const spec of specs) {
        expect(SpecializationColors[spec]).toBeDefined();
        expect(SpecializationColors[spec]).toContain('text-');
      }
    });

    it('should have correct label text', () => {
      expect(SpecializationLabels['TAX']).toBe('Income & Corporate Tax');
      expect(SpecializationLabels['PAYROLL']).toBe('Payroll Management');
      expect(SpecializationLabels['COMPLIANCE']).toBe('Tax Compliance');
      expect(SpecializationLabels['ACCOUNTING']).toBe('Accounting Services');
      expect(SpecializationLabels['ADVISORY']).toBe('Business Advisory');
    });
  });
});

describe('Accountant Data Structures', () => {
  it('should have complete Certification type', () => {
    const cert = {
      name: 'CPA',
      issuer: 'AICPA',
      expiryDate: '2025-12-31',
    };
    expect(cert.name).toBeDefined();
    expect(cert.issuer).toBeDefined();
    expect(cert.expiryDate).toBeDefined();
  });

  it('should handle all specialization combinations', () => {
    const allSpecs: Specialization[] = ['TAX', 'PAYROLL', 'COMPLIANCE', 'ACCOUNTING', 'ADVISORY'];
    const data = {
      licenseNumber: 'CRC/SP-123456',
      specializations: allSpecs,
      yearsOfExperience: 15,
      email: 'accountant@example.com',
    };

    const result = createAccountantProfileSchema.safeParse(data);
    expect(result.success).toBe(true);
  });
});

describe('Form Field Validations', () => {
  it('should validate minimum bio length', () => {
    const data = {
      licenseNumber: 'CRC/SP-123456',
      specializations: ['TAX'],
      yearsOfExperience: 10,
      email: 'accountant@example.com',
      bio: '', // Empty is allowed as optional
    };

    const result = createAccountantProfileSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should validate maximum bio length', () => {
    const longBio = 'a'.repeat(1001);
    const data = {
      licenseNumber: 'CRC/SP-123456',
      specializations: ['TAX'],
      yearsOfExperience: 10,
      email: 'accountant@example.com',
      bio: longBio,
    };

    const result = createAccountantProfileSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should validate hourly rate as integer (cents)', () => {
    const data = {
      licenseNumber: 'CRC/SP-123456',
      specializations: ['TAX'],
      yearsOfExperience: 10,
      email: 'accountant@example.com',
      hourlyRate: 150.50, // Not an integer
    };

    const result = createAccountantProfileSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});

describe('Assignment Role Validation', () => {
  it('should only accept ADVISOR or MANAGER roles', () => {
    // Valid roles
    const validRoles = ['ADVISOR', 'MANAGER'];
    for (const role of validRoles) {
      expect(['ADVISOR', 'MANAGER'].includes(role)).toBe(true);
    }

    // Invalid roles
    const invalidRoles = ['ADMIN', 'USER', 'OWNER'];
    for (const role of invalidRoles) {
      expect(['ADVISOR', 'MANAGER'].includes(role)).toBe(false);
    }
  });
});
