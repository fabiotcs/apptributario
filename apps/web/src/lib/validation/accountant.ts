import { z } from 'zod';

/**
 * Accountant Profile Validation Schemas
 * Zod schemas for accountant creation and updates
 */

// Valid specialization types
const SpecializationEnum = z.enum([
  'TAX',
  'PAYROLL',
  'COMPLIANCE',
  'ACCOUNTING',
  'ADVISORY',
]);

export type Specialization = z.infer<typeof SpecializationEnum>;

// Valid assignment roles
const AssignmentRoleEnum = z.enum(['ADVISOR', 'MANAGER']);
export type AssignmentRole = z.infer<typeof AssignmentRoleEnum>;

/**
 * Certification object schema
 */
const CertificationSchema = z.object({
  name: z.string().min(1, 'Certification name is required'),
  issuer: z.string().min(1, 'Issuer name is required'),
  expiryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
});

export type Certification = z.infer<typeof CertificationSchema>;

/**
 * Create Accountant Profile Schema
 * Used for creating a new accountant profile
 */
export const createAccountantProfileSchema = z.object({
  licenseNumber: z
    .string()
    .min(5, 'License number must be at least 5 characters')
    .max(50, 'License number must not exceed 50 characters'),

  specializations: z
    .array(SpecializationEnum)
    .min(1, 'At least one specialization is required'),

  bio: z.string().max(1000, 'Bio must not exceed 1000 characters').optional(),

  yearsOfExperience: z
    .number()
    .int('Years of experience must be a whole number')
    .min(0, 'Years of experience cannot be negative')
    .max(70, 'Years of experience seems invalid'),

  hourlyRate: z
    .number()
    .int('Hourly rate must be in cents')
    .min(0, 'Hourly rate cannot be negative')
    .max(999999999, 'Hourly rate is too high')
    .optional(),

  email: z.string().email('Invalid email address'),

  phone: z
    .string()
    .regex(/^[\d\s\-\+\(\)]+$/, 'Invalid phone format')
    .min(10, 'Phone must be at least 10 characters')
    .optional()
    .or(z.literal('')),

  website: z
    .string()
    .url('Invalid URL format')
    .optional()
    .or(z.literal('')),

  maxClients: z
    .number()
    .int('Max clients must be a whole number')
    .min(1, 'Must allow at least 1 client')
    .max(100, 'Max clients cannot exceed 100')
    .optional(),

  certifications: z
    .array(CertificationSchema)
    .optional(),

  profileImageUrl: z
    .string()
    .url('Invalid image URL')
    .optional()
    .or(z.literal('')),
});

export type CreateAccountantProfileInput = z.infer<typeof createAccountantProfileSchema>;

/**
 * Update Accountant Profile Schema
 * Used for updating accountant profile (partial updates)
 */
export const updateAccountantProfileSchema = createAccountantProfileSchema.partial();

export type UpdateAccountantProfileInput = z.infer<typeof updateAccountantProfileSchema>;

/**
 * Assign Accountant to Company Schema
 */
export const assignAccountantSchema = z.object({
  accountantId: z.string().min(1, 'Accountant ID is required'),
  companyId: z.string().min(1, 'Company ID is required'),
  role: AssignmentRoleEnum,
  notes: z.string().max(500, 'Notes must not exceed 500 characters').optional(),
});

export type AssignAccountantInput = z.infer<typeof assignAccountantSchema>;

/**
 * Search Accountants Schema
 */
export const searchAccountantsSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  specializations: z.array(SpecializationEnum).optional(),
  minExperience: z.number().min(0).optional(),
  available: z.boolean().optional(),
  maxHourlyRate: z.number().min(0).optional(),
});

export type SearchAccountantsInput = z.infer<typeof searchAccountantsSchema>;

/**
 * License Number Validation
 * Professional license format validation (e.g., CRC/SP-123456)
 */
export const validateLicenseNumber = (license: string): boolean => {
  // Allow various formats: CRC/SP-123456, CRC SP 123456, etc.
  const licenseRegex = /^[A-Z0-9\s\-\/\.]+$/i;
  return licenseRegex.test(license) && license.length >= 5;
};

/**
 * Specialization Helpers
 */
export const SpecializationLabels: Record<Specialization, string> = {
  TAX: 'Income & Corporate Tax',
  PAYROLL: 'Payroll Management',
  COMPLIANCE: 'Tax Compliance',
  ACCOUNTING: 'Accounting Services',
  ADVISORY: 'Business Advisory',
};

export const SpecializationColors: Record<Specialization, string> = {
  TAX: 'bg-blue-100 text-blue-800',
  PAYROLL: 'bg-green-100 text-green-800',
  COMPLIANCE: 'bg-purple-100 text-purple-800',
  ACCOUNTING: 'bg-orange-100 text-orange-800',
  ADVISORY: 'bg-pink-100 text-pink-800',
};

/**
 * Years of Experience Badges
 */
export const getExperienceBadge = (years: number): string => {
  if (years >= 20) return '20+ years';
  if (years >= 10) return '10+ years';
  if (years >= 5) return '5+ years';
  if (years >= 1) return '1+ year';
  return 'Beginner';
};

/**
 * Hourly Rate Formatting
 */
export const formatHourlyRate = (cents: number | undefined): string => {
  if (!cents) return 'Not specified';
  const reais = cents / 100;
  return `R$ ${reais.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
};

/**
 * Availability Status Badge
 */
export const getAvailabilityBadge = (isAvailable: boolean): { color: string; label: string } => {
  return isAvailable
    ? { color: 'bg-green-100 text-green-800', label: 'Available' }
    : { color: 'bg-gray-100 text-gray-800', label: 'Not Available' };
};

/**
 * Client Capacity Percentage
 */
export const getCapacityPercentage = (current: number, max: number): number => {
  return Math.round((current / max) * 100);
};

/**
 * Client Capacity Color
 */
export const getCapacityColor = (percentage: number): string => {
  if (percentage >= 90) return 'bg-red-500';
  if (percentage >= 70) return 'bg-yellow-500';
  return 'bg-green-500';
};
