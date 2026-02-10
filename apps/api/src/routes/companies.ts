import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { CompanyService } from '../services/CompanyService';

const router = Router();

/**
 * POST /api/v1/companies
 * Create a new company
 */
router.post('/companies', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { name, cnpj, legalName, industry, description, address, city, state, zipCode, phone, email, website, foundedYear, employees, revenue, taxRegime } = req.body;

    // Validate required fields
    if (!name || !cnpj) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Company name and CNPJ are required',
      });
    }

    const result = await CompanyService.create(
      {
        name,
        cnpj,
        legalName,
        industry,
        description,
        address,
        city,
        state,
        zipCode,
        phone,
        email,
        website,
        foundedYear,
        employees,
        revenue,
        taxRegime,
      },
      req.user!.id,
      req.user!.role
    );

    if (!result.success) {
      return res.status(400).json({
        error: 'Company Creation Failed',
        message: result.error,
      });
    }

    return res.status(201).json({
      success: true,
      company: result.company,
    });
  } catch (error) {
    console.error('Create company error:', error);
    return res.status(500).json({
      error: 'Server Error',
      message: 'Failed to create company',
    });
  }
});

/**
 * GET /api/v1/companies
 * List all companies (with pagination and filters)
 */
router.get('/companies', authMiddleware, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string;
    const industry = req.query.industry as string;
    const search = req.query.search as string;

    const filters = {
      ...(status && { status }),
      ...(industry && { industry }),
      ...(search && { search }),
    };

    const result = await CompanyService.findByUserId(
      req.user!.id,
      req.user!.role,
      page,
      limit,
      filters
    );

    if (!result.success) {
      return res.status(400).json({
        error: 'List Companies Failed',
        message: result.error,
      });
    }

    return res.status(200).json({
      success: true,
      companies: result.companies,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        pages: Math.ceil((result.total || 0) / result.limit!),
      },
    });
  } catch (error) {
    console.error('List companies error:', error);
    return res.status(500).json({
      error: 'Server Error',
      message: 'Failed to retrieve companies',
    });
  }
});

/**
 * GET /api/v1/companies/:id
 * Get company details
 */
router.get('/companies/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await CompanyService.findById(
      id,
      req.user!.id,
      req.user!.role
    );

    if (!result.success) {
      return res.status(result.error?.includes('Not authorized') ? 403 : 404).json({
        error: 'Not Found',
        message: result.error,
      });
    }

    return res.status(200).json({
      success: true,
      company: result.company,
    });
  } catch (error) {
    console.error('Get company error:', error);
    return res.status(500).json({
      error: 'Server Error',
      message: 'Failed to retrieve company',
    });
  }
});

/**
 * PATCH /api/v1/companies/:id
 * Update company details
 */
router.patch('/companies/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const result = await CompanyService.update(
      id,
      updates,
      req.user!.id,
      req.user!.role
    );

    if (!result.success) {
      return res.status(result.error?.includes('Not authorized') ? 403 : 404).json({
        error: 'Update Failed',
        message: result.error,
      });
    }

    return res.status(200).json({
      success: true,
      company: result.company,
    });
  } catch (error) {
    console.error('Update company error:', error);
    return res.status(500).json({
      error: 'Server Error',
      message: 'Failed to update company',
    });
  }
});

/**
 * DELETE /api/v1/companies/:id
 * Delete (soft delete) a company
 */
router.delete('/companies/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await CompanyService.delete(
      id,
      req.user!.id,
      req.user!.role
    );

    if (!result.success) {
      return res.status(result.error?.includes('Not authorized') ? 403 : 404).json({
        error: 'Delete Failed',
        message: result.error,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Company deleted successfully',
    });
  } catch (error) {
    console.error('Delete company error:', error);
    return res.status(500).json({
      error: 'Server Error',
      message: 'Failed to delete company',
    });
  }
});

/**
 * POST /api/v1/companies/:id/accountants
 * Assign accountant to company
 */
router.post('/companies/:id/accountants', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { accountantId, role } = req.body;

    // Validate required fields
    if (!accountantId) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Accountant ID is required',
      });
    }

    const result = await CompanyService.assignAccountant(
      id,
      accountantId,
      role || 'ADVISOR',
      req.user!.id,
      req.user!.role
    );

    if (!result.success) {
      return res.status(result.error?.includes('Not authorized') ? 403 : 400).json({
        error: 'Assign Failed',
        message: result.error,
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Accountant assigned to company',
      assignment: result.company,
    });
  } catch (error) {
    console.error('Assign accountant error:', error);
    return res.status(500).json({
      error: 'Server Error',
      message: 'Failed to assign accountant',
    });
  }
});

/**
 * GET /api/v1/companies/:id/accountants
 * Get accountants assigned to company
 */
router.get('/companies/:id/accountants', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await CompanyService.getAccountants(
      id,
      req.user!.id,
      req.user!.role
    );

    if (!result.success) {
      return res.status(result.error?.includes('Not authorized') ? 403 : 404).json({
        error: 'Not Found',
        message: result.error,
      });
    }

    return res.status(200).json({
      success: true,
      accountants: result.accountants,
    });
  } catch (error) {
    console.error('Get accountants error:', error);
    return res.status(500).json({
      error: 'Server Error',
      message: 'Failed to retrieve accountants',
    });
  }
});

/**
 * DELETE /api/v1/companies/:id/accountants/:accountantId
 * Remove accountant from company
 */
router.delete('/companies/:id/accountants/:accountantId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id, accountantId } = req.params;

    const result = await CompanyService.removeAccountant(
      id,
      accountantId,
      req.user!.id,
      req.user!.role
    );

    if (!result.success) {
      return res.status(result.error?.includes('Not authorized') ? 403 : 404).json({
        error: 'Remove Failed',
        message: result.error,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Accountant removed from company',
    });
  } catch (error) {
    console.error('Remove accountant error:', error);
    return res.status(500).json({
      error: 'Server Error',
      message: 'Failed to remove accountant',
    });
  }
});

export default router;
