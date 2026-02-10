'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface TaxAnalysis {
  id: string;
  companyId: string;
  year: number;
  status: 'DRAFT' | 'COMPLETED' | 'REVIEWED' | 'ARCHIVED';
  analysisType: 'QUARTERLY' | 'ANNUAL' | 'CUSTOM';
  createdAt: string;
  updatedAt: string;
}

interface CreateAnalysisInput {
  companyId: string;
  year: number;
  grossRevenue: bigint;
  expenses?: bigint;
  deductions?: bigint;
  taxCredits?: bigint;
  previousPayments?: bigint;
  sector: string;
  analysisType: 'QUARTERLY' | 'ANNUAL' | 'CUSTOM';
  notes?: string;
}

interface ListAnalysesParams {
  page?: number;
  limit?: number;
  companyId?: string;
  year?: number;
  status?: string;
  search?: string;
}

export function useTaxAnalyses() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  // List analyses
  const listQuery = useQuery({
    queryKey: ['tax-analyses'],
    queryFn: async () => {
      const response = await fetch('/api/v1/tax/analyses', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to fetch analyses');
      }

      return response.json();
    },
  });

  // Create analysis
  const createMutation = useMutation({
    mutationFn: async (input: CreateAnalysisInput) => {
      // Convert bigint to string for JSON serialization
      const payload = {
        ...input,
        grossRevenue: input.grossRevenue.toString(),
        expenses: input.expenses?.toString(),
        deductions: input.deductions?.toString(),
        taxCredits: input.taxCredits?.toString(),
        previousPayments: input.previousPayments?.toString(),
      };

      const response = await fetch('/api/v1/tax/analyses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to create analysis');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tax-analyses'] });
      setError(null);
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  // Get analysis details
  const getAnalysis = useCallback(
    (id: string) =>
      useQuery({
        queryKey: ['tax-analysis', id],
        queryFn: async () => {
          const response = await fetch(`/api/v1/tax/analyses/${id}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          });

          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Failed to fetch analysis');
          }

          return response.json();
        },
      }),
    []
  );

  // Get regime comparison
  const getComparison = useCallback(
    (id: string) =>
      useQuery({
        queryKey: ['tax-comparison', id],
        queryFn: async () => {
          const response = await fetch(`/api/v1/tax/analyses/${id}/comparison`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          });

          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Failed to fetch comparison');
          }

          return response.json();
        },
      }),
    []
  );

  // Get opportunities
  const getOpportunities = useCallback(
    (id: string, filters?: any) =>
      useQuery({
        queryKey: ['tax-opportunities', id, filters],
        queryFn: async () => {
          const params = new URLSearchParams();
          if (filters?.category) params.append('category', filters.category);
          if (filters?.riskLevel) params.append('riskLevel', filters.riskLevel);
          if (filters?.minROI) params.append('minROI', filters.minROI);

          const response = await fetch(
            `/api/v1/tax/analyses/${id}/opportunities?${params.toString()}`,
            {
              method: 'GET',
              headers: { 'Content-Type': 'application/json' },
            }
          );

          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Failed to fetch opportunities');
          }

          return response.json();
        },
      }),
    []
  );

  // Update analysis
  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<TaxAnalysis & { reviewNotes?: string }>;
    }) => {
      const response = await fetch(`/api/v1/tax/analyses/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const respData = await response.json();
        throw new Error(respData.message || 'Failed to update analysis');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tax-analyses'] });
      queryClient.invalidateQueries({ queryKey: ['tax-analysis', variables.id] });
      setError(null);
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  return {
    // Queries
    analyses: listQuery.data?.analyses || [],
    isLoading: listQuery.isLoading,
    isError: listQuery.isError,
    pagination: listQuery.data?.pagination,

    // Mutations
    createAnalysis: createMutation.mutate,
    isCreating: createMutation.isPending,
    updateAnalysis: updateMutation.mutate,
    isUpdating: updateMutation.isPending,

    // Callbacks
    getAnalysis,
    getComparison,
    getOpportunities,

    // State
    error,
    setError,
  };
}
