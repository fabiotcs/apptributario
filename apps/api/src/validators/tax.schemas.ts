import { z } from 'zod';

// Shared schemas
const uuidSchema = z.string().uuid('Invalid ID format');
const currencySchema = z.bigint().min(0n, 'Amount must be non-negative');
const yearSchema = z.number().int().min(2000).max(2050);

export const sectorEnum = z.enum([
  'COMÉRCIO',
  'INDÚSTRIA',
  'SERVIÇO',
  'TRANSPORTES',
  'INTERMEDIAÇÃO'
]);

export const analysisTypeEnum = z.enum([
  'QUARTERLY',
  'ANNUAL',
  'CUSTOM'
]);

export const analysisStatusEnum = z.enum([
  'DRAFT',
  'COMPLETED',
  'REVIEWED',
  'ARCHIVED'
]);

export const filingTypeEnum = z.enum([
  'ECF',
  'ETR',
  'DARF',
  'ANNUAL_RETURN',
  'DECLARATION'
]);

export const filingStatusEnum = z.enum([
  'PENDING',
  'FILED',
  'OVERDUE',
  'EXEMPT'
]);

export const opportunityCategoryEnum = z.enum([
  'DEDUCTION',
  'CREDIT',
  'TIMING',
  'EXPENSE_OPTIMIZATION'
]);

export const riskLevelEnum = z.enum([
  'LOW',
  'MEDIUM',
  'HIGH'
]);

// POST /tax/analyses - Create Tax Analysis
export const createTaxAnalysisSchema = z.object({
  companyId: uuidSchema,
  year: yearSchema,
  grossRevenue: z.bigint()
    .min(1n, 'Revenue must be greater than 0'),
  expenses: z.bigint().optional().default(0n),
  deductions: z.bigint().optional().default(0n),
  taxCredits: z.bigint().optional().default(0n),
  previousPayments: z.bigint().optional().default(0n),
  sector: sectorEnum,
  analysisType: analysisTypeEnum,
  notes: z.string().max(1000).optional(),
});

export type CreateTaxAnalysisInput = z.infer<typeof createTaxAnalysisSchema>;

// PATCH /tax/analyses/:id - Update Tax Analysis
export const updateTaxAnalysisSchema = z.object({
  status: analysisStatusEnum.optional(),
  notes: z.string().max(1000).optional(),
  expenses: z.bigint().optional(),
  deductions: z.bigint().optional(),
  taxCredits: z.bigint().optional(),
  previousPayments: z.bigint().optional(),
  reviewNotes: z.string().max(2000).optional(),
}).strict();

export type UpdateTaxAnalysisInput = z.infer<typeof updateTaxAnalysisSchema>;

// GET /tax/analyses - List Tax Analyses (query params)
export const listAnalysesQuerySchema = z.object({
  page: z.string().optional().transform(val => parseInt(val) || 1),
  limit: z.string().optional().transform(val => Math.min(parseInt(val) || 20, 100)),
  companyId: uuidSchema.optional(),
  year: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  status: analysisStatusEnum.optional(),
  search: z.string().max(100).optional(),
});

export type ListAnalysesQuery = z.infer<typeof listAnalysesQuerySchema>;

// GET /tax/analyses/:id/opportunities - Filter opportunities (query params)
export const opportunitiesFilterSchema = z.object({
  category: opportunityCategoryEnum.optional(),
  riskLevel: riskLevelEnum.optional(),
  minROI: z.number().min(0).max(100).optional(),
});

export type OpportunitiesFilter = z.infer<typeof opportunitiesFilterSchema>;

// GET /tax/filings - List Tax Filings (query params)
export const listFilingsQuerySchema = z.object({
  page: z.string().optional().transform(val => parseInt(val) || 1),
  limit: z.string().optional().transform(val => Math.min(parseInt(val) || 20, 100)),
  companyId: uuidSchema.optional(),
  year: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  status: filingStatusEnum.optional(),
  dueDateFrom: z.string().optional().refine(val => !val || !isNaN(Date.parse(val)), 'Invalid date'),
  dueDateTo: z.string().optional().refine(val => !val || !isNaN(Date.parse(val)), 'Invalid date'),
});

export type ListFilingsQuery = z.infer<typeof listFilingsQuerySchema>;

// POST /tax/forecast - Generate Tax Forecast
export const forecastSchema = z.object({
  companyId: uuidSchema,
  baseYear: yearSchema,
  forecastMonths: z.number().int().min(1).max(12),
  projectedMonthlyRevenue: z.bigint().optional(),
  seasonalityFactor: z.number().min(0.5).max(2.0).optional(),
  expectedExpenseGrowth: z.number().min(0).max(0.5).optional(),
  regimesToForecast: z.array(
    z.enum(['SIMPLES', 'PRESUMIDO', 'REAL'])
  ).optional(),
});

export type ForecastInput = z.infer<typeof forecastSchema>;

// Validation helpers
export function validateCompanyAccess(
  userId: string,
  companyOwnerId: string,
  userRole: string,
  accountantIds: string[] = []
): boolean {
  if (userRole === 'ADMIN') return true;
  if (companyOwnerId === userId) return true;
  if (accountantIds.includes(userId)) return true;
  return false;
}

export function formatCurrency(centavos: bigint | number): string {
  const num = typeof centavos === 'bigint' ? Number(centavos) : centavos;
  return (num / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}
