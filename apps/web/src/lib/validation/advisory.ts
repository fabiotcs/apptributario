import { z } from 'zod';

export const createAdvisoryRequestSchema = z.object({
  companyId: z.string().uuid('Invalid company ID'),
  analysisId: z.string().uuid('Invalid analysis ID'),
  requestType: z.enum(['TAX_REVIEW', 'GENERAL_ADVISORY']),
  description: z.string().max(1000).optional(),
});

export const assignAccountantSchema = z.object({
  accountantId: z.string().uuid('Invalid accountant ID'),
});

export const submitReviewSchema = z.object({
  notes: z.string().min(10, 'Review notes must be at least 10 characters'),
  recommendations: z.array(z.string()).default([]),
  reviewStatus: z.enum(['APPROVED', 'NEEDS_REVISION', 'REJECTED']),
});

export const searchAdvisoriesSchema = z.object({
  companyId: z.string().uuid().optional(),
  status: z.enum(['PENDING', 'ASSIGNED', 'REVIEWED', 'CANCELLED']).optional(),
  requestType: z.enum(['TAX_REVIEW', 'GENERAL_ADVISORY']).optional(),
  page: z.number().int().default(1),
  limit: z.number().int().default(10),
});

// Type exports
export type CreateAdvisoryRequest = z.infer<typeof createAdvisoryRequestSchema>;
export type AssignAccountant = z.infer<typeof assignAccountantSchema>;
export type SubmitReview = z.infer<typeof submitReviewSchema>;
export type SearchAdvisories = z.infer<typeof searchAdvisoriesSchema>;

// Helper functions
export const getAdvisoryStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    PENDING: 'Aguardando',
    ASSIGNED: 'Em análise',
    REVIEWED: 'Analisado',
    CANCELLED: 'Cancelado',
  };
  return labels[status] || status;
};

export const getAdvisoryTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    TAX_REVIEW: 'Análise Tributária',
    GENERAL_ADVISORY: 'Parecer Geral',
  };
  return labels[type] || type;
};

export const getReviewStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    APPROVED: 'green',
    NEEDS_REVISION: 'yellow',
    REJECTED: 'red',
  };
  return colors[status] || 'gray';
};

export const getReviewStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    APPROVED: 'Aprovado',
    NEEDS_REVISION: 'Revisão Necessária',
    REJECTED: 'Rejeitado',
  };
  return labels[status] || status;
};
