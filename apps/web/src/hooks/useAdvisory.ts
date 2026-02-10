'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface AdvisoryRequest {
  id: string;
  companyId: string;
  analysisId: string;
  requestType: 'TAX_REVIEW' | 'GENERAL_ADVISORY';
  status: 'PENDING' | 'ASSIGNED' | 'REVIEWED' | 'CANCELLED';
  createdAt: string;
  assignedAt?: string;
  reviewedAt?: string;
  assignedAccountant?: any;
  reviewNotes?: string;
  reviewRecommendations?: string[];
}

interface CreateAdvisoryInput {
  companyId: string;
  analysisId: string;
  requestType: 'TAX_REVIEW' | 'GENERAL_ADVISORY';
  description?: string;
}

export function useAdvisory() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  // List advisories for company
  const listQuery = useQuery({
    queryKey: ['advisories'],
    queryFn: async (params?: { companyId?: string; status?: string }) => {
      const query = new URLSearchParams();
      if (params?.companyId) query.append('companyId', params.companyId);
      if (params?.status) query.append('status', params.status);

      const response = await fetch(`/api/v1/advisory?${query.toString()}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error('Failed to fetch advisories');
      return response.json();
    },
  });

  // Get advisory details
  const detailQuery = useQuery({
    queryKey: ['advisory-detail'],
    queryFn: async (advisoryId: string) => {
      const response = await fetch(`/api/v1/advisory/${advisoryId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error('Failed to fetch advisory');
      return response.json();
    },
    enabled: false,
  });

  // Create advisory
  const createMutation = useMutation({
    mutationFn: async (input: CreateAdvisoryInput) => {
      const response = await fetch('/api/v1/advisory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create advisory');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advisories'] });
      setError(null);
    },
    onError: (err) => {
      setError((err as Error).message);
    },
  });

  // Assign accountant
  const assignMutation = useMutation({
    mutationFn: async ({ advisoryId, accountantId }: { advisoryId: string; accountantId: string }) => {
      const response = await fetch(`/api/v1/advisory/${advisoryId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountantId }),
      });

      if (!response.ok) throw new Error('Failed to assign accountant');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advisories'] });
    },
  });

  // Submit review
  const reviewMutation = useMutation({
    mutationFn: async ({
      advisoryId,
      notes,
      recommendations,
      reviewStatus,
    }: {
      advisoryId: string;
      notes: string;
      recommendations: string[];
      reviewStatus: 'APPROVED' | 'NEEDS_REVISION' | 'REJECTED';
    }) => {
      const response = await fetch(`/api/v1/advisory/${advisoryId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes, recommendations, reviewStatus }),
      });

      if (!response.ok) throw new Error('Failed to submit review');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advisories'] });
    },
  });

  // Cancel advisory
  const cancelMutation = useMutation({
    mutationFn: async (advisoryId: string) => {
      const response = await fetch(`/api/v1/advisory/${advisoryId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to cancel advisory');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advisories'] });
    },
  });

  return {
    // Queries
    list: listQuery.data?.advisories || [],
    isLoading: listQuery.isLoading,
    error,

    // Mutations
    createAdvisory: createMutation.mutateAsync,
    assignAccountant: assignMutation.mutateAsync,
    submitReview: reviewMutation.mutateAsync,
    cancelAdvisory: cancelMutation.mutateAsync,

    // Status
    isCreating: createMutation.isPending,
    isAssigning: assignMutation.isPending,
    isReviewing: reviewMutation.isPending,
  };
}
