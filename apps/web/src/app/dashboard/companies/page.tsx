'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useCompanies } from '@/hooks/useCompanies';
import { CompanyCard } from '@/components/companies/CompanyCard';
import { Plus, Search, Filter } from 'lucide-react';

export default function CompaniesPage() {
  useRequireAuth();
  const router = useRouter();
  const { listCompanies, loading } = useCompanies();

  const [companies, setCompanies] = useState<any[]>([]);
  const [totalCompanies, setTotalCompanies] = useState(0);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');

  useEffect(() => {
    const fetchCompanies = async () => {
      const result = await listCompanies(page, 12, {
        search: searchTerm || undefined,
        status: statusFilter || undefined,
        industry: industryFilter || undefined,
      });

      if (result) {
        setCompanies(result.companies);
        setTotalCompanies(result.pagination.total);
      }
    };

    fetchCompanies();
  }, [page, searchTerm, statusFilter, industryFilter, listCompanies]);

  const totalPages = Math.ceil(totalCompanies / 12);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Companies</h1>
              <p className="mt-1 text-gray-600">Manage all your business entities</p>
            </div>
            <Link
              href="/dashboard/companies/create"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              <Plus className="h-5 w-5" />
              New Company
            </Link>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="mx-auto max-w-7xl space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or CNPJ..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

            {/* Industry Filter */}
            <div>
              <select
                value={industryFilter}
                onChange={(e) => {
                  setIndustryFilter(e.target.value);
                  setPage(1);
                }}
                className="rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">All Industries</option>
                <option value="TECH">Technology</option>
                <option value="RETAIL">Retail</option>
                <option value="MANUFACTURING">Manufacturing</option>
                <option value="SERVICES">Services</option>
              </select>
            </div>
          </div>

          {/* Results Count */}
          <p className="text-sm text-gray-600">
            Showing {companies.length > 0 ? (page - 1) * 12 + 1 : 0} to{' '}
            {Math.min(page * 12, totalCompanies)} of {totalCompanies} companies
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-8">
        <div className="mx-auto max-w-7xl">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-gray-600">Loading companies...</p>
            </div>
          ) : companies.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 py-12 text-center">
              <Building2 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-semibold text-gray-900">No companies found</h3>
              <p className="mt-1 text-gray-600">
                Get started by creating your first company
              </p>
              <Link
                href="/dashboard/companies/create"
                className="mt-4 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Create Company
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {companies.map((company) => (
                <CompanyCard
                  key={company.id}
                  id={company.id}
                  name={company.name}
                  cnpj={company.cnpj}
                  industry={company.industry}
                  city={company.city}
                  state={company.state}
                  employees={company.employees}
                  status={company.status}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="rounded-lg border border-gray-300 px-3 py-2 disabled:text-gray-400"
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .slice(Math.max(0, page - 2), Math.min(totalPages, page + 1))
                .map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`rounded-lg px-3 py-2 ${
                      p === page
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {p}
                  </button>
                ))}

              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="rounded-lg border border-gray-300 px-3 py-2 disabled:text-gray-400"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { Building2 } from 'lucide-react';
