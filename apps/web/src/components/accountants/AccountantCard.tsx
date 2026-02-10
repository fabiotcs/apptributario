'use client';

import Link from 'next/link';
import { Award, Briefcase, GraduationCap, DollarSign, Users, CheckCircle2, AlertCircle } from 'lucide-react';
import {
  SpecializationLabels,
  SpecializationColors,
  getExperienceBadge,
  formatHourlyRate,
  getAvailabilityBadge,
  getCapacityPercentage,
  getCapacityColor,
} from '@/lib/validation/accountant';
import type { Specialization } from '@/lib/validation/accountant';

interface AccountantCardProps {
  id: string;
  name?: string;
  licenseNumber: string;
  specializations: Specialization[];
  yearsOfExperience: number;
  hourlyRate?: number;
  isAvailable: boolean;
  maxClients?: number;
  currentClientCount: number;
  certifications?: Array<{ name: string; issuer: string; expiryDate: string }>;
}

export function AccountantCard({
  id,
  name = 'Accountant',
  licenseNumber,
  specializations,
  yearsOfExperience,
  hourlyRate,
  isAvailable,
  maxClients,
  currentClientCount,
  certifications = [],
}: AccountantCardProps) {
  const availabilityBadge = getAvailabilityBadge(isAvailable);
  const capacityPercentage = maxClients ? getCapacityPercentage(currentClientCount, maxClients) : 0;
  const capacityColor = getCapacityColor(capacityPercentage);
  const experienceBadge = getExperienceBadge(yearsOfExperience);

  return (
    <Link href={`/dashboard/accountants/${id}`}>
      <div className="group relative h-full rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-blue-300 cursor-pointer">
        {/* Header with License and Availability */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
            <p className="text-sm text-gray-500 font-mono">{licenseNumber}</p>
          </div>
          <div className="flex items-center gap-2">
            {isAvailable ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-gray-400" />
            )}
          </div>
        </div>

        {/* Specializations */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {specializations.slice(0, 2).map((spec) => (
              <span
                key={spec}
                className={`text-xs font-medium px-2.5 py-1 rounded-full ${SpecializationColors[spec]}`}
              >
                {SpecializationLabels[spec]}
              </span>
            ))}
            {specializations.length > 2 && (
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">
                +{specializations.length - 2}
              </span>
            )}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-100">
          {/* Experience */}
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-blue-500" />
            <div>
              <p className="text-xs text-gray-500">Experience</p>
              <p className="text-sm font-semibold text-gray-900">{experienceBadge}</p>
            </div>
          </div>

          {/* Hourly Rate */}
          {hourlyRate !== undefined && (
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-xs text-gray-500">Rate</p>
                <p className="text-sm font-semibold text-gray-900">{formatHourlyRate(hourlyRate)}</p>
              </div>
            </div>
          )}

          {/* Certifications */}
          {certifications.length > 0 && (
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-xs text-gray-500">Certifications</p>
                <p className="text-sm font-semibold text-gray-900">{certifications.length}</p>
              </div>
            </div>
          )}

          {/* Availability Status */}
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" style={{ color: isAvailable ? '#10b981' : '#9ca3af' }} />
            <div>
              <p className="text-xs text-gray-500">Status</p>
              <p className={`text-sm font-semibold ${isAvailable ? 'text-green-600' : 'text-gray-600'}`}>
                {availabilityBadge.label}
              </p>
            </div>
          </div>
        </div>

        {/* Client Capacity */}
        {maxClients && (
          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-400" />
                <p className="text-xs font-medium text-gray-600">
                  Clients: {currentClientCount}/{maxClients}
                </p>
              </div>
              <span className="text-xs font-semibold text-gray-700">{capacityPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className={`h-2 rounded-full transition-all ${capacityColor}`} style={{ width: `${capacityPercentage}%` }} />
            </div>
          </div>
        )}

        {/* View Details Link */}
        <div className="pt-3 flex items-center text-sm font-medium text-blue-600 group-hover:text-blue-700 transition-colors">
          View Profile
          <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
