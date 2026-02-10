import { z } from 'zod';

// Currency helper - converts real numbers to cents
const currencySchema = z.coerce.number().min(0, 'Must be non-negative').transform(val => Math.round(val * 100));

// Tax Analysis Schemas
export const createTaxAnalysisSchema = z.object({
  companyId: z.string().uuid('Invalid company ID'),
  year: z.coerce.number().int().min(2000).max(2100),
  quarter: z.number().int().min(1).max(4).optional(),
  analysisType: z.enum(['QUARTERLY', 'ANNUAL', 'CUSTOM']),

  // Financial data
  grossRevenue: currencySchema.refine(val => val > 0, 'Revenue must be greater than 0'),
  expenses: currencySchema.default(0),
  deductions: currencySchema.default(0),
  taxCredits: currencySchema.default(0),
  previousPayments: currencySchema.default(0),

  // Metadata
  sector: z.string().min(2, 'Sector is required'),
  notes: z.string().max(500).optional(),
});

export const updateTaxAnalysisSchema = createTaxAnalysisSchema.partial();

export const searchTaxAnalysesSchema = z.object({
  companyId: z.string().uuid().optional(),
  year: z.number().int().optional(),
  status: z.enum(['DRAFT', 'COMPLETED', 'REVIEWED', 'ARCHIVED']).optional(),
  analysisType: z.enum(['QUARTERLY', 'ANNUAL', 'CUSTOM']).optional(),
  page: z.number().int().default(1),
  limit: z.number().int().default(10),
});

// Tax Regime Schemas
export const taxRegimeSchema = z.object({
  taxRate: z.number().min(0).max(100),
  taxLiability: z.number(),
  monthlyPayment: z.number(),
  quarterlyPayment: z.number().optional(),
  advantages: z.array(z.string()),
  disadvantages: z.array(z.string()),
  eligible: z.boolean(),
  eligibilityNotes: z.string().optional(),
});

// Tax Opportunity Schemas
export const taxOpportunitySchema = z.object({
  id: z.string().uuid(),
  category: z.enum(['DEDUCTION', 'CREDIT', 'TIMING', 'EXPENSE_OPTIMIZATION']),
  opportunity: z.string(),
  estimatedValue: z.number(),
  riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  implementation: z.string(),
});

// Tax Filing Schemas
export const createTaxFilingSchema = z.object({
  companyId: z.string().uuid(),
  filingType: z.enum(['ECF', 'ETR', 'DARF', 'ANNUAL_RETURN']),
  quarter: z.number().int().min(1).max(4).optional(),
  year: z.coerce.number().int().min(2000).max(2100),
  dueDate: z.coerce.date(),
  status: z.enum(['PENDING', 'FILED', 'OVERDUE', 'EXEMPT']).default('PENDING'),
  notes: z.string().max(500).optional(),
});

export const updateTaxFilingSchema = z.object({
  status: z.enum(['PENDING', 'FILED', 'OVERDUE', 'EXEMPT']).optional(),
  filedDate: z.coerce.date().optional(),
  notes: z.string().max(500).optional(),
});

// Type exports
export type CreateTaxAnalysisInput = z.infer<typeof createTaxAnalysisSchema>;
export type UpdateTaxAnalysisInput = z.infer<typeof updateTaxAnalysisSchema>;
export type SearchTaxAnalysesInput = z.infer<typeof searchTaxAnalysesSchema>;
export type TaxRegime = z.infer<typeof taxRegimeSchema>;
export type TaxOpportunity = z.infer<typeof taxOpportunitySchema>;
export type CreateTaxFilingInput = z.infer<typeof createTaxFilingSchema>;
export type UpdateTaxFilingInput = z.infer<typeof updateTaxFilingSchema>;

// Helper functions
export const formatCurrency = (cents: number): string => {
  return (cents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

export const formatPercentage = (value: number): string => {
  return `${(value * 100).toFixed(2)}%`;
};

export const getRegimeLabel = (regime: string): string => {
  const labels: Record<string, string> = {
    SIMPLES: 'Simples Nacional',
    PRESUMIDO: 'Lucro Presumido',
    REAL: 'Lucro Real',
  };
  return labels[regime] || regime;
};

export const getRiskColor = (risk: string): string => {
  const colors: Record<string, string> = {
    LOW: 'green',
    MEDIUM: 'yellow',
    HIGH: 'red',
  };
  return colors[risk] || 'gray';
};

export const getFilingTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    ECF: 'Escrituração Contábil Fiscal',
    ETR: 'Escrituração Tributária em Rede',
    DARF: 'Pagamento de Impostos',
    ANNUAL_RETURN: 'Declaração Anual',
  };
  return labels[type] || type;
};

export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    PENDING: 'yellow',
    FILED: 'green',
    OVERDUE: 'red',
    EXEMPT: 'gray',
    DRAFT: 'blue',
    COMPLETED: 'green',
    REVIEWED: 'blue',
    ARCHIVED: 'gray',
  };
  return colors[status] || 'gray';
};
