'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit2, Trash2, AlertCircle, Mail, Phone, Globe, Award, GraduationCap, DollarSign, Users } from 'lucide-react';
import { useAccountants } from '@/hooks/useAccountants';
import { CertificationList } from '@/components/accountants/CertificationList';
import { SpecializationTag } from '@/components/accountants/SpecializationTag';
import { getExperienceBadge, formatHourlyRate, getAvailabilityBadge, getCapacityPercentage, getCapacityColor } from '@/lib/validation/accountant';

export default function AccountantDetailPage() {
  const params = useParams();
  const { data: session } = useSession();
  const router = useRouter();
  const { getAccountantProfile, getAssignedCompanies, getAuditLog, loading, error } = useAccountants();

  const accountantId = params?.id as string;
  const [profile, setProfile] = useState<any>(null);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [auditLog, setAuditLog] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user || !accountantId) return;

    const loadAccountantData = async () => {
      try {
        setIsLoading(true);
        const [profileData, assignmentsData, auditLogData] = await Promise.all([
          getAccountantProfile(accountantId),
          getAssignedCompanies(accountantId),
          getAuditLog(accountantId),
        ]);

        setProfile(profileData);
        setAssignments(assignmentsData);
        setAuditLog(auditLogData);
      } catch (err) {
        console.error('Failed to load accountant data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadAccountantData();
  }, [accountantId, session, getAccountantProfile, getAssignedCompanies, getAuditLog]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard/accountants">
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </button>
          </Link>
        </div>
        <div className="h-64 bg-gray-200 rounded-lg animate-pulse" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard/accountants">
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </button>
          </Link>
        </div>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">Accountant profile not found</p>
        </div>
      </div>
    );
  }

  const isOwner = session?.user?.id === profile.userId;
  const isAdmin = session?.user?.role === 'ADMIN';
  const canEdit = isOwner || isAdmin;

  const availabilityBadge = getAvailabilityBadge(profile.isAvailable);
  const experienceBadge = getExperienceBadge(profile.yearsOfExperience);
  const capacityPercentage = profile.maxClients ? getCapacityPercentage(profile.currentClientCount, profile.maxClients) : 0;
  const capacityColor = getCapacityColor(capacityPercentage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/dashboard/accountants">
          <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
        </Link>
        {canEdit && (
          <div className="flex gap-2">
            <Link href={`/dashboard/accountants/${accountantId}/edit`}>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
                <Edit2 className="h-4 w-4" />
                Edit
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            {/* Basic Info */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">{profile.user?.name || 'Accountant'}</h1>
              <p className="text-lg text-gray-500 font-mono mt-2">{profile.licenseNumber}</p>
            </div>

            {/* Specializations */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Specializations</h3>
              <div className="flex flex-wrap gap-2">
                {profile.specializations?.map((spec: any) => (
                  <SpecializationTag key={spec} specialization={spec} size="md" />
                ))}
              </div>
            </div>

            {/* Bio */}
            {profile.bio && (
              <div className="mb-6 pb-6 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Professional Bio</h3>
                <p className="text-gray-600">{profile.bio}</p>
              </div>
            )}

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6 pb-6 border-b border-gray-200">
              {/* Experience */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <GraduationCap className="h-5 w-5 text-blue-500" />
                  <p className="text-xs font-medium text-gray-500 uppercase">Experience</p>
                </div>
                <p className="text-lg font-semibold text-gray-900">{experienceBadge}</p>
              </div>

              {/* Hourly Rate */}
              {profile.hourlyRate !== undefined && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-5 w-5 text-green-500" />
                    <p className="text-xs font-medium text-gray-500 uppercase">Rate</p>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">{formatHourlyRate(profile.hourlyRate)}</p>
                </div>
              )}

              {/* Availability */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Award className="h-5 w-5" style={{ color: profile.isAvailable ? '#10b981' : '#9ca3af' }} />
                  <p className="text-xs font-medium text-gray-500 uppercase">Status</p>
                </div>
                <p className={`text-lg font-semibold ${profile.isAvailable ? 'text-green-600' : 'text-gray-600'}`}>
                  {availabilityBadge.label}
                </p>
              </div>
            </div>

            {/* Contact Information */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Contact Information</h3>
              <div className="space-y-3">
                {profile.email && (
                  <a href={`mailto:${profile.email}`} className="flex items-center gap-3 text-gray-600 hover:text-blue-600 transition-colors">
                    <Mail className="h-5 w-5" />
                    <span>{profile.email}</span>
                  </a>
                )}
                {profile.phone && (
                  <a href={`tel:${profile.phone}`} className="flex items-center gap-3 text-gray-600 hover:text-blue-600 transition-colors">
                    <Phone className="h-5 w-5" />
                    <span>{profile.phone}</span>
                  </a>
                )}
                {profile.website && (
                  <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-gray-600 hover:text-blue-600 transition-colors">
                    <Globe className="h-5 w-5" />
                    <span>{profile.website}</span>
                  </a>
                )}
              </div>
            </div>

            {/* Certifications */}
            {profile.certifications && profile.certifications.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Certifications</h3>
                <CertificationList certifications={profile.certifications} />
              </div>
            )}
          </div>

          {/* Assigned Companies */}
          {assignments.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Assigned Companies ({assignments.length})</h3>
              <div className="space-y-3">
                {assignments.map((assignment) => (
                  <div key={assignment.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <Link href={`/dashboard/companies/${assignment.company.id}`}>
                        <h4 className="font-semibold text-gray-900 hover:text-blue-600">{assignment.company.name}</h4>
                      </Link>
                      <p className="text-sm text-gray-500 font-mono">{assignment.company.cnpj}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                        assignment.role === 'MANAGER'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {assignment.role === 'MANAGER' ? 'Manager' : 'Advisor'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Audit Log */}
          {auditLog.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity History</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {auditLog.map((entry) => (
                  <div key={entry.id} className="flex gap-4 p-3 bg-gray-50 rounded-lg text-sm">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{entry.action}</p>
                      <p className="text-gray-500 text-xs mt-1">
                        {new Date(entry.createdAt).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Client Capacity */}
          {profile.maxClients && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-5 w-5 text-gray-400" />
                <h3 className="font-semibold text-gray-900">Client Capacity</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">{profile.currentClientCount} of {profile.maxClients} clients</p>
                  <span className="text-sm font-semibold text-gray-700">{capacityPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${capacityColor}`}
                    style={{ width: `${capacityPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Profile Metadata */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-sm">
            <div className="space-y-3">
              <div>
                <p className="text-gray-500 text-xs uppercase font-semibold">Created</p>
                <p className="text-gray-900 font-medium">{new Date(profile.createdAt).toLocaleDateString('pt-BR')}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase font-semibold">Last Updated</p>
                <p className="text-gray-900 font-medium">{new Date(profile.updatedAt).toLocaleDateString('pt-BR')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
