'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Plus } from 'lucide-react';
import { createAccountantProfileSchema, updateAccountantProfileSchema, SpecializationLabels, SpecializationColors } from '@/lib/validation/accountant';
import type { CreateAccountantProfileInput, UpdateAccountantProfileInput, Specialization } from '@/lib/validation/accountant';
import type { z } from 'zod';

interface Certification {
  name: string;
  issuer: string;
  expiryDate: string;
}

interface AccountantFormProps {
  initialData?: Partial<CreateAccountantProfileInput>;
  isEdit?: boolean;
  onSubmit: (data: CreateAccountantProfileInput | UpdateAccountantProfileInput) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

const SPECIALIZATIONS: Specialization[] = ['TAX', 'PAYROLL', 'COMPLIANCE', 'ACCOUNTING', 'ADVISORY'];

export function AccountantForm({
  initialData,
  isEdit = false,
  onSubmit,
  onCancel,
  isLoading = false,
}: AccountantFormProps) {
  const schema = isEdit ? updateAccountantProfileSchema : createAccountantProfileSchema;
  const [certifications, setCertifications] = useState<Certification[]>(initialData?.certifications || []);
  const [newCert, setNewCert] = useState({ name: '', issuer: '', expiryDate: '' });

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateAccountantProfileInput | UpdateAccountantProfileInput>({
    resolver: zodResolver(schema),
    defaultValues: initialData || {
      specializations: [],
      yearsOfExperience: 0,
      certifications: [],
    },
  });

  const selectedSpecs = watch('specializations') || [];
  const hourlyRate = watch('hourlyRate');
  const maxClients = watch('maxClients');

  const toggleSpecialization = (spec: Specialization) => {
    const current = selectedSpecs || [];
    const updated = current.includes(spec)
      ? current.filter((s) => s !== spec)
      : [...current, spec];
    control._formValues.specializations = updated;
  };

  const addCertification = () => {
    if (newCert.name && newCert.issuer && newCert.expiryDate) {
      setCertifications([...certifications, newCert]);
      setNewCert({ name: '', issuer: '', expiryDate: '' });
    }
  };

  const removeCertification = (index: number) => {
    setCertifications(certifications.filter((_, i) => i !== index));
  };

  const handleFormSubmit = async (data: CreateAccountantProfileInput | UpdateAccountantProfileInput) => {
    const formDataWithCerts = { ...data, certifications };
    await onSubmit(formDataWithCerts);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      {/* Section 1: Basic Information */}
      <div className="space-y-6 pb-8 border-b border-gray-200">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* License Number */}
            <div>
              <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700 mb-2">
                License Number *
              </label>
              <input
                {...register('licenseNumber')}
                type="text"
                id="licenseNumber"
                placeholder="e.g., CRC/SP-123456"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.licenseNumber && (
                <p className="text-red-600 text-sm mt-1">{errors.licenseNumber.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                {...register('email')}
                type="email"
                id="email"
                placeholder="professional@example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.email && (
                <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                {...register('phone')}
                type="tel"
                id="phone"
                placeholder="(11) 98765-4321"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.phone && (
                <p className="text-red-600 text-sm mt-1">{errors.phone.message}</p>
              )}
            </div>

            {/* Website */}
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <input
                {...register('website')}
                type="url"
                id="website"
                placeholder="https://example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.website && (
                <p className="text-red-600 text-sm mt-1">{errors.website.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Bio */}
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
            Professional Bio
          </label>
          <textarea
            {...register('bio')}
            id="bio"
            rows={4}
            placeholder="Tell potential clients about your expertise and experience..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          {errors.bio && (
            <p className="text-red-600 text-sm mt-1">{errors.bio.message}</p>
          )}
        </div>
      </div>

