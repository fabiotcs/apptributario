import { Router, Request, Response } from 'express';

const router = Router();

interface ApiResponse {
  message: string;
  timestamp: string;
}

router.get('/', (req: Request, res: Response) => {
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

export default router;
