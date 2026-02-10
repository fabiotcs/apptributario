import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { AccountantService } from '../services/AccountantService';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * POST /api/v1/accountants/profile
 * Create accountant profile (CONTADOR only)
 */
router.post('/profile', requireRole(['CONTADOR']), async (req: Request, res: Response) => {
  try {
    const {
      licenseNumber,
      specializations,
      bio,
      yearsOfExperience,
      hourlyRate,
      email,
      phone,
      website,
      maxClients,
      certifications,
      profileImageUrl,
    } = req.body;

    // Validation
    if (!licenseNumber || !email || yearsOfExperience === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: licenseNumber, email, yearsOfExperience',
      });
    }

    if (!specializations || specializations.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one specialization is required',
      });
    }

    const profile = await AccountantService.createProfile(
      {
        licenseNumber,
        specializations,
        bio,
        yearsOfExperience,
        hourlyRate,
        email,
        phone,
        website,
        maxClients,
        certifications,
        profileImageUrl,
      },
      req.user!.id
    );

    res.status(201).json({
      success: true,
      profile,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(400).json({
      success: false,
      message,
    });
  }
});

/**
 * GET /api/v1/accountants
 * List accountants with filtering and pagination
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const specialization = req.query.specialization as string;
    const isAvailable = req.query.isAvailable === 'true';
    const yearsOfExperience = req.query.yearsOfExperience as string;

    const filters = {
      ...(search && { search }),
      ...(specialization && { specialization }),
      ...(req.query.isAvailable && { isAvailable }),
      ...(yearsOfExperience && { yearsOfExperience: parseInt(yearsOfExperience) }),
    };

    const result = await AccountantService.listAccountants(filters, {
      page,
      limit,
    });

    res.json({
      success: true,
      accountants: result.accountants,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        pages: result.pages,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(400).json({
      success: false,
      message,
    });
  }
});

/**
 * GET /api/v1/accountants/:id
 * Get accountant profile details
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const profile = await AccountantService.getProfile(req.params.id);

    res.json({
      success: true,
      profile,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(404).json({
      success: false,
      message,
    });
  }
});

/**
 * PATCH /api/v1/accountants/:id/profile
 * Update accountant profile (owner or admin)
 */
router.patch('/:id/profile', async (req: Request, res: Response) => {
  try {
    // Check authorization: own profile or admin
    if (req.params.id !== req.user!.id && req.user!.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this profile',
      });
    }

    const { bio, specializations, hourlyRate, phone, website, certifications, profileImageUrl, maxClients } = req.body;

    const updated = await AccountantService.updateProfile(
      req.params.id,
      {
        bio,
        specializations,
        hourlyRate,
        phone,
        website,
        certifications,
        profileImageUrl,
        maxClients,
      },
      req.user!.id
    );

    res.json({
      success: true,
      profile: updated,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(400).json({
      success: false,
      message,
    });
  }
});

/**
 * PATCH /api/v1/accountants/:id/availability
 * Update availability status
 */
router.patch('/:id/availability', async (req: Request, res: Response) => {
  try {
    // Check authorization
    if (req.params.id !== req.user!.id && req.user!.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update availability',
      });
    }

    const { isAvailable } = req.body;

    if (typeof isAvailable !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isAvailable must be a boolean',
      });
    }

    const updated = await AccountantService.updateAvailability(
      req.params.id,
      isAvailable,
      req.user!.id
    );

    res.json({
      success: true,
      profile: updated,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(400).json({
      success: false,
      message,
    });
  }
});

/**
 * POST /api/v1/accountants/:id/assignments
 * Assign accountant to company
 */
router.post('/:id/assignments', requireRole(['EMPRESARIO', 'ADMIN']), async (req: Request, res: Response) => {
  try {
    const { companyId, role } = req.body;

    if (!companyId || !role) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: companyId, role',
      });
    }

    if (!['ADVISOR', 'MANAGER'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be ADVISOR or MANAGER',
      });
    }

    const assignment = await AccountantService.assignToCompany(
      req.params.id,
      companyId,
      role,
      req.user!.id
    );

    res.status(201).json({
      success: true,
      assignment,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(400).json({
      success: false,
      message,
    });
  }
});

/**
 * GET /api/v1/accountants/:id/assignments
 * Get accountant's assigned companies
 */
router.get('/:id/assignments', async (req: Request, res: Response) => {
  try {
    const assignments = await AccountantService.getAssignedCompanies(req.params.id);

    res.json({
      success: true,
      assignments,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(400).json({
      success: false,
      message,
    });
  }
});

/**
 * PATCH /api/v1/accountants/:id/assignments/:companyId
 * Update assignment role
 */
router.patch(
  '/:id/assignments/:companyId',
  requireRole(['EMPRESARIO', 'ADMIN']),
  async (req: Request, res: Response) => {
    try {
      const { role } = req.body;

      if (!role) {
        return res.status(400).json({
          success: false,
          message: 'Role is required',
        });
      }

      if (!['ADVISOR', 'MANAGER'].includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Role must be ADVISOR or MANAGER',
        });
      }

      const updated = await AccountantService.updateAssignmentRole(
        req.params.id,
        req.params.companyId,
        role,
        req.user!.id
      );

      res.json({
        success: true,
        assignment: updated,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(400).json({
        success: false,
        message,
      });
    }
  }
);

/**
 * DELETE /api/v1/accountants/:id/assignments/:companyId
 * Remove assignment
 */
router.delete(
  '/:id/assignments/:companyId',
  requireRole(['EMPRESARIO', 'ADMIN']),
  async (req: Request, res: Response) => {
    try {
      await AccountantService.removeAssignment(
        req.params.id,
        req.params.companyId,
        req.user!.id
      );

      res.json({
        success: true,
        message: 'Assignment removed successfully',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(400).json({
        success: false,
        message,
      });
    }
  }
);

/**
 * GET /api/v1/accountants/:id/audit-log
 * Get accountant audit trail
 */
router.get('/:id/audit-log', async (req: Request, res: Response) => {
  try {
    const logs = await AccountantService.getAuditLog(req.params.id);

    res.json({
      success: true,
      auditLog: logs,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(400).json({
      success: false,
      message,
    });
  }
});

/**
 * POST /api/v1/accountants/search
 * Advanced search
 */
router.post('/search', async (req: Request, res: Response) => {
  try {
    const { query, specializations, minExperience, available, maxHourlyRate } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
      });
    }

    const results = await AccountantService.searchAccountants(query, {
      specializations,
      minExperience,
      available,
      maxHourlyRate,
    });

    res.json({
      success: true,
      accountants: results,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(400).json({
      success: false,
      message,
    });
  }
});

export default router;
