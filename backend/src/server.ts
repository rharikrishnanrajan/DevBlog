import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import postRoutes from './routes/postRoutes';
import { initDatabase } from './config/database';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// CORS Configuration
const frontendUrl = process.env.FRONTEND_URL || '*';
app.use(
  cors({
    origin: frontendUrl === '*' ? '*' : frontendUrl,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Body Parsing Middleware
app.use(express.json({ limit: '1mb' }));

// Request Logger
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Health Check Endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    message: 'Developer Blog API (Express + TypeScript) is running smoothly'
  });
});

// API Routes
app.use('/api/posts', postRoutes);

// Fallback 404 handler for undefined API routes
app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: 'API route not found' });
});

// Global Error Handler Middleware
app.use((err: Error & { status?: number }, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled server error:', err);
  if (err.name === 'SyntaxError' || err.message?.includes('JSON')) {
    res.status(400).json({ message: 'Invalid JSON body provided' });
    return;
  }
  if (err.status === 413 || err.message === 'Payload too large') {
    res.status(413).json({ message: 'Request payload is too large' });
    return;
  }
  res.status(500).json({ message: 'An unexpected error occurred on the server' });
});

// Initialize Database & Start Express Server
initDatabase().finally(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Express (TypeScript) Blog API running on http://localhost:${PORT}`);
    console.log(`📡 Endpoints available under http://localhost:${PORT}/api/posts`);
  });
});

export default app;
