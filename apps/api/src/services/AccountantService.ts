import prisma from '../lib/db';
import {
  AccountantProfile,
  CompanyAccountant,
  AccountantAuditLog,
} from '@prisma/client';

/**
 * AccountantService — Complete accountant management
 * Handles profile CRUD, assignment management, capacity checks, and audit logging
 */
export class AccountantService {
  /**
   * Create accountant profile for a CONTADOR user
   * @param input Profile creation data
   * @param userId User ID (must be CONTADOR role)
   */
  static async createProfile(
    input: {
      licenseNumber: string;
      specializations: string[];
      bio?: string;
      yearsOfExperience: number;
      hourlyRate?: number;
      email: string;
      phone?: string;
      website?: string;
      maxClients?: number;
      certifications?: Array<{
        name: string;
        issuer: string;
        expiryDate: string;
      }>;
      profileImageUrl?: string;
    },
    userId: string
  ): Promise<AccountantProfile> {
    // Check if profile already exists
    const existingProfile = await prisma.accountantProfile.findUnique({
      where: { userId },
    });

    if (existingProfile) {
      throw new Error('Accountant profile already exists for this user');
    }

    // Check license number uniqueness
    const existingLicense = await prisma.accountantProfile.findUnique({
      where: { licenseNumber: input.licenseNumber },
    });

    if (existingLicense) {
      throw new Error('License number already registered');
    }

    // Validate specializations
    const validSpecializations = [
      'TAX',
      'PAYROLL',
      'COMPLIANCE',
      'ACCOUNTING',
      'ADVISORY',
    ];
    const invalidSpecs = input.specializations.filter(
      s => !validSpecializations.includes(s)
    );

    if (invalidSpecs.length > 0) {
      throw new Error(`Invalid specializations: ${invalidSpecs.join(', ')}`);
    }

    // Create profile
    const profile = await prisma.accountantProfile.create({
      data: {
        userId,
        licenseNumber: input.licenseNumber,
        specializations: input.specializations,
        bio: input.bio,
        yearsOfExperience: input.yearsOfExperience,
        hourlyRate: input.hourlyRate,
        email: input.email,
        phone: input.phone,
        website: input.website,
        maxClients: input.maxClients || 10,
        certifications: input.certifications,
        profileImageUrl: input.profileImageUrl,
      },
    });

    return profile;
  }

  /**
   * Get accountant profile by ID
   * @param accountantId Accountant user ID
   */
  static async getProfile(accountantId: string): Promise<AccountantProfile> {
    const profile = await prisma.accountantProfile.findUnique({
      where: { userId: accountantId },
    });

    if (!profile) {
      throw new Error('Accountant profile not found');
    }

    return profile;
  }

  /**
   * Update accountant profile
   * @param accountantId Accountant user ID
   * @param updates Fields to update
   * @param performedBy User ID performing the update (for audit)
   */
  static async updateProfile(
    accountantId: string,
    updates: {
      bio?: string;
      specializations?: string[];
      hourlyRate?: number;
      phone?: string;
      website?: string;
      certifications?: Array<{
        name: string;
        issuer: string;
        expiryDate: string;
      }>;
      profileImageUrl?: string;
      maxClients?: number;
    },
    performedBy: string
  ): Promise<AccountantProfile> {
    const profile = await this.getProfile(accountantId);

    // Validate specializations if provided
    if (updates.specializations) {
      const validSpecializations = [
        'TAX',
        'PAYROLL',
        'COMPLIANCE',
        'ACCOUNTING',
        'ADVISORY',
      ];
      const invalidSpecs = updates.specializations.filter(
        s => !validSpecializations.includes(s)
      );

      if (invalidSpecs.length > 0) {
        throw new Error(`Invalid specializations: ${invalidSpecs.join(', ')}`);
      }
    }

    // Track changes for audit log
    const changes: Record<string, { old: any; new: any }> = {};

    if (updates.bio !== undefined && updates.bio !== profile.bio) {
      changes.bio = { old: profile.bio, new: updates.bio };
    }
    if (
      updates.specializations &&
      JSON.stringify(updates.specializations) !==
        JSON.stringify(profile.specializations)
    ) {
      changes.specializations = {
        old: profile.specializations,
        new: updates.specializations,
      };
    }
    if (updates.hourlyRate !== undefined && updates.hourlyRate !== profile.hourlyRate) {
      changes.hourlyRate = { old: profile.hourlyRate, new: updates.hourlyRate };
    }

    // Update profile
    const updated = await prisma.accountantProfile.update({
      where: { userId: accountantId },
      data: {
        ...(updates.bio !== undefined && { bio: updates.bio }),
        ...(updates.specializations && {
          specializations: updates.specializations,
        }),
        ...(updates.hourlyRate !== undefined && {
          hourlyRate: updates.hourlyRate,
        }),
        ...(updates.phone !== undefined && { phone: updates.phone }),
        ...(updates.website !== undefined && { website: updates.website }),
        ...(updates.certifications && { certifications: updates.certifications }),
        ...(updates.profileImageUrl !== undefined && {
          profileImageUrl: updates.profileImageUrl,
        }),
        ...(updates.maxClients !== undefined && { maxClients: updates.maxClients }),
      },
    });

    // Log audit entry
    if (Object.keys(changes).length > 0) {
      await prisma.accountantAuditLog.create({
        data: {
          accountantId: profile.id,
          action: 'PROFILE_UPDATED',
          performedBy,
          changes,
        },
      });
    }

    return updated;
  }

