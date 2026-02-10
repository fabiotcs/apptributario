'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, AlertCircle } from 'lucide-react';
import { useAccountants } from '@/hooks/useAccountants';
import { AccountantCard } from '@/components/accountants/AccountantCard';
import { AccountantFilter } from '@/components/accountants/AccountantFilter';
import type { Specialization } from '@/lib/validation/accountant';

export default function AccountantsListPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { listAccountants, loading, error } = useAccountants();

  const [accountants, setAccountants] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [filters, setFilters] = useState({});
  const [isLoadingPage, setIsLoadingPage] = useState(false);

  useEffect(() => {
    if (!session?.user) return;

    const loadAccountants = async () => {
      try {
        setIsLoadingPage(true);
        const data = await listAccountants(page, limit, filters as any);
        setAccountants(data);
      } catch (err) {
        console.error('Failed to load accountants:', err);
      } finally {
        setIsLoadingPage(false);
      }
    };

    loadAccountants();
  }, [page, limit, filters, listAccountants, session]);

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    setPage(1);
  };

  const isContador = session?.user?.role === 'CONTADOR';
  const isAdmin = session?.user?.role === 'ADMIN';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Accountants</h1>
          <p className="text-gray-600 mt-1">Manage and browse accountant profiles</p>
        </div>
        {isContador && (
          <Link href="/dashboard/accountants/create">
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="h-5 w-5" />
              Create Profile
            </button>
          </Link>
        )}
      </div>

      {/* Filter Section */}
      <AccountantFilter onFilterChange={handleFilterChange} isLoading={isLoadingPage} />

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900">Error loading accountants</h3>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoadingPage && accountants.length === 0 && !error && (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No accountants found</h3>
          <p className="text-gray-600 mb-6">
            {isContador ? 'Create your accountant profile to get started.' : 'No accountants match your search criteria.'}
          </p>
          {isContador && (
            <Link href="/dashboard/accountants/create">
              <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700">
                <Plus className="h-5 w-5" />
                Create Profile
              </button>
            </Link>
          )}
        </div>
      )}

      {/* Loading State */}
      {isLoadingPage && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-gray-200 bg-white p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4" />
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded" />
                <div className="h-4 bg-gray-200 rounded w-5/6" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Accountants Grid */}
      {!isLoadingPage && accountants.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accountants.map((accountant: any) => (
              <AccountantCard
                key={accountant.id}
                id={accountant.id}
                name={accountant.user?.name || 'Accountant'}
                licenseNumber={accountant.licenseNumber}
                specializations={accountant.specializations}
                yearsOfExperience={accountant.yearsOfExperience}
                hourlyRate={accountant.hourlyRate}
                isAvailable={accountant.isAvailable}
                maxClients={accountant.maxClients}
                currentClientCount={accountant.currentClientCount}
                certifications={accountant.certifications}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Showing page {page} of {pagination.pages} ({pagination.total} total)
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1 || isLoadingPage}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(Math.min(pagination.pages, page + 1))}
                  disabled={page >= pagination.pages || isLoadingPage}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
