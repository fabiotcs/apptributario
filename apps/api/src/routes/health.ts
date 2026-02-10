import { Router, Request, Response } from 'express';

const router = Router();

interface HealthStatus {
  status: string;
  timestamp: string;
  uptime: number;
  environment: string;
}

router.get('/', (req: Request, res: Response) => {
  const healthStatus: HealthStatus = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  };
  res.status(200).json(healthStatus);
});

export default router;