      {/* Section 2: Specializations */}
      <div className="space-y-4 pb-8 border-b border-gray-200">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Specializations *</h2>
          <p className="text-sm text-gray-600 mb-4">Select at least one specialization</p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {SPECIALIZATIONS.map((spec) => (
              <label
                key={spec}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedSpecs?.includes(spec)}
                  onChange={() => toggleSpecialization(spec)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded cursor-pointer"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">{SpecializationLabels[spec]}</p>
                </div>
              </label>
            ))}
          </div>
          {errors.specializations && (
            <p className="text-red-600 text-sm mt-2">{errors.specializations.message}</p>
          )}
        </div>
      </div>

      {/* Section 3: Experience & Rates */}
      <div className="space-y-6 pb-8 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Experience & Rates</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Years of Experience */}
          <div>
            <label htmlFor="yearsOfExperience" className="block text-sm font-medium text-gray-700 mb-2">
              Years of Experience *
            </label>
            <input
              {...register('yearsOfExperience', { valueAsNumber: true })}
              type="number"
              id="yearsOfExperience"
              min="0"
              max="70"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.yearsOfExperience && (
              <p className="text-red-600 text-sm mt-1">{errors.yearsOfExperience.message}</p>
            )}
          </div>

          {/* Hourly Rate */}
          <div>
            <label htmlFor="hourlyRate" className="block text-sm font-medium text-gray-700 mb-2">
              Hourly Rate (in cents - R$)
            </label>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">R$</span>
              <input
                {...register('hourlyRate', { valueAsNumber: true })}
                type="number"
                id="hourlyRate"
                min="0"
                placeholder="e.g., 15000 for R$ 150.00"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            {hourlyRate !== undefined && hourlyRate > 0 && (
              <p className="text-sm text-gray-600 mt-1">R$ {(hourlyRate / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/hour</p>
            )}
            {errors.hourlyRate && (
              <p className="text-red-600 text-sm mt-1">{errors.hourlyRate.message}</p>
            )}
          </div>

          {/* Max Clients */}
          <div>
            <label htmlFor="maxClients" className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Clients
            </label>
            <input
              {...register('maxClients', { valueAsNumber: true })}
              type="number"
              id="maxClients"
              min="1"
              max="100"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.maxClients && (
              <p className="text-red-600 text-sm mt-1">{errors.maxClients.message}</p>
            )}
          </div>

          {/* Profile Image URL */}
          <div>
            <label htmlFor="profileImageUrl" className="block text-sm font-medium text-gray-700 mb-2">
              Profile Image URL
            </label>
            <input
              {...register('profileImageUrl')}
              type="url"
              id="profileImageUrl"
              placeholder="https://example.com/image.jpg"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.profileImageUrl && (
              <p className="text-red-600 text-sm mt-1">{errors.profileImageUrl.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Section 4: Certifications */}
      <div className="space-y-4 pb-8 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Certifications</h2>

        {/* Add Certification Form */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Certification name"
              value={newCert.name}
              onChange={(e) => setNewCert({ ...newCert, name: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            <input
              type="text"
              placeholder="Issuing organization"
              value={newCert.issuer}
              onChange={(e) => setNewCert({ ...newCert, issuer: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            <input
              type="date"
              value={newCert.expiryDate}
              onChange={(e) => setNewCert({ ...newCert, expiryDate: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
          <button
            type="button"
            onClick={addCertification}
            disabled={!newCert.name || !newCert.issuer || !newCert.expiryDate}
            className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4" />
            Add Certification
          </button>
        </div>

        {/* List of Certifications */}
        {certifications.length > 0 && (
          <div className="space-y-2">
            {certifications.map((cert, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{cert.name}</p>
                  <p className="text-xs text-gray-500">{cert.issuer} • Expires {cert.expiryDate}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeCertification(idx)}
                  className="text-gray-400 hover:text-red-600 p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading || isSubmitting}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading || isSubmitting}
          className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isLoading || isSubmitting ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              {isEdit ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            isEdit ? 'Update Profile' : 'Create Profile'
          )}
        </button>
      </div>
    </form>
  );
}
