import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { TaxAnalysisService } from '../services/TaxAnalysisService';
import { TaxOpportunityService } from '../services/TaxOpportunityService';
import { createTaxAnalysisSchema, updateTaxAnalysisSchema, forecastSchema } from '../validators/tax.schemas';

const router = Router();

/**
 * POST /api/v1/tax/analyses
 * Create a new tax analysis
 */
router.post('/analyses', authMiddleware, async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validated = createTaxAnalysisSchema.parse(req.body);

    // Create analysis using service
    const analysis = await TaxAnalysisService.create(
      validated,
      req.user!.id,
      req.user!.role
    );

    return res.status(201).json({
      success: true,
      analysis,
    });
  } catch (error: any) {
    console.error('Create analysis error:', error);

    // Handle validation errors
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'Invalid request data',
        statusCode: 400,
        timestamp: new Date().toISOString(),
        details: error.errors[0],
      });
    }

    // Handle authorization errors
    if (error.message.includes('Not authorized') || error.message.includes('not found')) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: error.message || 'You do not have access to this company',
        statusCode: 403,
        timestamp: new Date().toISOString(),
      });
    }

    return res.status(500).json({
      success: false,
      error: 'ServerError',
      message: 'Failed to create analysis',
      statusCode: 500,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/v1/tax/analyses
 * List tax analyses with pagination
 */
router.get('/analyses', authMiddleware, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const companyId = req.query.companyId as string;
    const year = req.query.year ? parseInt(req.query.year as string) : undefined;
    const status = req.query.status as string;
    const search = req.query.search as string;

    const result = await TaxAnalysisService.list(
      {
        page,
        limit,
        companyId,
        year,
        status,
        search,
      },
      req.user!.id,
      req.user!.role
    );

    return res.status(200).json({
      success: true,
      analyses: result.analyses,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        pages: Math.ceil((result.total || 0) / result.limit!),
      },
    });
  } catch (error) {
    console.error('List analyses error:', error);
    return res.status(500).json({
      success: false,
      error: 'ServerError',
      message: 'Failed to list analyses',
      statusCode: 500,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/v1/tax/analyses/:id
 * Get analysis details
 */
router.get('/analyses/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const analysis = await TaxAnalysisService.getById(
      id,
      req.user!.id,
      req.user!.role
    );

    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: 'NotFound',
        message: 'Analysis not found',
        statusCode: 404,
        timestamp: new Date().toISOString(),
      });
    }

    return res.status(200).json({
      success: true,
      analysis,
    });
  } catch (error: any) {
    console.error('Get analysis error:', error);

    if (error.message.includes('Not authorized')) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'You do not have access to this analysis',
        statusCode: 403,
        timestamp: new Date().toISOString(),
      });
    }

    return res.status(500).json({
      success: false,
      error: 'ServerError',
      message: 'Failed to retrieve analysis',
      statusCode: 500,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * PATCH /api/v1/tax/analyses/:id
 * Update analysis
 */
router.patch('/analyses/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validate request body
    const validated = updateTaxAnalysisSchema.parse(req.body);

    const analysis = await TaxAnalysisService.update(
      id,
      validated,
      req.user!.id,
      req.user!.role
    );

    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: 'NotFound',
        message: 'Analysis not found',
        statusCode: 404,
        timestamp: new Date().toISOString(),
      });
    }

    return res.status(200).json({
      success: true,
      analysis,
    });
  } catch (error: any) {
    console.error('Update analysis error:', error);

    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'Invalid request data',
        statusCode: 400,
        timestamp: new Date().toISOString(),
        details: error.errors[0],
      });
    }

    if (error.message.includes('Not authorized') || error.message.includes('only')) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: error.message || 'You do not have permission to update this analysis',
        statusCode: 403,
        timestamp: new Date().toISOString(),
      });
    }

    return res.status(500).json({
      success: false,
      error: 'ServerError',
      message: 'Failed to update analysis',
      statusCode: 500,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/v1/tax/analyses/:id/comparison
 * Get detailed regime comparison
 */
router.get('/analyses/:id/comparison', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const comparison = await TaxAnalysisService.getComparison(
      id,
      req.user!.id,
      req.user!.role
    );

    if (!comparison) {
      return res.status(404).json({
        success: false,
        error: 'NotFound',
        message: 'Analysis not found',
        statusCode: 404,
        timestamp: new Date().toISOString(),
      });
    }

    return res.status(200).json({
      success: true,
      comparison,
    });
  } catch (error: any) {
    console.error('Get comparison error:', error);

    if (error.message.includes('Not authorized')) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'You do not have access to this analysis',
        statusCode: 403,
        timestamp: new Date().toISOString(),
      });
    }

    return res.status(500).json({
      success: false,
      error: 'ServerError',
      message: 'Failed to retrieve comparison',
      statusCode: 500,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/v1/tax/analyses/:id/opportunities
 * Get tax optimization opportunities
 */
router.get('/analyses/:id/opportunities', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const category = req.query.category as string;
    const riskLevel = req.query.riskLevel as string;
    const minROI = req.query.minROI ? parseFloat(req.query.minROI as string) : undefined;

    const result = await TaxOpportunityService.getOpportunitiesForAnalysis(
      id,
      {
        category,
        riskLevel,
        minROI,
      },
      req.user!.id,
      req.user!.role
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'NotFound',
        message: 'Analysis not found',
        statusCode: 404,
        timestamp: new Date().toISOString(),
      });
    }

    return res.status(200).json({
      success: true,
      opportunities: result.opportunities,
      summary: result.summary,
    });
  } catch (error: any) {
    console.error('Get opportunities error:', error);

    if (error.message.includes('Not authorized')) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'You do not have access to this analysis',
        statusCode: 403,
        timestamp: new Date().toISOString(),
      });
    }

    return res.status(500).json({
      success: false,
      error: 'ServerError',
      message: 'Failed to retrieve opportunities',
      statusCode: 500,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/v1/tax/filings
 * List tax filings with deadlines
 */
router.get('/filings', authMiddleware, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const companyId = req.query.companyId as string;
    const year = req.query.year ? parseInt(req.query.year as string) : undefined;
    const status = req.query.status as string;
    const dueDateFrom = req.query.dueDateFrom as string;
    const dueDateTo = req.query.dueDateTo as string;

    const result = await TaxAnalysisService.listFilings(
      {
        page,
        limit,
        companyId,
        year,
        status,
        dueDateFrom,
        dueDateTo,
      },
      req.user!.id,
      req.user!.role
    );

    return res.status(200).json({
      success: true,
      filings: result.filings,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        pages: Math.ceil((result.total || 0) / result.limit!),
      },
      summary: result.summary,
    });
  } catch (error) {
    console.error('List filings error:', error);
    return res.status(500).json({
      success: false,
      error: 'ServerError',
      message: 'Failed to list filings',
      statusCode: 500,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * POST /api/v1/tax/forecast
 * Generate tax forecast
 */
router.post('/forecast', authMiddleware, async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validated = forecastSchema.parse(req.body);

    const forecast = await TaxAnalysisService.generateForecast(
      validated,
      req.user!.id,
      req.user!.role
    );

    return res.status(200).json({
      success: true,
      forecast,
    });
  } catch (error: any) {
    console.error('Generate forecast error:', error);

    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'Invalid request data',
        statusCode: 400,
        timestamp: new Date().toISOString(),
        details: error.errors[0],
      });
    }

    if (error.message.includes('Not authorized') || error.message.includes('not found')) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: error.message || 'You do not have access to this company',
        statusCode: 403,
        timestamp: new Date().toISOString(),
      });
    }

    return res.status(500).json({
      success: false,
      error: 'ServerError',
      message: 'Failed to generate forecast',
      statusCode: 500,
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
