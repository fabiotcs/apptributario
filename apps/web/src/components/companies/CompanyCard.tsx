'use client';

import Link from 'next/link';
import { Building2, MapPin, Users, Briefcase } from 'lucide-react';

interface CompanyCardProps {
  id: string;
  name: string;
  cnpj: string;
  industry?: string;
  city?: string;
  state?: string;
  employees?: number;
  status?: string;
}

export function CompanyCard({
  id,
  name,
  cnpj,
  industry,
  city,
  state,
  employees,
  status = 'ACTIVE',
}: CompanyCardProps) {
  const statusColor =
    status === 'ACTIVE'
      ? 'bg-green-100 text-green-800'
      : status === 'INACTIVE'
        ? 'bg-yellow-100 text-yellow-800'
        : 'bg-gray-100 text-gray-800';

  const formatCNPJ = (cnpj: string) => {
    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  return (
    <Link href={`/dashboard/companies/${id}`}>
      <div className="cursor-pointer rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-blue-500 hover:shadow-lg">
        {/* Header */}
        <div className="mb-3 flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            <div>
              <h3 className="font-semibold text-gray-900">{name}</h3>
              <p className="text-sm text-gray-500">{formatCNPJ(cnpj)}</p>
            </div>
          </div>
          <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusColor}`}>
            {status}
          </span>
        </div>

        {/* Details Grid */}
        <div className="space-y-2">
          {industry && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Briefcase className="h-4 w-4" />
              <span>{industry}</span>
            </div>
          )}

          {(city || state) && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>
                {city}
                {city && state && ', '}
                {state}
              </span>
            </div>
          )}

          {employees !== undefined && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="h-4 w-4" />
              <span>{employees} employee{employees !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 border-t border-gray-100 pt-3">
          <button className="inline-flex text-sm font-medium text-blue-600 hover:text-blue-700">
            View Details →
          </button>
        </div>
      </div>
    </Link>
  );
}
