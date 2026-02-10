'use client';
import { useSession } from '@/hooks/useSession';

export default function DashboardPage() {
  const { user } = useSession();

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h2>
        <p className="text-gray-600 mt-2">
          You're logged in as a{' '}
          <span className="font-semibold">
            {user?.role === 'EMPRESARIO'
              ? 'Business Owner'
              : user?.role === 'CONTADOR'
                ? 'Accountant'
                : 'Administrator'}
          </span>
        </p>
      </div>

      {/* Role-specific content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {user?.role === 'EMPRESARIO' && (
          <>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Tax Regime Analysis
              </h3>
              <p className="text-gray-600 text-sm">
                Analyze your tax regime and find potential savings.
              </p>
              <button className="mt-4 text-blue-600 hover:text-blue-700 font-medium text-sm">
                Start Analysis →
              </button>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                AI Consultation
              </h3>
              <p className="text-gray-600 text-sm">
                Get personalized tax guidance from our AI agent.
              </p>
              <button className="mt-4 text-blue-600 hover:text-blue-700 font-medium text-sm">
                Ask AI Agent →
              </button>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Company Management
              </h3>
              <p className="text-gray-600 text-sm">
                Manage your company information and settings.
              </p>
              <button className="mt-4 text-blue-600 hover:text-blue-700 font-medium text-sm">
                View Companies →
              </button>
            </div>
          </>
        )}

        {user?.role === 'CONTADOR' && (
          <>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Client Portfolio
              </h3>
              <p className="text-gray-600 text-sm">
                Manage and monitor all your client companies.
              </p>
              <button className="mt-4 text-blue-600 hover:text-blue-700 font-medium text-sm">
                View Portfolio →
              </button>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Alerts & Recommendations
              </h3>
              <p className="text-gray-600 text-sm">
                Stay updated with important alerts for your clients.
              </p>
              <button className="mt-4 text-blue-600 hover:text-blue-700 font-medium text-sm">
                View Alerts →
              </button>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Referral Program
              </h3>
              <p className="text-gray-600 text-sm">
                Earn commissions by referring new clients.
              </p>
              <button className="mt-4 text-blue-600 hover:text-blue-700 font-medium text-sm">
                View Referrals →
              </button>
            </div>
          </>
        )}

        {user?.role === 'ADMIN' && (
          <>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                User Management
              </h3>
              <p className="text-gray-600 text-sm">
                Manage system users and permissions.
              </p>
              <button className="mt-4 text-blue-600 hover:text-blue-700 font-medium text-sm">
                View Users →
              </button>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Company Management
              </h3>
              <p className="text-gray-600 text-sm">
                Manage all companies in the system.
              </p>
              <button className="mt-4 text-blue-600 hover:text-blue-700 font-medium text-sm">
                View Companies →
              </button>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                System Analytics
              </h3>
              <p className="text-gray-600 text-sm">
                View system usage and performance metrics.
              </p>
              <button className="mt-4 text-blue-600 hover:text-blue-700 font-medium text-sm">
                View Analytics →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
