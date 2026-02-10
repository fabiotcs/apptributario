'use client';

import { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { SpecializationLabels } from '@/lib/validation/accountant';
import type { Specialization } from '@/lib/validation/accountant';

const SPECIALIZATIONS: Specialization[] = ['TAX', 'PAYROLL', 'COMPLIANCE', 'ACCOUNTING', 'ADVISORY'];
const EXPERIENCE_RANGES = [
  { label: 'Any experience', value: undefined },
  { label: '1+ years', value: 1 },
  { label: '5+ years', value: 5 },
  { label: '10+ years', value: 10 },
  { label: '20+ years', value: 20 },
];

interface AccountantFilterProps {
  onFilterChange?: (filters: {
    search?: string;
    specialization?: Specialization;
    isAvailable?: boolean;
    yearsOfExperience?: number;
  }) => void;
  isLoading?: boolean;
}

export function AccountantFilter({ onFilterChange, isLoading = false }: AccountantFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState<Specialization | undefined>();
  const [selectedExperience, setSelectedExperience] = useState<number | undefined>();
  const [selectedAvailability, setSelectedAvailability] = useState<boolean | undefined>();

  const handleApplyFilters = () => {
    onFilterChange?.({
      search: search || undefined,
      specialization: selectedSpecialization,
      yearsOfExperience: selectedExperience,
      isAvailable: selectedAvailability,
    });
    setIsOpen(false);
  };

  const handleClearFilters = () => {
    setSearch('');
    setSelectedSpecialization(undefined);
    setSelectedExperience(undefined);
    setSelectedAvailability(undefined);
    onFilterChange?.({});
  };

  const hasActiveFilters =
    search || selectedSpecialization || selectedExperience !== undefined || selectedAvailability !== undefined;

  return (
    <div className="space-y-3">
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search by name, license, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* Filter Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 border rounded-lg font-medium transition-colors ${
          hasActiveFilters
            ? 'border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100'
            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={isLoading}
      >
        <Filter className="h-4 w-4" />
        Advanced Filters
        {hasActiveFilters && <span className="ml-2 h-2 w-2 bg-blue-600 rounded-full" />}
      </button>

      {/* Filter Panel */}
      {isOpen && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4 shadow-sm">
          {/* Specialization Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Specialization</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={selectedSpecialization === undefined}
                  onChange={() => setSelectedSpecialization(undefined)}
                  className="w-4 h-4 text-blue-600 border-gray-300"
                />
                <span className="text-sm text-gray-700">All specializations</span>
              </label>
              {SPECIALIZATIONS.map((spec) => (
                <label key={spec} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={selectedSpecialization === spec}
                    onChange={() => setSelectedSpecialization(spec)}
                    className="w-4 h-4 text-blue-600 border-gray-300"
                  />
                  <span className="text-sm text-gray-700">{SpecializationLabels[spec]}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Experience Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Minimum Experience</label>
            <div className="space-y-2">
              {EXPERIENCE_RANGES.map((range) => (
                <label key={range.value || 'any'} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={selectedExperience === range.value}
                    onChange={() => setSelectedExperience(range.value)}
                    className="w-4 h-4 text-blue-600 border-gray-300"
                  />
                  <span className="text-sm text-gray-700">{range.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Availability Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Availability</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={selectedAvailability === undefined}
                  onChange={() => setSelectedAvailability(undefined)}
                  className="w-4 h-4 text-blue-600 border-gray-300"
                />
                <span className="text-sm text-gray-700">Any status</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={selectedAvailability === true}
                  onChange={() => setSelectedAvailability(true)}
                  className="w-4 h-4 text-blue-600 border-gray-300"
                />
                <span className="text-sm text-gray-700">Available only</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={selectedAvailability === false}
                  onChange={() => setSelectedAvailability(false)}
                  className="w-4 h-4 text-blue-600 border-gray-300"
                />
                <span className="text-sm text-gray-700">Unavailable only</span>
              </label>
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex gap-2 pt-2 border-t border-gray-200">
            <button
              onClick={handleClearFilters}
              className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              Clear All
            </button>
            <button
              onClick={handleApplyFilters}
              className="flex-1 px-3 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
