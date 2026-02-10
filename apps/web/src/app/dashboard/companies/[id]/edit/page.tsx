'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useCompanies } from '@/hooks/useCompanies';
import { CompanyForm } from '@/components/companies/CompanyForm';
import type { CreateCompanyInput } from '@/lib/validation/company';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Company {
  id: string;
  name: string;
  cnpj: string;
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
}

export default function EditCompanyPage() {
  useRequireAuth();
  const router = useRouter();
  const params = useParams();
  const companyId = params.id as string;
  const { getCompany, updateCompany, loading, error } = useCompanies();

  const [company, setCompany] = useState<Company | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompany = async () => {
      const result = await getCompany(companyId);
      if (result) {
        setCompany(result);
      }
    };

    fetchCompany();
  }, [companyId, getCompany]);

  const handleSubmit = async (data: CreateCompanyInput) => {
    setSubmitError(null);
    const result = await updateCompany(companyId, data);
    if (result) {
      router.push(`/dashboard/companies/${companyId}`);
    } else {
      setSubmitError(error || 'Failed to update company');
      throw new Error(error || 'Failed to update company');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="border-b border-gray-200 bg-white px-6 py-4">
          <div className="mx-auto max-w-3xl">
            <Link
              href={`/dashboard/companies/${companyId}`}
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Company
            </Link>
          </div>
        </div>
        <div className="flex items-center justify-center px-6 py-12">
          <p className="text-gray-600">Loading company details...</p>
        </div>
      </div>
    );
  }

  if (!company || error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="border-b border-gray-200 bg-white px-6 py-4">
          <div className="mx-auto max-w-3xl">
            <Link
              href="/dashboard/companies"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Companies
            </Link>
          </div>
        </div>
        <div className="px-6 py-12">
          <div className="mx-auto max-w-3xl rounded-lg bg-red-50 p-4">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800">{error || 'Company not found'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const initialData: Partial<CreateCompanyInput> = {
    name: company.name,
    cnpj: company.cnpj,
    legalName: company.legalName,
    industry: company.industry,
    description: company.description,
    address: company.address,
    city: company.city,
    state: company.state,
    zipCode: company.zipCode,
    phone: company.phone,
    email: company.email,
    website: company.website,
    foundedYear: company.foundedYear,
    employees: company.employees,
    revenue: company.revenue,
    taxRegime: company.taxRegime,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-8">
        <div className="mx-auto max-w-3xl">
          <Link
            href={`/dashboard/companies/${companyId}`}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Company
          </Link>
          <h1 className="mt-4 text-3xl font-bold text-gray-900">Edit Company</h1>
          <p className="mt-1 text-gray-600">Update company information</p>
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
          <CompanyForm
            initialData={initialData}
            onSubmit={handleSubmit}
            isLoading={loading}
            isEdit={true}
          />
        </div>
      </div>
    </div>
  );
}
