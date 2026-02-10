import prisma from '@api/lib/db';

/**
 * AdvisoryService - Advisory request and review management
 * Handles creation, assignment, review, and status tracking of advisory requests
 */
export class AdvisoryService {
  /**
   * Create advisory request for tax analysis review
   */
  static async createAdvisoryRequest(input: {
    companyId: string;
    analysisId: string;
    requestedBy: string;
    requestType: 'TAX_REVIEW' | 'GENERAL_ADVISORY';
    description?: string;
  }) {
    try {
      const advisory = await prisma.advisoryRequest.create({
        data: {
          companyId: input.companyId,
          analysisId: input.analysisId,
          requestedBy: input.requestedBy,
          requestType: input.requestType,
          description: input.description,
          status: 'PENDING',
        },
        include: {
          company: true,
          analysis: true,
          requestedByUser: true,
        },
      });

      return advisory;
    } catch (error) {
      throw new Error(`Failed to create advisory request: ${(error as Error).message}`);
    }
  }

  /**
   * Assign accountant to advisory request
   */
  static async assignAccountant(
    advisoryId: string,
    accountantId: string,
    assignedBy: string
  ) {
    try {
      const advisory = await prisma.advisoryRequest.findUnique({
        where: { id: advisoryId },
      });

      if (!advisory) {
        throw new Error('Advisory request not found');
      }

      // Check accountant is available
      const accountant = await prisma.accountantProfile.findUnique({
        where: { id: accountantId },
      });

      if (!accountant || !accountant.isAvailable) {
        throw new Error('Accountant not available');
      }

      const updated = await prisma.advisoryRequest.update({
        where: { id: advisoryId },
        data: {
          assignedAccountantId: accountantId,
          assignedAt: new Date(),
          assignedBy,
          status: 'ASSIGNED',
        },
        include: {
          company: true,
          assignedAccountant: true,
        },
      });

      return updated;
    } catch (error) {
      throw new Error(`Failed to assign accountant: ${(error as Error).message}`);
    }
  }

  /**
   * Submit advisory review with notes and recommendations
   */
  static async submitReview(
    advisoryId: string,
    accountantId: string,
    input: {
      notes: string;
      recommendations: string[];
      reviewStatus: 'APPROVED' | 'NEEDS_REVISION' | 'REJECTED';
    }
  ) {
    try {
      const advisory = await prisma.advisoryRequest.findUnique({
        where: { id: advisoryId },
      });

      if (!advisory) {
        throw new Error('Advisory request not found');
      }

      if (advisory.assignedAccountantId !== accountantId) {
        throw new Error('Unauthorized to review this request');
      }

      const updated = await prisma.advisoryRequest.update({
        where: { id: advisoryId },
        data: {
          status: 'REVIEWED',
          reviewedAt: new Date(),
          reviewedBy: accountantId,
          reviewNotes: input.notes,
          reviewRecommendations: JSON.stringify(input.recommendations),
          reviewStatus: input.reviewStatus,
        },
      });

      // Create notification for company owner
      const advisory_request = await prisma.advisoryRequest.findUnique({
        where: { id: advisoryId },
        include: { company: true },
      });

      if (advisory_request?.company.ownerId) {
        await prisma.notification.create({
          data: {
            userId: advisory_request.company.ownerId,
            type: 'CONTADOR_MESSAGE',
            title: 'Parecer Contábil Disponível',
            message: `Seu parecer contábil foi revisado por ${advisory_request.assignedAccountant?.user?.name || 'um contador'}`,
            metadata: JSON.stringify({ advisoryId, analysisId: advisory_request.analysisId }),
          },
        });
      }

      return updated;
    } catch (error) {
      throw new Error(`Failed to submit review: ${(error as Error).message}`);
    }
  }

  /**
   * Get advisory requests for company
   */
  static async getCompanyAdvisories(
    companyId: string,
    filters?: {
      status?: string;
      requestType?: string;
    }
  ) {
    try {
      const where: any = { companyId };
      if (filters?.status) where.status = filters.status;
      if (filters?.requestType) where.requestType = filters.requestType;

      const advisories = await prisma.advisoryRequest.findMany({
        where,
        include: {
          company: true,
          analysis: true,
          requestedByUser: true,
          assignedAccountant: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return advisories;
    } catch (error) {
      throw new Error(`Failed to fetch advisories: ${(error as Error).message}`);
    }
  }

  /**
   * Get advisory requests for accountant
   */
  static async getAccountantAdvisories(
    accountantId: string,
    status?: string
  ) {
    try {
      const where: any = { assignedAccountantId: accountantId };
      if (status) where.status = status;

      const advisories = await prisma.advisoryRequest.findMany({
        where,
        include: {
          company: true,
          analysis: true,
          requestedByUser: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return advisories;
    } catch (error) {
      throw new Error(`Failed to fetch accountant advisories: ${(error as Error).message}`);
    }
  }

  /**
   * Get advisory request details
   */
  static async getAdvisoryDetails(advisoryId: string) {
    try {
      const advisory = await prisma.advisoryRequest.findUnique({
        where: { id: advisoryId },
        include: {
          company: true,
          analysis: true,
          requestedByUser: true,
          assignedAccountant: true,
        },
      });

      if (!advisory) {
        throw new Error('Advisory request not found');
      }

      return advisory;
    } catch (error) {
      throw new Error(`Failed to fetch advisory: ${(error as Error).message}`);
    }
  }

  /**
   * Cancel advisory request
   */
  static async cancelAdvisory(advisoryId: string, cancelledBy: string) {
    try {
      const advisory = await prisma.advisoryRequest.update({
        where: { id: advisoryId },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
          cancelledBy,
        },
      });

      return advisory;
    } catch (error) {
      throw new Error(`Failed to cancel advisory: ${(error as Error).message}`);
    }
  }
}
