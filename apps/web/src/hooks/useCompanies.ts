'use client';

import { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { CreateCompanyInput, UpdateCompanyInput } from '@/lib/validation/company';

interface Company {
  id: string;
  cnpj: string;
  name: string;
  legalName?: string;
  industry?: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone?: string;
  email?: string;
  website?: string;
  foundedYear?: number;
  employees?: number;
  revenue?: number;
  taxRegime: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  owner?: {
    id: string;
    name: string;
    email: string;
  };
  companyUsers?: Array<{
    userId: string;
    role: string;
  }>;
}

interface CompanyListResponse {
  success: boolean;
  companies: Company[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

interface CompanyResponse {
  success: boolean;
  company: Company;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function useCompanies() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const listCompanies = useCallback(
    async (page = 1, limit = 20, filters?: any) => {
      if (!session?.user) {
        setError('Not authenticated');
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(limit),
          ...(filters?.status && { status: filters.status }),
          ...(filters?.industry && { industry: filters.industry }),
          ...(filters?.search && { search: filters.search }),
        });

        const response = await fetch(`${API_BASE}/api/v1/companies?${params}`, {
          headers: {
            Authorization: `Bearer ${session.user.jwtToken}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch companies');
        }

        const data: CompanyListResponse = await response.json();
        return data;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [session]
  );

  const getCompany = useCallback(
    async (companyId: string) => {
      if (!session?.user) {
        setError('Not authenticated');
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE}/api/v1/companies/${companyId}`, {
          headers: {
            Authorization: `Bearer ${session.user.jwtToken}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch company');
        }

        const data: CompanyResponse = await response.json();
        return data.company;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [session]
  );

  const createCompany = useCallback(
    async (input: CreateCompanyInput) => {
      if (!session?.user) {
        setError('Not authenticated');
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE}/api/v1/companies`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.user.jwtToken}`,
          },
          body: JSON.stringify(input),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to create company');
        }

        const data: CompanyResponse = await response.json();
        return data.company;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [session]
  );

  const updateCompany = useCallback(
    async (companyId: string, input: Partial<UpdateCompanyInput>) => {
      if (!session?.user) {
        setError('Not authenticated');
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE}/api/v1/companies/${companyId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.user.jwtToken}`,
          },
          body: JSON.stringify(input),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to update company');
        }

        const data: CompanyResponse = await response.json();
        return data.company;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [session]
  );

  const deleteCompany = useCallback(
    async (companyId: string) => {
      if (!session?.user) {
        setError('Not authenticated');
        return false;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE}/api/v1/companies/${companyId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${session.user.jwtToken}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete company');
        }

        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [session]
  );

  return {
    listCompanies,
    getCompany,
    createCompany,
    updateCompany,
    deleteCompany,
    loading,
    error,
  };
}
