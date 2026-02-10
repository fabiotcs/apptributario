'use client';

import { useState } from 'react';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useCompanies } from '@/hooks/useCompanies';
import { CompanyForm } from '@/components/companies/CompanyForm';
import type { CreateCompanyInput } from '@/lib/validation/company';

export default function CreateCompanyPage() {
  useRequireAuth();
  const { createCompany, loading, error } = useCompanies();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (data: CreateCompanyInput) => {
    setSubmitError(null);
    const result = await createCompany(data);
    if (!result) {
      setSubmitError(error || 'Failed to create company');
      throw new Error(error || 'Failed to create company');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold text-gray-900">Create New Company</h1>
          <p className="mt-1 text-gray-600">Add a new business entity to your account</p>
        </div>
      </div>

      {/* Form */}
      <div className="px-6 py-8">
        <div className="mx-auto max-w-3xl rounded-lg border border-gray-200 bg-white p-6">
          {submitError && (
            <div className="mb-6 rounded-lg bg-red-50 p-4">
              <p className="text-sm text-red-800">{submitError}</p>
            </div>
          )}
          <CompanyForm onSubmit={handleSubmit} isLoading={loading} />
        </div>
      </div>
    </div>
  );
}
