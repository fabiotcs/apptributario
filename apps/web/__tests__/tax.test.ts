/**
 * Tax Analysis Frontend Tests
 * Testing validation schemas, component rendering, form submission
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  createTaxAnalysisSchema,
  updateTaxAnalysisSchema,
  searchTaxAnalysesSchema,
  taxRegimeSchema,
  taxOpportunitySchema,
  createTaxFilingSchema,
  formatCurrency,
  formatPercentage,
  getRegimeLabel,
  getRiskColor,
  getFilingTypeLabel,
  getStatusColor,
} from '@/lib/validation/tax';

describe('Tax Validation Schemas', () => {
  describe('createTaxAnalysisSchema', () => {
    it('should validate correct tax analysis data', () => {
      const validData = {
        companyId: '123e4567-e89b-12d3-a456-426614174000',
        year: 2024,
        analysisType: 'ANNUAL' as const,
        grossRevenue: 2500000, // R$ 25,000
        expenses: 1500000, // R$ 15,000
        deductions: 100000, // R$ 1,000
        sector: 'SERVICES',
      };
      const result = createTaxAnalysisSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject negative revenue', () => {
      const invalidData = {
        companyId: '123e4567-e89b-12d3-a456-426614174000',
        year: 2024,
        analysisType: 'ANNUAL' as const,
        grossRevenue: -100000, // Negative
        sector: 'SERVICES',
      };
      const result = createTaxAnalysisSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid year', () => {
      const invalidData = {
        companyId: '123e4567-e89b-12d3-a456-426614174000',
        year: 1999, // Too old
        analysisType: 'ANNUAL' as const,
        grossRevenue: 2500000,
        sector: 'SERVICES',
      };
      const result = createTaxAnalysisSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should convert float revenue to cents', () => {
      const data = {
        companyId: '123e4567-e89b-12d3-a456-426614174000',
        year: 2024,
        analysisType: 'ANNUAL' as const,
        grossRevenue: 1000.50, // R$ 1000.50
        sector: 'SERVICES',
      };
      const result = createTaxAnalysisSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.grossRevenue).toBe(100050); // In cents
      }
    });

    it('should require companyId as valid UUID', () => {
      const invalidData = {
        companyId: 'not-a-uuid',
        year: 2024,
        analysisType: 'ANNUAL' as const,
        grossRevenue: 2500000,
        sector: 'SERVICES',
      };
      const result = createTaxAnalysisSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should accept optional fields', () => {
      const minimalData = {
        companyId: '123e4567-e89b-12d3-a456-426614174000',
        year: 2024,
        analysisType: 'ANNUAL' as const,
        grossRevenue: 2500000,
        sector: 'SERVICES',
      };
      const result = createTaxAnalysisSchema.safeParse(minimalData);
      expect(result.success).toBe(true);
    });

    it('should validate quarterly analysis with quarter field', () => {
      const data = {
        companyId: '123e4567-e89b-12d3-a456-426614174000',
        year: 2024,
        quarter: 2,
        analysisType: 'QUARTERLY' as const,
        grossRevenue: 625000,
        sector: 'SERVICES',
      };
      const result = createTaxAnalysisSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe('searchTaxAnalysesSchema', () => {
    it('should validate search parameters', () => {
      const searchParams = {
        companyId: '123e4567-e89b-12d3-a456-426614174000',
        year: 2024,
        status: 'COMPLETED' as const,
        page: 1,
        limit: 10,
      };
      const result = searchTaxAnalysesSchema.safeParse(searchParams);
      expect(result.success).toBe(true);
    });

    it('should provide default pagination', () => {
      const minimal = {};
      const result = searchTaxAnalysesSchema.safeParse(minimal);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(10);
      }
    });
  });

  describe('createTaxFilingSchema', () => {
    it('should validate tax filing data', () => {
      const filingData = {
        companyId: '123e4567-e89b-12d3-a456-426614174000',
        filingType: 'ECF' as const,
        year: 2024,
        dueDate: new Date('2024-12-31'),
      };
      const result = createTaxFilingSchema.safeParse(filingData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid filing type', () => {
      const invalidData = {
        companyId: '123e4567-e89b-12d3-a456-426614174000',
        filingType: 'INVALID' as any,
        year: 2024,
        dueDate: new Date('2024-12-31'),
      };
      const result = createTaxFilingSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('taxRegimeSchema', () => {
    it('should validate regime comparison data', () => {
      const regimeData = {
        taxRate: 0.088,
        taxLiability: 220000,
        monthlyPayment: 18333,
        advantages: ['Cálculo simples', 'Menos burocracia'],
        disadvantages: ['Não recupera crédito de ICMS'],
        eligible: true,
      };
      const result = taxRegimeSchema.safeParse(regimeData);
      expect(result.success).toBe(true);
    });

    it('should validate tax rate between 0-100%', () => {
      const invalidRate = {
        taxRate: 150, // Over 100%
        taxLiability: 220000,
        monthlyPayment: 18333,
        advantages: [],
        disadvantages: [],
        eligible: true,
      };
      const result = taxRegimeSchema.safeParse(invalidRate);
      expect(result.success).toBe(false);
    });
  });

  describe('taxOpportunitySchema', () => {
    it('should validate opportunity data', () => {
      const opportunity = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        category: 'DEDUCTION' as const,
        opportunity: 'R&D Tax Credit',
        estimatedValue: 50000,
        riskLevel: 'LOW' as const,
        implementation: 'Document R&D expenses',
      };
      const result = taxOpportunitySchema.safeParse(opportunity);
      expect(result.success).toBe(true);
    });
  });
});

describe('Tax Helper Functions', () => {
  describe('formatCurrency', () => {
    it('should format cents to BRL currency', () => {
      expect(formatCurrency(100000)).toBe('R$ 1.000,00');
    });

    it('should handle zero', () => {
      expect(formatCurrency(0)).toBe('R$ 0,00');
    });

    it('should handle large amounts', () => {
      expect(formatCurrency(2500000)).toBe('R$ 25.000,00');
    });
  });

  describe('formatPercentage', () => {
    it('should format decimal to percentage', () => {
      expect(formatPercentage(0.088)).toBe('8.80%');
    });

    it('should handle 100%', () => {
      expect(formatPercentage(1.0)).toBe('100.00%');
    });
  });

  describe('getRegimeLabel', () => {
    it('should return correct label for Simples', () => {
      expect(getRegimeLabel('SIMPLES')).toBe('Simples Nacional');
    });

    it('should return correct label for Presumido', () => {
      expect(getRegimeLabel('PRESUMIDO')).toBe('Lucro Presumido');
    });

    it('should return correct label for Real', () => {
      expect(getRegimeLabel('REAL')).toBe('Lucro Real');
    });

    it('should return original if unknown', () => {
      expect(getRegimeLabel('UNKNOWN')).toBe('UNKNOWN');
    });
  });

  describe('getRiskColor', () => {
    it('should return correct colors for risk levels', () => {
      expect(getRiskColor('LOW')).toBe('green');
      expect(getRiskColor('MEDIUM')).toBe('yellow');
      expect(getRiskColor('HIGH')).toBe('red');
    });
  });

  describe('getFilingTypeLabel', () => {
    it('should return correct filing type labels', () => {
      expect(getFilingTypeLabel('ECF')).toBe('Escrituração Contábil Fiscal');
      expect(getFilingTypeLabel('DARF')).toBe('Pagamento de Impostos');
      expect(getFilingTypeLabel('ANNUAL_RETURN')).toBe('Declaração Anual');
    });
  });

  describe('getStatusColor', () => {
    it('should return correct colors for analysis status', () => {
      expect(getStatusColor('DRAFT')).toBe('blue');
      expect(getStatusColor('COMPLETED')).toBe('green');
      expect(getStatusColor('REVIEWED')).toBe('blue');
      expect(getStatusColor('ARCHIVED')).toBe('gray');
    });

    it('should return correct colors for filing status', () => {
      expect(getStatusColor('PENDING')).toBe('yellow');
      expect(getStatusColor('FILED')).toBe('green');
      expect(getStatusColor('OVERDUE')).toBe('red');
    });
  });
});

describe('Tax Analysis Form Validation', () => {
  it('should validate complete financial data entry', () => {
    const completeAnalysis = {
      companyId: '123e4567-e89b-12d3-a456-426614174000',
      year: 2024,
      analysisType: 'ANNUAL' as const,
      grossRevenue: 250000000, // R$ 2.5M
      expenses: 150000000, // R$ 1.5M
      deductions: 10000000, // R$ 100K
      taxCredits: 5000000, // R$ 50K
      previousPayments: 20000000, // R$ 200K
      sector: 'RETAIL',
    };

    const result = createTaxAnalysisSchema.safeParse(completeAnalysis);
    expect(result.success).toBe(true);
  });

  it('should calculate tax scenarios correctly', () => {
    // Simples Nacional: 2.5M revenue × 8.8% = 220K
    // Lucro Presumido: (2.5M × 32%) × 34% = 272K
    // Lucro Real: (2.5M - 1.5M - 0.1M) × 34% = 306K

    const taxScenario = {
      grossRevenue: 250000000,
      expenses: 150000000,
      deductions: 10000000,
    };

    const simplasNacional = (taxScenario.grossRevenue * 0.088) / 100;
    const lucroReal =
      ((taxScenario.grossRevenue - taxScenario.expenses - taxScenario.deductions) * 34) / 100;

    expect(simplasNacional).toBe(22000000); // R$ 220K
    expect(lucroReal).toBeGreaterThan(simplasNacional);
  });
});
