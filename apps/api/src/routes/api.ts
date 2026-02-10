import { Router, Request, Response } from 'express';
import authRoutes from './auth';
import companiesRoutes from './companies';

const router = Router();

interface ApiResponse {
  message: string;
  timestamp: string;
}

router.get('/', (_req: Request, res: Response) => {
  const response: ApiResponse = {
    message: 'Welcome to Agente Tritutario API',
    timestamp: new Date().toISOString(),
  };
  res.status(200).json(response);
});

router.post('/test', (req: Request, res: Response) => {
  const { data } = req.body;
  res.status(200).json({
    message: 'Data received',
    data,
    timestamp: new Date().toISOString(),
  });
});

// V1 API Routes
const v1Router = Router();

// Authentication routes
v1Router.use('/auth', authRoutes);

// Company routes
v1Router.use('/', companiesRoutes);

// Export v1 routes under /v1 path
router.use('/v1', v1Router);

export default router;
