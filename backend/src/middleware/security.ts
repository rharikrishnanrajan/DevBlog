import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// ──────────────────────────────────────────────────────────────
// 1. HTTP Security Headers Middleware (using helmet)
export function securityHeaders(req: Request, res: Response, next: Function): void {
  // Helmet with custom CSP and specific settings
  const helmetMiddleware = helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://ajax.googleapis.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "*"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'none'"]
      }
    },
    // Disable frameguard and xssFilter so we can set our own
    frameguard: false,
    xssFilter: false
  });

  // Call helmet middleware
  helmetMiddleware(req, res, (err) => {
    if (err) {
      return next(err);
    }
    // Set additional headers not covered by helmet or needing override
    // Referrer Policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    // Permissions Policy
    res.setHeader(
      'Permissions-Policy',
      'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()'
    );
    // Cross-Origin policies
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
    // Override X-Frame-Options to DENY (helmet's default is SAMEORIGIN via frameguard, which we disabled)
    res.setHeader('X-Frame-Options', 'DENY');
    // Override X-XSS-Protection to 0 (helmet's default is 1; mode=block via xssFilter, which we disabled)
    res.setHeader('X-XSS-Protection', '0');
    next();
  });
}

// ──────────────────────────────────────────────────────────────
// 2. Rate Limiting Middleware (using express-rate-limit)
interface RateLimitOptions {
  windowMs: number;
  max: number;
  message?: string;
  standardHeaders?: boolean;
  legacyHeaders?: boolean;
}

// Global limiter: 300 requests per 15-minute window per IP
export const globalApiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  message: 'Too many requests to the API. Please wait a few minutes before trying again.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Write operations limiter: 50 requests per 15-minute window per IP
export const writeOperationsRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50,
  message: 'Write request rate limit exceeded. Please wait before creating or editing more posts.',
  standardHeaders: true,
  legacyHeaders: false,
});

// ──────────────────────────────────────────────────────────────
// 3. Input Sanitization & Anti-Tampering Middleware (kept as-is)
function sanitizeValue(value: unknown): unknown {
  if (typeof value === 'string') {
    // Strip dangerous null bytes and trim
    return value.replace(/\0/g, '');
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (value !== null && typeof value === 'object') {
    const sanitizedObj: Record<string, unknown> = {};
    for (const key of Object.keys(value as Record<string, unknown>)) {
      // Prevent Prototype Pollution
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        continue;
      }
      sanitizedObj[key] = sanitizeValue((value as Record<string, unknown>)[key]);
    }
    return sanitizedObj;
  }
  return value;
}

export function sanitizeRequestBody(req: Request, _res: Response, next: NextFunction): void {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeValue(req.body);
  }
  next();
}