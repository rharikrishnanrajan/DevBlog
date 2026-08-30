import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import postRoutes from './routes/postRoutes';
import { initDatabase, isDbConnected } from './config/database';
import {
  securityHeaders,
  globalApiRateLimiter,
  sanitizeRequestBody
} from './middleware/security';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Explicitly disable X-Powered-By header to prevent technology stack disclosure
app.disable('x-powered-by');

// Trust proxy headers for accurate client IP detection behind reverse proxies (Render, AWS, Nginx)
app.set('trust proxy', 1);

// Apply comprehensive HTTP security headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options)
app.use(securityHeaders);

// Resolve frontend directory path across dev and production build structures
const candidateFrontendPaths = [
  path.resolve(__dirname, '../../frontend'),
  path.resolve(__dirname, '../frontend'),
  path.resolve(process.cwd(), 'frontend'),
  path.resolve(process.cwd(), '../frontend')
];
const frontendPath = candidateFrontendPaths.find((p) => fs.existsSync(p)) || candidateFrontendPaths[0];

// CORS Configuration
const frontendUrl = process.env.FRONTEND_URL;
// Harden CORS: restrict to specific frontend URL, avoid wildcard in production
const corsOptions = {
  origin: frontendUrl || 'http://localhost:3000', // default to localhost for development
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // OPTIONS is handled automatically
  allowedHeaders: ['Content-Type'], // Authorization not needed for now
  credentials: false, // set to true if your frontend needs to send cookies or auth headers
};
app.use(cors(corsOptions));

// Body Parsing Middleware with size limits
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Input Sanitization Middleware (guards against prototype pollution & null-byte injections)
app.use(sanitizeRequestBody);

// Request Logger (redacting sensitive fields)
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Serve Static Frontend Assets (HTML, CSS, JS, Images)
if (fs.existsSync(frontendPath)) {
  console.log(`📁 Serving frontend static assets from: ${frontendPath}`);
  app.use(express.static(frontendPath));
}

// Health Check Endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    message: 'Developer Blog API (Express + TypeScript) is running securely',
    database: isDbConnected() ? 'connected (MySQL)' : 'in-memory fallback (active)'
  });
});

// Apply Global Rate Limiter to all /api endpoints
app.use('/api', globalApiRateLimiter);

// API Routes
app.use('/api/posts', postRoutes);

// Fallback 404 handler for undefined /api routes
app.all('/api/*', (_req: Request, res: Response) => {
  res.status(404).json({ message: 'API route not found' });
});

// SPA Catch-All: Serve frontend index.html for all non-API web traffic
app.get('*', (_req: Request, res: Response) => {
  const indexPath = path.join(frontendPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Frontend index.html not found');
  }
});

// Global Error Handler Middleware
app.use((err: Error & { status?: number }, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled server error:', err.message || err);
  if (err.name === 'SyntaxError' || err.message?.includes('JSON')) {
    res.status(400).json({ message: 'Invalid JSON body provided' });
    return;
  }
  if (err.status === 413 || err.message === 'Payload too large') {
    res.status(413).json({ message: 'Request payload is too large' });
    return;
  }
  // Generic safe error message to prevent internal system or database disclosure
  res.status(500).json({ message: 'An unexpected error occurred on the server' });
});

// Initialize Database asynchronously
initDatabase().catch((err) => {
  console.error('Database initialization error:', err);
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`🚀 Unified Blog Application running securely on http://localhost:${PORT}`);
  console.log(`🌐 Frontend UI: http://localhost:${PORT}`);
  console.log(`📡 REST API:   http://localhost:${PORT}/api/posts`);
});

export default app;

