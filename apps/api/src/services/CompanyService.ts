import prisma from '../lib/db';

interface CreateCompanyInput {
  name: string;
  cnpj: string;
  legalName?: string;
  industry?: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone?: string;
  email?: string;
  website?: string;
  foundedYear?: number;
  employees?: number;
  revenue?: number;
  taxRegime?: string;
}

interface UpdateCompanyInput {
  name?: string;
  legalName?: string;
  industry?: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone?: string;
  email?: string;
  website?: string;
  foundedYear?: number;
  employees?: number;
  revenue?: number;
  taxRegime?: string;
  status?: string;
}

interface CompanyResponse {
  success: boolean;
  company?: any;
  error?: string;
}

interface CompanyListResponse {
  success: boolean;
  companies?: any[];
  total?: number;
  page?: number;
  limit?: number;
  error?: string;
}

interface AssignAccountantInput {
  accountantId: string;
  role?: string;
}

/**
 * CompanyService
 * Handles company CRUD operations, validation, and access control
 */
export class CompanyService {
  /**
   * Validate CNPJ format and structure
   * Format: XX.XXX.XXX/XXXX-XX or XXXXXXXXXXXXXXX (14 digits)
   */
  static validateCNPJ(cnpj: string): boolean {
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

    // CNPJ validation algorithm
    let size = cleanCNPJ.length - 2;
    let numbers = cleanCNPJ.substring(0, size);
    let digits = cleanCNPJ.substring(size);
    let sum = 0;
    let pos = size - 7;

    for (let i = size; i >= 1; i--) {
      sum += Number(numbers.charAt(size - i)) * pos--;
      if (pos < 2) {
        pos = 9;
      }
    }

    let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);

    if (result !== Number(digits.charAt(0))) {
      return false;
    }

    size = size + 1;
    numbers = cleanCNPJ.substring(0, size);
    sum = 0;
    pos = size - 7;

    for (let i = size; i >= 1; i--) {
      sum += Number(numbers.charAt(size - i)) * pos--;
      if (pos < 2) {
        pos = 9;
      }
    }

    result = sum % 11 < 2 ? 0 : 11 - (sum % 11);

    if (result !== Number(digits.charAt(1))) {
      return false;
    }

