'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createCompanySchema,
  type CreateCompanyInput,
} from '@/lib/validation/company';
import { useRouter } from 'next/navigation';

interface CompanyFormProps {
  initialData?: Partial<CreateCompanyInput>;
  onSubmit?: (data: CreateCompanyInput) => Promise<void>;
  isLoading?: boolean;
  isEdit?: boolean;
}

export function CompanyForm({
  initialData,
  onSubmit,
  isLoading = false,
  isEdit = false,
}: CompanyFormProps) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<CreateCompanyInput>({
    resolver: zodResolver(createCompanySchema),
    defaultValues: initialData || {
      taxRegime: 'SIMPLES_NACIONAL',
    },
  });

  const revenue = watch('revenue');

  const handleFormSubmit = async (data: CreateCompanyInput) => {
    setSubmitError(null);
    try {
      if (onSubmit) {
        await onSubmit(data);
        if (!isEdit) {
          router.push('/dashboard/companies');
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setSubmitError(message);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {submitError && (
        <div className="rounded-lg bg-red-50 p-4">
          <p className="text-sm text-red-800">{submitError}</p>
        </div>
      )}

      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Company Name <span className="text-red-500">*</span>
            </label>
            <input
              {...register('name')}
              type="text"
              id="name"
              placeholder="e.g., Tech Solutions Ltd"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="cnpj" className="block text-sm font-medium text-gray-700">
              CNPJ <span className="text-red-500">*</span>
            </label>
            <input
              {...register('cnpj')}
              type="text"
              id="cnpj"
              placeholder="XX.XXX.XXX/XXXX-XX"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {errors.cnpj && (
              <p className="mt-1 text-sm text-red-600">{errors.cnpj.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="legalName" className="block text-sm font-medium text-gray-700">
              Legal Name
            </label>
            <input
              {...register('legalName')}
              type="text"
              id="legalName"
              placeholder="Official legal name"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {errors.legalName && (
              <p className="mt-1 text-sm text-red-600">{errors.legalName.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="industry" className="block text-sm font-medium text-gray-700">
              Industry
            </label>
            <input
              {...register('industry')}
              type="text"
              id="industry"
              placeholder="e.g., Technology, Services"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {errors.industry && (
              <p className="mt-1 text-sm text-red-600">{errors.industry.message}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            {...register('description')}
            id="description"
            placeholder="Describe your business..."
            rows={3}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>
      </div>

      {/* Address Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Address</h3>

        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">
            Street Address
          </label>
          <input
            {...register('address')}
            type="text"
            id="address"
            placeholder="123 Main Street"
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          {errors.address && (
            <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700">
              City
            </label>
            <input
              {...register('city')}
              type="text"
              id="city"
              placeholder="São Paulo"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {errors.city && (
              <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700">
              State (UF)
            </label>
            <input
              {...register('state')}
              type="text"
              id="state"
              placeholder="SP"
              maxLength={2}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {errors.state && (
              <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
              ZIP Code
            </label>
            <input
              {...register('zipCode')}
              type="text"
              id="zipCode"
              placeholder="01310-100"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {errors.zipCode && (
              <p className="mt-1 text-sm text-red-600">{errors.zipCode.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone
            </label>
            <input
              {...register('phone')}
              type="tel"
              id="phone"
              placeholder="+55 (11) 99999-9999"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              {...register('email')}
              type="email"
              id="email"
              placeholder="info@company.com"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="website" className="block text-sm font-medium text-gray-700">
              Website
            </label>
            <input
              {...register('website')}
              type="url"
              id="website"
              placeholder="https://example.com"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {errors.website && (
              <p className="mt-1 text-sm text-red-600">{errors.website.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Financial Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Financial Information</h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="foundedYear" className="block text-sm font-medium text-gray-700">
              Founded Year
            </label>
            <input
              {...register('foundedYear')}
              type="number"
              id="foundedYear"
              placeholder="2020"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {errors.foundedYear && (
              <p className="mt-1 text-sm text-red-600">{errors.foundedYear.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="employees" className="block text-sm font-medium text-gray-700">
              Number of Employees
            </label>
            <input
              {...register('employees')}
              type="number"
              id="employees"
              placeholder="50"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {errors.employees && (
              <p className="mt-1 text-sm text-red-600">{errors.employees.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="revenue" className="block text-sm font-medium text-gray-700">
              Annual Revenue (R$)
            </label>
            <input
              {...register('revenue')}
              type="number"
              id="revenue"
              placeholder="1000000"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {revenue && (
              <p className="mt-1 text-sm text-gray-600">
                ≈ R$ {(Number(revenue) || 0).toLocaleString('pt-BR')}
              </p>
            )}
            {errors.revenue && (
              <p className="mt-1 text-sm text-red-600">{errors.revenue.message}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="taxRegime" className="block text-sm font-medium text-gray-700">
            Tax Regime <span className="text-red-500">*</span>
          </label>
          <select
            {...register('taxRegime')}
            id="taxRegime"
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="SIMPLES_NACIONAL">Simples Nacional</option>
            <option value="LUCRO_PRESUMIDO">Lucro Presumido</option>
            <option value="LUCRO_REAL">Lucro Real</option>
          </select>
          {errors.taxRegime && (
            <p className="mt-1 text-sm text-red-600">{errors.taxRegime.message}</p>
          )}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 pt-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || isLoading}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isSubmitting || isLoading ? 'Saving...' : isEdit ? 'Update Company' : 'Create Company'}
        </button>
      </div>
    </form>
  );
}
