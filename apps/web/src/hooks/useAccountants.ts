import { useSession } from 'next-auth/react';
import { useState, useCallback } from 'react';
import type {
  CreateAccountantProfileInput,
  UpdateAccountantProfileInput,
  SearchAccountantsInput,
  Specialization,
  AssignmentRole,
} from '@/lib/validation/accountant';

interface Certification {
  name: string;
  issuer: string;
  expiryDate: string;
}

interface AccountantProfile {
  id: string;
  userId: string;
  licenseNumber: string;
  specializations: Specialization[];
  bio?: string;
  yearsOfExperience: number;
  hourlyRate?: number;
  email: string;
  phone?: string;
  website?: string;
  maxClients?: number;
  currentClientCount: number;
  isAvailable: boolean;
  certifications?: Certification[];
  profileImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface CompanyAssignment {
  id: string;
  accountantId: string;
  companyId: string;
  company: {
    id: string;
    name: string;
    cnpj: string;
  };
  role: AssignmentRole;
  notes?: string;
  assignedAt: string;
  assignedBy: string;
  endedAt?: string;
}

interface AuditLogEntry {
  id: string;
  accountantId: string;
  action: 'ASSIGNED' | 'REMOVED' | 'PROFILE_UPDATED' | 'AVAILABILITY_CHANGED' | 'REASSIGNED';
  companyId?: string;
  performedBy: string;
  changes?: Record<string, { before: any; after: any }>;
  createdAt: string;
}

interface ListResponse<T> {
  success: boolean;
  data: T[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

interface DetailResponse<T> {
  success: boolean;
  profile?: T;
  assignments?: T[];
  auditLog?: T[];
  message?: string;
}

interface SearchResponse {
  success: boolean;
  accountants: AccountantProfile[];
}

interface AssignmentResponse {
  success: boolean;
  assignment?: CompanyAssignment;
  message?: string;
}

export const useAccountants = () => {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAuthHeader = useCallback(() => {
    if (!session?.user?.jwtToken) {
      throw new Error('Not authenticated');
    }
    return {
      'Authorization': `Bearer ${session.user.jwtToken}`,
      'Content-Type': 'application/json',
    };
  }, [session]);

  const listAccountants = useCallback(
    async (page: number = 1, limit: number = 20, filters?: {
      search?: string;
      specialization?: Specialization;
      isAvailable?: boolean;
      yearsOfExperience?: number;
    }) => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('limit', limit.toString());
        if (filters?.search) params.append('search', filters.search);
        if (filters?.specialization) params.append('specialization', filters.specialization);
        if (filters?.isAvailable !== undefined) params.append('isAvailable', filters.isAvailable.toString());
        if (filters?.yearsOfExperience !== undefined) params.append('yearsOfExperience', filters.yearsOfExperience.toString());

        const response = await fetch(`/api/v1/accountants?${params}`, {
          headers: getAuthHeader(),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch accountants');
        }

        const data = await response.json();
        return data.accountants || [];
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeader]
  );

  const getAccountantProfile = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/v1/accountants/${id}`, {
          headers: getAuthHeader(),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch accountant profile');
        }

        const data = await response.json();
        return data.profile as AccountantProfile;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeader]
  );

  const createAccountantProfile = useCallback(
    async (input: CreateAccountantProfileInput) => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/v1/accountants/profile', {
          method: 'POST',
          headers: getAuthHeader(),
          body: JSON.stringify(input),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to create accountant profile');
        }

        const data = await response.json();
        return data.profile as AccountantProfile;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeader]
  );

  const updateAccountantProfile = useCallback(
    async (id: string, updates: UpdateAccountantProfileInput) => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/v1/accountants/${id}/profile`, {
          method: 'PATCH',
          headers: getAuthHeader(),
          body: JSON.stringify(updates),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to update accountant profile');
        }

        const data = await response.json();
        return data.profile as AccountantProfile;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeader]
  );

  const updateAvailability = useCallback(
    async (id: string, isAvailable: boolean) => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/v1/accountants/${id}/availability`, {
          method: 'PATCH',
          headers: getAuthHeader(),
          body: JSON.stringify({ isAvailable }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to update availability');
        }

        const data = await response.json();
        return data.profile as AccountantProfile;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeader]
  );

  const getAssignedCompanies = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/v1/accountants/${id}/assignments`, {
          headers: getAuthHeader(),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch assigned companies');
        }

        const data = await response.json();
        return data.assignments as CompanyAssignment[];
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeader]
  );

  const assignAccountantToCompany = useCallback(
    async (accountantId: string, companyId: string, role: AssignmentRole, notes?: string) => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/v1/accountants/${accountantId}/assignments`, {
          method: 'POST',
          headers: getAuthHeader(),
          body: JSON.stringify({ companyId, role, notes }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to assign accountant');
        }

        const data = await response.json();
        return data.assignment as CompanyAssignment;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeader]
  );

  const updateAssignmentRole = useCallback(
    async (accountantId: string, companyId: string, role: AssignmentRole) => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/v1/accountants/${accountantId}/assignments/${companyId}`, {
          method: 'PATCH',
          headers: getAuthHeader(),
          body: JSON.stringify({ role }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to update assignment role');
        }

        const data = await response.json();
        return data.assignment as CompanyAssignment;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeader]
  );

  const removeAssignment = useCallback(
    async (accountantId: string, companyId: string) => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/v1/accountants/${accountantId}/assignments/${companyId}`, {
          method: 'DELETE',
          headers: getAuthHeader(),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to remove assignment');
        }

        return await response.json();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeader]
  );

  const getAuditLog = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/v1/accountants/${id}/audit-log`, {
          headers: getAuthHeader(),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch audit log');
        }

        const data = await response.json();
        return data.auditLog as AuditLogEntry[];
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeader]
  );

  const searchAccountants = useCallback(
    async (input: SearchAccountantsInput) => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/v1/accountants/search', {
          method: 'POST',
          headers: getAuthHeader(),
          body: JSON.stringify(input),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to search accountants');
        }

        const data = await response.json();
        return data.accountants as AccountantProfile[];
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeader]
  );

  return {
    loading,
    error,
    listAccountants,
    getAccountantProfile,
    createAccountantProfile,
    updateAccountantProfile,
    updateAvailability,
    getAssignedCompanies,
    assignAccountantToCompany,
    updateAssignmentRole,
    removeAssignment,
    getAuditLog,
    searchAccountants,
  };
};