    return true;
  }

  /**
   * Create a new company
   */
  static async create(
    input: CreateCompanyInput,
    userId: string,
    userRole: string
  ): Promise<CompanyResponse> {
    try {
      // Only EMPRESARIO and ADMIN can create companies
      if (userRole !== 'EMPRESARIO' && userRole !== 'ADMIN') {
        return {
          success: false,
          error: 'Only EMPRESARIO or ADMIN can create companies',
        };
      }

      // Validate required fields
      if (!input.name || !input.cnpj) {
        return {
          success: false,
          error: 'Company name and CNPJ are required',
        };
      }

      // Validate CNPJ format
      if (!this.validateCNPJ(input.cnpj)) {
        return {
          success: false,
          error: 'Invalid CNPJ format',
        };
      }

      // Check if CNPJ already exists
      const existingCompany = await prisma.company.findUnique({
        where: { cnpj: input.cnpj },
      });

      if (existingCompany) {
        return {
          success: false,
          error: 'Company with this CNPJ already exists',
        };
      }

      // Create company
      const company = await prisma.company.create({
        data: {
          name: input.name,
          cnpj: input.cnpj,
          legalName: input.legalName,
          industry: input.industry,
          description: input.description,
          address: input.address,
          city: input.city,
          state: input.state,
          zipCode: input.zipCode,
          phone: input.phone,
          email: input.email,
          website: input.website,
          foundedYear: input.foundedYear,
          employees: input.employees,
          revenue: input.revenue ? BigInt(input.revenue) : null,
          taxRegime: input.taxRegime || 'SIMPLES_NACIONAL',
          ownerId: userId,
        },
      });

      return {
        success: true,
        company,
      };
    } catch (error) {
      console.error('Company creation error:', error);
      return {
        success: false,
        error: 'Failed to create company',
      };
    }
  }

  /**
   * Find company by ID with authorization check
   */
  static async findById(
    companyId: string,
    userId: string,
    userRole: string
  ): Promise<CompanyResponse> {
    try {
      const company = await prisma.company.findUnique({
        where: { id: companyId },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          companyUsers: {
            where: { deletedAt: null },
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  role: true,
                },
              },
            },
          },
        },
      });

      if (!company) {
        return {
          success: false,
          error: 'Company not found',
        };
      }

      // Check authorization
      const isAuthorized =
        userRole === 'ADMIN' ||
        company.ownerId === userId ||
        company.companyUsers.some((cu) => cu.userId === userId);

      if (!isAuthorized) {
        return {
          success: false,
          error: 'Not authorized to access this company',
        };
      }

      return {
        success: true,
        company,
      };
    } catch (error) {
      console.error('Company find error:', error);
      return {
        success: false,
        error: 'Failed to retrieve company',
      };
    }
  }

  /**
   * Find all companies for a user based on role
   */
  static async findByUserId(
    userId: string,
    userRole: string,
    page: number = 1,
    limit: number = 20,
    filters?: any
  ): Promise<CompanyListResponse> {
    try {
      const skip = (page - 1) * limit;
      let where: any = {
        deletedAt: null,
      };

      // Apply filters
      if (filters?.status) {
        where.status = filters.status;
      }
      if (filters?.industry) {
        where.industry = filters.industry;
      }
      if (filters?.search) {
        where.OR = [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { cnpj: { contains: filters.search } },
        ];
      }

      // Role-based filtering
      if (userRole === 'ADMIN') {
        // Admin sees all companies
      } else if (userRole === 'EMPRESARIO') {
        // Business owner sees only their companies
        where.ownerId = userId;
      } else if (userRole === 'CONTADOR') {
        // Accountant sees only assigned companies
        where.companyUsers = {
          some: {
            userId,
            deletedAt: null,
          },
        };
      }

      const [companies, total] = await Promise.all([
        prisma.company.findMany({
          where,
          skip,
          take: limit,
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            companyUsers: {
              where: { deletedAt: null },
              select: {
                userId: true,
                role: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.company.count({ where }),
      ]);

      return {
        success: true,
        companies,
        total,
        page,
        limit,
      };
    } catch (error) {
      console.error('Company list error:', error);
      return {
        success: false,
        error: 'Failed to retrieve companies',
      };
    }
  }

  /**
   * Update company
   */
  static async update(
    companyId: string,
    input: UpdateCompanyInput,
    userId: string,
    userRole: string
  ): Promise<CompanyResponse> {
    try {
      // Get company to check authorization
      const company = await prisma.company.findUnique({
        where: { id: companyId },
      });

      if (!company) {
        return {
          success: false,
          error: 'Company not found',
        };
      }

      // Check authorization (owner or admin)
      if (userRole !== 'ADMIN' && company.ownerId !== userId) {
        return {
          success: false,
          error: 'Not authorized to update this company',
        };
      }

      // Update company
      const updated = await prisma.company.update({
        where: { id: companyId },
        data: {
          ...(input.name && { name: input.name }),
          ...(input.legalName && { legalName: input.legalName }),
          ...(input.industry && { industry: input.industry }),
          ...(input.description && { description: input.description }),
          ...(input.address && { address: input.address }),
          ...(input.city && { city: input.city }),
          ...(input.state && { state: input.state }),
          ...(input.zipCode && { zipCode: input.zipCode }),
          ...(input.phone && { phone: input.phone }),
          ...(input.email && { email: input.email }),
          ...(input.website && { website: input.website }),
          ...(input.foundedYear !== undefined && { foundedYear: input.foundedYear }),
          ...(input.employees !== undefined && { employees: input.employees }),
          ...(input.revenue !== undefined && {
            revenue: input.revenue ? BigInt(input.revenue) : null,
          }),
          ...(input.taxRegime && { taxRegime: input.taxRegime }),
          ...(input.status && { status: input.status }),
        },
      });

      return {
        success: true,
        company: updated,
      };
    } catch (error) {
      console.error('Company update error:', error);
      return {
        success: false,
        error: 'Failed to update company',
      };
    }
  }

  /**
   * Delete (soft delete) a company
   */
  static async delete(
    companyId: string,
    userId: string,
    userRole: string
  ): Promise<CompanyResponse> {
    try {
      const company = await prisma.company.findUnique({
        where: { id: companyId },
      });

      if (!company) {
        return {
          success: false,
          error: 'Company not found',
        };
      }

      // Check authorization (owner or admin)
      if (userRole !== 'ADMIN' && company.ownerId !== userId) {
        return {
          success: false,
          error: 'Not authorized to delete this company',
        };
      }

      // Soft delete
      const deleted = await prisma.company.update({
        where: { id: companyId },
        data: {
          deletedAt: new Date(),
        },
      });

      return {
        success: true,
        company: deleted,
      };
    } catch (error) {
      console.error('Company delete error:', error);
      return {
        success: false,
        error: 'Failed to delete company',
      };
    }
  }

  /**
   * Assign accountant to company
   */
  static async assignAccountant(
    companyId: string,
    accountantId: string,
    role: string,
    userId: string,
    userRole: string
  ): Promise<CompanyResponse> {
    try {
      const company = await prisma.company.findUnique({
        where: { id: companyId },
      });

      if (!company) {
        return {
          success: false,
          error: 'Company not found',
        };
      }

      // Check authorization (owner or admin)
      if (userRole !== 'ADMIN' && company.ownerId !== userId) {
        return {
          success: false,
          error: 'Not authorized to assign accountants to this company',
        };
      }

      // Verify accountant exists and is CONTADOR role
      const accountant = await prisma.user.findUnique({
        where: { id: accountantId },
      });

      if (!accountant) {
        return {
          success: false,
          error: 'Accountant not found',
        };
      }

      if (accountant.role !== 'CONTADOR' && accountant.role !== 'ADMIN') {
        return {
          success: false,
          error: 'User must have CONTADOR role to be assigned as accountant',
        };
      }

      // Create or update company user relationship
      const companyUser = await prisma.companyUser.upsert({
        where: {
          userId_companyId: {
            userId: accountantId,
            companyId,
          },
        },
        create: {
          userId: accountantId,
          companyId,
          role: 'ACCOUNTANT',
        },
        update: {
          deletedAt: null, // Restore if previously deleted
          role: 'ACCOUNTANT',
        },
      });

      return {
        success: true,
        company: companyUser,
      };
    } catch (error: any) {
      console.error('Assign accountant error:', error);
      // Return error message based on error type
      if (error.code === 'P2025') {
        return {
          success: false,
          error: 'Company or user not found',
        };
      }
      return {
        success: false,
        error: 'Failed to assign accountant',
      };
    }
  }

  /**
   * Remove accountant from company
   */
  static async removeAccountant(
    companyId: string,
    accountantId: string,
    userId: string,
    userRole: string
  ): Promise<CompanyResponse> {
    try {
      const company = await prisma.company.findUnique({
        where: { id: companyId },
      });

      if (!company) {
        return {
          success: false,
          error: 'Company not found',
        };
      }

      // Check authorization (owner or admin)
      if (userRole !== 'ADMIN' && company.ownerId !== userId) {
        return {
          success: false,
          error: 'Not authorized to remove accountants from this company',
        };
      }

      // Soft delete the company user relationship
      await prisma.companyUser.updateMany({
        where: {
          userId: accountantId,
          companyId,
        },
        data: {
          deletedAt: new Date(),
        },
      });

      return {
        success: true,
        company: { message: 'Accountant removed from company' },
      };
    } catch (error) {
      console.error('Remove accountant error:', error);
      return {
        success: false,
        error: 'Failed to remove accountant',
      };
    }
  }

  /**
   * Get accountants assigned to a company
   */
  static async getAccountants(
    companyId: string,
    userId: string,
    userRole: string
  ): Promise<any> {
    try {
      const company = await prisma.company.findUnique({
        where: { id: companyId },
      });

      if (!company) {
        return {
          success: false,
          error: 'Company not found',
        };
      }

      // Check authorization
      const isAuthorized =
        userRole === 'ADMIN' ||
        company.ownerId === userId ||
        (await prisma.companyUser.findFirst({
          where: {
            companyId,
            userId,
            deletedAt: null,
          },
        })) !== null;

      if (!isAuthorized) {
        return {
          success: false,
          error: 'Not authorized to view accountants for this company',
        };
      }

      const accountants = await prisma.companyUser.findMany({
        where: {
          companyId,
          deletedAt: null,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      });

      return {
        success: true,
        accountants,
      };
    } catch (error) {
      console.error('Get accountants error:', error);
      return {
        success: false,
        error: 'Failed to retrieve accountants',
      };
    }
  }
}
