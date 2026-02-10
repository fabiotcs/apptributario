import { Router, Request, Response } from 'express';
import prisma from '../lib/db';

const router = Router();

interface HealthStatus {
  status: string;
  timestamp: string;
  uptime: number;
  environment: string;
}

interface HealthCheckResponse {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
  environment: string;
  database?: {
    status: 'connected' | 'disconnected';
    responseTime?: number;
  };
}

/**
 * GET /health
 * Basic health check endpoint
 */
router.get('/', (_req: Request, res: Response) => {
  const healthStatus: HealthStatus = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  };
  res.status(200).json(healthStatus);
});

/**
 * GET /health/db
 * Database connectivity check
 */
router.get('/db', async (_req: Request, res: Response) => {
  try {
    const startTime = Date.now();

    // Test database connection with a simple query
    await prisma.$queryRaw`SELECT 1`;

    const responseTime = Date.now() - startTime;

    const response: HealthCheckResponse = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: {
        status: 'connected',
        responseTime,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    const response: HealthCheckResponse = {
      status: 'error',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: {
        status: 'disconnected',
      },
    };

    res.status(503).json(response);
  }
});

/**
 * GET /health/ready
 * Readiness probe (checks if service is ready to accept traffic)
 */
router.get('/ready', async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ ready: true });
  } catch (error) {
    res.status(503).json({ ready: false, error: 'Database unavailable' });
  }
});

export default router;
