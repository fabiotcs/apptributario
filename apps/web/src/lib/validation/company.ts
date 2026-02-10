import { z } from 'zod';

// CNPJ validation function
const validateCNPJ = (cnpj: string): boolean => {
  // Remove formatting
  const cleanCNPJ = cnpj.replace(/\D/g, '');

  // Must be 14 digits
  if (cleanCNPJ.length !== 14) {
    return false;
  }

  // Basic format check (no all same digits)
  if (/^(\d)\1{13}$/.test(cleanCNPJ)) {
    return false;
  }

  return true;
};

export const createCompanySchema = z.object({
  name: z
    .string()
    .min(3, 'Company name must be at least 3 characters')
    .max(100, 'Company name must be less than 100 characters'),
  cnpj: z
    .string()
    .refine(
      (val) => validateCNPJ(val),
      'Invalid CNPJ format. Use XX.XXX.XXX/XXXX-XX'
    ),
  legalName: z
    .string()
    .max(100, 'Legal name must be less than 100 characters')
    .optional(),
  industry: z
    .string()
    .max(50, 'Industry must be less than 50 characters')
    .optional(),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  address: z
    .string()
    .max(150, 'Address must be less than 150 characters')
    .optional(),
  city: z
    .string()
    .max(50, 'City must be less than 50 characters')
    .optional(),
  state: z
    .string()
    .length(2, 'State must be 2 characters (e.g., SP, RJ)')
    .optional(),
  zipCode: z
    .string()
    .refine(
      (val) => /^\d{5}-?\d{3}$/.test(val),
      'Invalid ZIP code format. Use XXXXX-XXX'
    )
    .optional(),
  phone: z
    .string()
    .max(20, 'Phone must be less than 20 characters')
    .optional(),
  email: z
    .string()
    .email('Invalid email address')
    .optional()
    .or(z.literal('')),
  website: z
    .string()
    .url('Invalid website URL')
    .optional()
    .or(z.literal('')),
  foundedYear: z
    .coerce.number()
    .int()
    .min(1800, 'Year must be 1800 or later')
    .max(new Date().getFullYear(), 'Year cannot be in the future')
    .optional(),
  employees: z
    .coerce.number()
    .int()
    .min(0, 'Employees must be 0 or more')
    .max(999999, 'Employees must be less than 999999')
    .optional(),
  revenue: z
    .coerce.number()
    .min(0, 'Revenue must be 0 or more')
    .optional(),
  taxRegime: z
    .enum(['SIMPLES_NACIONAL', 'LUCRO_PRESUMIDO', 'LUCRO_REAL'])
    .default('SIMPLES_NACIONAL'),
});

export const updateCompanySchema = createCompanySchema.partial().required({
  name: true,
  cnpj: true,
});

export const assignAccountantSchema = z.object({
  accountantId: z.string().min(1, 'Accountant is required'),
  role: z.enum(['ADVISOR', 'MANAGER']).default('ADVISOR'),
});

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
export type AssignAccountantInput = z.infer<typeof assignAccountantSchema>;
