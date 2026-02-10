'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useCompanies } from '@/hooks/useCompanies';
import {
  Building2,
  MapPin,
  Mail,
  Phone,
  Globe,
  Users,
  Calendar,
  Briefcase,
  ArrowLeft,
  Edit,
  Trash2,
  AlertCircle,
} from 'lucide-react';

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

export default function CompanyDetailPage() {
  useRequireAuth();
  const router = useRouter();
  const params = useParams();
  const companyId = params.id as string;
  const { getCompany, deleteCompany, loading, error } = useCompanies();

  const [company, setCompany] = useState<Company | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchCompany = async () => {
      const result = await getCompany(companyId);
      if (result) {
        setCompany(result);
      }
    };

    fetchCompany();
  }, [companyId, getCompany]);

  const handleDelete = async () => {
    setDeleteError(null);
    setDeleteLoading(true);

    const success = await deleteCompany(companyId);
    if (success) {
      router.push('/dashboard/companies');
    } else {
      setDeleteError(error || 'Failed to delete company');
      setDeleteLoading(false);
    }
  };

  const formatCNPJ = (cnpj: string) => {
    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value?: number) => {
    if (!value) return 'N/A';
    return `R$ ${value.toLocaleString('pt-BR')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'INACTIVE':
        return 'bg-yellow-100 text-yellow-800';
      case 'ARCHIVED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="border-b border-gray-200 bg-white px-6 py-4">
          <div className="mx-auto max-w-4xl">
            <Link
              href="/dashboard/companies"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Companies
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
          <div className="mx-auto max-w-4xl">
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
          <div className="mx-auto max-w-4xl rounded-lg bg-red-50 p-4">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800">{error || 'Company not found'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard/companies"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Companies
            </Link>
            <div className="flex gap-2">
              <Link
                href={`/dashboard/companies/${companyId}/edit`}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                <Edit className="h-4 w-4" />
                Edit
              </Link>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-8">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Error Message */}
          {deleteError && (
            <div className="rounded-lg bg-red-50 p-4">
              <p className="text-sm text-red-800">{deleteError}</p>
            </div>
          )}

          {/* Company Header */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Building2 className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
                  <p className="text-gray-600">{formatCNPJ(company.cnpj)}</p>
                </div>
              </div>
              <span className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(company.status)}`}>
                {company.status}
              </span>
            </div>

            {company.description && (
              <p className="text-gray-600">{company.description}</p>
            )}
          </div>

          {/* Basic Information */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Basic Information</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {company.legalName && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Legal Name</p>
                  <p className="mt-1 text-gray-900">{company.legalName}</p>
                </div>
              )}
              {company.industry && (
                <div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Industry</p>
                      <p className="mt-1 text-gray-900">{company.industry}</p>
                    </div>
                  </div>
                </div>
              )}
              {company.foundedYear && (
                <div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Founded Year</p>
                      <p className="mt-1 text-gray-900">{company.foundedYear}</p>
                    </div>
                  </div>
                </div>
              )}
              {company.employees !== undefined && (
                <div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Employees</p>
                      <p className="mt-1 text-gray-900">{company.employees}</p>
                    </div>
                  </div>
                </div>
              )}
              {company.taxRegime && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Tax Regime</p>
                  <p className="mt-1 text-gray-900">
                    {company.taxRegime.replace(/_/g, ' ')}
                  </p>
                </div>
              )}
              {company.revenue && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Annual Revenue</p>
                  <p className="mt-1 text-gray-900">{formatCurrency(company.revenue)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Address */}
          {(company.address || company.city || company.state || company.zipCode) && (
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                <MapPin className="h-5 w-5 text-gray-400" />
                Address
              </h2>
              <div className="space-y-3">
                {company.address && (
                  <p className="text-gray-900">{company.address}</p>
                )}
                {(company.city || company.state || company.zipCode) && (
                  <p className="text-gray-900">
                    {company.city && <span>{company.city}</span>}
                    {company.city && company.state && <span>, </span>}
                    {company.state && <span>{company.state}</span>}
                    {company.zipCode && <span> - {company.zipCode}</span>}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Contact Information */}
          {(company.phone || company.email || company.website) && (
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Contact Information</h2>
              <div className="space-y-3">
                {company.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <a
                      href={`mailto:${company.email}`}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      {company.email}
                    </a>
                  </div>
                )}
                {company.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <a
                      href={`tel:${company.phone}`}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      {company.phone}
                    </a>
                  </div>
                )}
                {company.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-gray-400" />
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700"
                    >
                      {company.website}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Metadata</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-gray-600">Created</p>
                <p className="mt-1 text-gray-900">{formatDate(company.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Last Updated</p>
                <p className="mt-1 text-gray-900">{formatDate(company.updatedAt)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">Delete Company</h3>
            <p className="mt-2 text-gray-600">
              Are you sure you want to delete <strong>{company.name}</strong>? This action cannot be undone.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:bg-gray-400"
              >
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
