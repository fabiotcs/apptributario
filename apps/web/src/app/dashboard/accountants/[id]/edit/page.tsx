'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useAccountants } from '@/hooks/useAccountants';
import { AccountantForm } from '@/components/accountants/AccountantForm';
import type { UpdateAccountantProfileInput } from '@/lib/validation/accountant';

export default function EditAccountantPage() {
  const params = useParams();
  const { data: session } = useSession();
  const router = useRouter();
  const { getAccountantProfile, updateAccountantProfile, loading } = useAccountants();

  const accountantId = params?.id as string;
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user || !accountantId) return;

    const loadProfile = async () => {
      try {
        setIsLoading(true);
        const data = await getAccountantProfile(accountantId);
        setProfile(data);

        // Check authorization
        if (data.userId !== session.user?.id && session.user?.role !== 'ADMIN') {
          setError('You do not have permission to edit this profile');
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load accountant profile';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [accountantId, session, getAccountantProfile]);

  const handleSubmit = async (data: UpdateAccountantProfileInput) => {
    try {
      setSubmitError(null);
      await updateAccountantProfile(accountantId, data);
      router.push(`/dashboard/accountants/${accountantId}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update accountant profile';
      setSubmitError(message);
    }
  };

  const handleCancel = () => {
    router.push(`/dashboard/accountants/${accountantId}`);
  };

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

  if (error) {
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
          <h3 className="font-semibold text-red-900">Error</h3>
          <p className="text-red-700 text-sm mt-1">{error}</p>
        </div>
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

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/dashboard/accountants/${accountantId}`}>
          <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Accountant Profile</h1>
          <p className="text-gray-600 mt-1">Update professional information</p>
        </div>
      </div>

      {/* Error Alert */}
      {submitError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="font-semibold text-red-900">Error</h3>
          <p className="text-red-700 text-sm mt-1">{submitError}</p>
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <AccountantForm
          initialData={{
            licenseNumber: profile.licenseNumber,
            specializations: profile.specializations,
            bio: profile.bio,
            yearsOfExperience: profile.yearsOfExperience,
            hourlyRate: profile.hourlyRate,
            email: profile.email,
            phone: profile.phone,
            website: profile.website,
            maxClients: profile.maxClients,
            certifications: profile.certifications,
            profileImageUrl: profile.profileImageUrl,
          }}
          isEdit={true}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={loading}
        />
      </div>
    </div>
  );
}