  /**
   * Update accountant availability status
   * @param accountantId Accountant user ID
   * @param isAvailable New availability status
   * @param performedBy User ID performing the update
   */
  static async updateAvailability(
    accountantId: string,
    isAvailable: boolean,
    performedBy: string
  ): Promise<AccountantProfile> {
    const profile = await this.getProfile(accountantId);

    if (profile.isAvailable === isAvailable) {
      return profile;
    }

    const updated = await prisma.accountantProfile.update({
      where: { userId: accountantId },
      data: { isAvailable },
    });

    // Log audit entry
    await prisma.accountantAuditLog.create({
      data: {
        accountantId: profile.id,
        action: 'AVAILABILITY_CHANGED',
        performedBy,
        changes: { isAvailable: { old: profile.isAvailable, new: isAvailable } },
      },
    });

    return updated;
  }

  /**
   * List accountants with filtering and pagination
   */
  static async listAccountants(
    filters?: {
      search?: string;
      specialization?: string;
      isAvailable?: boolean;
      yearsOfExperience?: number;
    },
    pagination?: { page: number; limit: number }
  ): Promise<{
    accountants: AccountantProfile[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }> {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    // Search by name or license
    if (filters?.search) {
      where.OR = [
        { user: { name: { contains: filters.search, mode: 'insensitive' } } },
        { licenseNumber: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters?.specialization) {
      where.specializations = { has: filters.specialization };
    }

    if (filters?.isAvailable !== undefined) {
      where.isAvailable = filters.isAvailable;
    }

    if (filters?.yearsOfExperience !== undefined) {
      where.yearsOfExperience = { gte: filters.yearsOfExperience };
    }

    const [accountants, total] = await Promise.all([
      prisma.accountantProfile.findMany({
        where,
        include: { user: { select: { id: true, name: true, email: true } } },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.accountantProfile.count({ where }),
    ]);

    const pages = Math.ceil(total / limit);

    return { accountants, total, page, limit, pages };
  }

  /**
   * Assign accountant to company
   * @param accountantId Accountant user ID
   * @param companyId Company ID to assign to
   * @param role Assignment role (ADVISOR or MANAGER)
   * @param assignedBy User ID performing the assignment
   */
  static async assignToCompany(
    accountantId: string,
    companyId: string,
    role: 'ADVISOR' | 'MANAGER',
    assignedBy: string
  ): Promise<CompanyAccountant> {
    // Get accountant profile
    const profile = await this.getProfile(accountantId);

    // Check if accountant is available
    if (!profile.isAvailable) {
      throw new Error('Accountant is not currently accepting new clients');
    }

    // Check if at capacity
    if (profile.currentClientCount >= profile.maxClients) {
      throw new Error(
        `Accountant has reached maximum client limit (${profile.maxClients})`
      );
    }

    // Check if already assigned
    const existing = await prisma.companyAccountant.findUnique({
      where: {
        companyId_accountantId: {
          companyId,
          accountantId,
        },
      },
    });

    if (existing && !existing.endedAt) {
      throw new Error('Accountant is already assigned to this company');
    }

    // If was previously assigned, remove old assignment
    if (existing && existing.endedAt) {
      await prisma.companyAccountant.delete({
        where: { id: existing.id },
      });
    }

    // Validate company exists
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new Error('Company not found');
    }

    // Create assignment
    const assignment = await prisma.companyAccountant.create({
      data: {
        companyId,
        accountantId,
        role,
        assignedBy,
      },
    });

    // Increment client count
    await prisma.accountantProfile.update({
      where: { userId: accountantId },
      data: { currentClientCount: { increment: 1 } },
    });

    // Log audit entry
    await prisma.accountantAuditLog.create({
      data: {
        accountantId: profile.id,
        action: 'ASSIGNED',
        companyId,
        performedBy: assignedBy,
        changes: { role: { old: null, new: role } },
      },
    });

    return assignment;
  }

  /**
   * Remove assignment of accountant from company
   * @param accountantId Accountant user ID
   * @param companyId Company ID to remove from
   * @param removedBy User ID performing the removal
   */
  static async removeAssignment(
    accountantId: string,
    companyId: string,
    removedBy: string
  ): Promise<void> {
    const profile = await this.getProfile(accountantId);

    // Find and soft delete assignment
    const assignment = await prisma.companyAccountant.findUnique({
      where: {
        companyId_accountantId: {
          companyId,
          accountantId,
        },
      },
    });

    if (!assignment) {
      throw new Error('Assignment not found');
    }

    if (assignment.endedAt) {
      throw new Error('Assignment already ended');
    }

    // Soft delete by setting endedAt
    await prisma.companyAccountant.update({
      where: { id: assignment.id },
      data: { endedAt: new Date() },
    });

    // Decrement client count
    await prisma.accountantProfile.update({
      where: { userId: accountantId },
      data: { currentClientCount: { decrement: 1 } },
    });

    // Log audit entry
    await prisma.accountantAuditLog.create({
      data: {
        accountantId: profile.id,
        action: 'REMOVED',
        companyId,
        performedBy: removedBy,
        changes: { role: { old: assignment.role, new: null } },
      },
    });
  }

  /**
   * Get accountant's assigned companies
   */
  static async getAssignedCompanies(accountantId: string): Promise<
    (CompanyAccountant & {
      company: { id: string; name: string; cnpj: string };
    })[]
  > {
    const assignments = await prisma.companyAccountant.findMany({
      where: {
        accountantId,
        endedAt: null,
      },
      include: {
        company: {
          select: { id: true, name: true, cnpj: true },
        },
      },
      orderBy: { assignedAt: 'desc' },
    });

    return assignments;
  }

  /**
   * Update assignment role
   */
  static async updateAssignmentRole(
    accountantId: string,
    companyId: string,
    newRole: 'ADVISOR' | 'MANAGER',
    updatedBy: string
  ): Promise<CompanyAccountant> {
    const profile = await this.getProfile(accountantId);

    const assignment = await prisma.companyAccountant.findUnique({
      where: {
        companyId_accountantId: {
          companyId,
          accountantId,
        },
      },
    });

    if (!assignment) {
      throw new Error('Assignment not found');
    }

    if (assignment.endedAt) {
      throw new Error('Cannot update ended assignment');
    }

    const oldRole = assignment.role;

    const updated = await prisma.companyAccountant.update({
      where: { id: assignment.id },
      data: { role: newRole },
    });

    // Log audit entry
    await prisma.accountantAuditLog.create({
      data: {
        accountantId: profile.id,
        action: 'REASSIGNED',
        companyId,
        performedBy: updatedBy,
        changes: { role: { old: oldRole, new: newRole } },
      },
    });

    return updated;
  }

  /**
   * Get audit log for accountant
   */
  static async getAuditLog(accountantId: string): Promise<AccountantAuditLog[]> {
    const profile = await this.getProfile(accountantId);

    const logs = await prisma.accountantAuditLog.findMany({
      where: { accountantId: profile.id },
      orderBy: { createdAt: 'desc' },
    });

    return logs;
  }

  /**
   * Search accountants
   */
  static async searchAccountants(
    query: string,
    filters?: {
      specializations?: string[];
      minExperience?: number;
      available?: boolean;
      maxHourlyRate?: number;
    }
  ): Promise<AccountantProfile[]> {
    const where: any = {
      OR: [
        { user: { name: { contains: query, mode: 'insensitive' } } },
        { licenseNumber: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
      ],
    };

    if (filters?.specializations && filters.specializations.length > 0) {
      where.AND = [
        {
          specializations: {
            hasSome: filters.specializations,
          },
        },
      ];
    }

    if (filters?.minExperience !== undefined) {
      where.yearsOfExperience = { gte: filters.minExperience };
    }

    if (filters?.available !== undefined) {
      where.isAvailable = filters.available;
    }

    if (filters?.maxHourlyRate !== undefined && filters.maxHourlyRate > 0) {
      where.OR = [
        ...where.OR,
        { hourlyRate: { lte: filters.maxHourlyRate } },
        { hourlyRate: null },
      ];
    }

    const accountants = await prisma.accountantProfile.findMany({
      where,
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { yearsOfExperience: 'desc' },
      take: 50,
    });

    return accountants;
  }
}
