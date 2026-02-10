import { Router, Request, Response } from 'express';
import { authMiddleware, optionalAuth } from '@/middleware/auth';
import { requireRole } from '@/middleware/rbac';
import { AdvisoryService } from '@/services/AdvisoryService';
import { asyncHandler } from '@/middleware/errorHandler';

const router = Router();

/**
 * POST /api/v1/advisory - Create new advisory request
 * Auth: EMPRESARIO (owner), CONTADOR, ADMIN
 */
router.post(
  '/',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { companyId, analysisId, requestType, description } = req.body;
    const userId = (req as any).user.id;
    const userRole = (req as any).user.role;

    // Only EMPRESARIO can request advisory (for their companies)
    if (userRole !== 'ADMIN' && userRole !== 'EMPRESARIO') {
      return res.status(403).json({ error: 'Only business owners can request advisory' });
    }

    const advisory = await AdvisoryService.createAdvisoryRequest({
      companyId,
      analysisId,
      requestedBy: userId,
      requestType,
      description,
    });

    res.status(201).json(advisory);
  })
);

/**
 * GET /api/v1/advisory - List advisories
 * Auth: Authenticated users (filtered by role)
 */
router.get(
  '/',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const userRole = (req as any).user.role;
    const { companyId, status, accountantId } = req.query;

    let advisories;

    if (userRole === 'ADMIN') {
      // Admin sees all
      advisories = await AdvisoryService.getCompanyAdvisories(
        companyId as string,
        { status: status as string }
      );
    } else if (userRole === 'EMPRESARIO') {
      // Business owner sees their company advisories
      advisories = await AdvisoryService.getCompanyAdvisories(
        companyId as string,
        { status: status as string }
      );
    } else if (userRole === 'CONTADOR') {
      // Accountant sees assigned advisories
      advisories = await AdvisoryService.getAccountantAdvisories(
        accountantId as string,
        status as string
      );
    }

    res.json({ advisories, total: advisories?.length || 0 });
  })
);

/**
 * GET /api/v1/advisory/:id - Get advisory details
 * Auth: Requestor, assigned accountant, company owner, or admin
 */
router.get(
  '/:id',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const advisory = await AdvisoryService.getAdvisoryDetails(id);
    res.json(advisory);
  })
);

/**
 * POST /api/v1/advisory/:id/assign - Assign accountant
 * Auth: Company owner or ADMIN
 */
router.post(
  '/:id/assign',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { accountantId } = req.body;
    const userId = (req as any).user.id;

    const advisory = await AdvisoryService.assignAccountant(id, accountantId, userId);
    res.json(advisory);
  })
);

/**
 * POST /api/v1/advisory/:id/review - Submit review
 * Auth: Assigned accountant
 */
router.post(
  '/:id/review',
  authMiddleware,
  requireRole(['CONTADOR']),
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { notes, recommendations, reviewStatus } = req.body;
    const accountantId = (req as any).user.id;

    const advisory = await AdvisoryService.submitReview(id, accountantId, {
      notes,
      recommendations,
      reviewStatus,
    });

    res.json(advisory);
  })
);

/**
 * DELETE /api/v1/advisory/:id - Cancel advisory
 * Auth: Requestor or ADMIN
 */
router.delete(
  '/:id',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const advisory = await AdvisoryService.cancelAdvisory(id, userId);
    res.json({ message: 'Advisory cancelled', advisory });
  })
);

export default router;
