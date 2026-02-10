'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { useAccountants } from '@/hooks/useAccountants';
import { AccountantForm } from '@/components/accountants/AccountantForm';
import type { CreateAccountantProfileInput } from '@/lib/validation/accountant';

export default function CreateAccountantPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { createAccountantProfile, loading } = useAccountants();
  const [error, setError] = useState<string | null>(null);

  if (!session?.user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  const handleSubmit = async (data: CreateAccountantProfileInput) => {
    try {
      setError(null);
      await createAccountantProfile(data);
      router.push('/dashboard/accountants');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create accountant profile';
      setError(message);
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/accountants');
  };

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/accountants">
          <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create Accountant Profile</h1>
          <p className="text-gray-600 mt-1">Register your professional information</p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="font-semibold text-red-900">Error</h3>
          <p className="text-red-700 text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <AccountantForm
          isEdit={false}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={loading}
        />
      </div>
    </div>
  );
}
