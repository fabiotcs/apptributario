'use client';

import { useQuery } from '@tanstack/react-query';

interface TaxFiling {
  id: string;
  companyId: string;
  year: number;
  type: 'ECF' | 'ETR' | 'DARF' | 'ANNUAL_RETURN' | 'DECLARATION';
  description: string;
  dueDate: string;
  status: 'PENDING' | 'FILED' | 'OVERDUE' | 'EXEMPT';
  filedDate?: string;
  protocolNumber?: string;
  daysUntilDue: number;
  isOverdue: boolean;
}

interface ListFilingsParams {
  page?: number;
  limit?: number;
  companyId?: string;
  year?: number;
  status?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
}

export function useTaxFilings(params?: ListFilingsParams) {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.companyId) queryParams.append('companyId', params.companyId);
  if (params?.year) queryParams.append('year', params.year.toString());
  if (params?.status) queryParams.append('status', params.status);
  if (params?.dueDateFrom) queryParams.append('dueDateFrom', params.dueDateFrom);
  if (params?.dueDateTo) queryParams.append('dueDateTo', params.dueDateTo);

  return useQuery({
    queryKey: ['tax-filings', params],
    queryFn: async () => {
      const response = await fetch(`/api/v1/tax/filings?${queryParams.toString()}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to fetch filings');
      }

      return response.json();
    },
  });
}
