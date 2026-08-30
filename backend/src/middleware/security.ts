import { Request, Response, NextFunction } from 'express';

// ── 1. HTTP Security Headers Middleware ──────────────────────────────────────
// Emulates and expands on Helmet protections without external dependency friction
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Prevent clickjacking by denying framing
  res.setHeader('X-Frame-Options', 'DENY');

  // Legacy XSS filter disable (modern best practice to avoid XSS auditor vulnerabilities)
  res.setHeader('X-XSS-Protection', '0');

  // HTTP Strict Transport Security (enforce HTTPS for 1 year)
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

  // Referrer Policy: send full URL for same-origin, only origin for cross-origin
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Restrict browser features and APIs (camera, microphone, geolocation)
  res.setHeader(
    'Permissions-Policy',
    'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()'
  );

  // Cross-Origin policies
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');

  // Content Security Policy (CSP): Allow local assets, Google Fonts, and AngularJS CDN
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://ajax.googleapis.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: https:",
    "connect-src 'self' *",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'"
  ];
  res.setHeader('Content-Security-Policy', cspDirectives.join('; '));

  next();
}

// ── 2. Rate Limiting Middleware ──────────────────────────────────────────────
interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Periodically clean up expired rate limit entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000).unref();

export interface RateLimitOptions {
  windowMs: number;
  max: number;
  message?: string;
  keyPrefix?: string;
}

export function createRateLimiter(options: RateLimitOptions) {
  const { windowMs, max, message = 'Too many requests, please try again later.', keyPrefix = 'rl:' } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    // Determine client IP safely (supports proxies / reverse proxies)
    const clientIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
      req.socket.remoteAddress ||
      'unknown-ip';

    const storeKey = `${keyPrefix}${clientIp}`;
    const now = Date.now();
    const existing = rateLimitStore.get(storeKey);

    if (!existing || now > existing.resetTime) {
      // First request in this window
      rateLimitStore.set(storeKey, {
        count: 1,
        resetTime: now + windowMs
      });
      res.setHeader('RateLimit-Limit', max);
      res.setHeader('RateLimit-Remaining', max - 1);
      res.setHeader('RateLimit-Reset', Math.ceil((now + windowMs) / 1000));
      next();
      return;
    }

    // Existing window
    existing.count += 1;
    const remaining = Math.max(0, max - existing.count);
    const resetSeconds = Math.ceil((existing.resetTime - now) / 1000);

    res.setHeader('RateLimit-Limit', max);
    res.setHeader('RateLimit-Remaining', remaining);
    res.setHeader('RateLimit-Reset', Math.ceil(existing.resetTime / 1000));

    if (existing.count > max) {
      res.setHeader('Retry-After', resetSeconds);
      res.status(429).json({
        status: 'error',
        message,
        retryAfterSeconds: resetSeconds
      });
      return;
    }

    next();
  };
}

// Global Limiter: 300 requests per 15-minute window per IP
export const globalApiRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: 'Too many requests to the API. Please wait a few minutes before trying again.',
  keyPrefix: 'global:'
});

// Strict Write Operations Limiter (POST, PUT, DELETE): 50 requests per 15-minute window per IP
export const writeOperationsRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: 'Write request rate limit exceeded. Please wait before creating or editing more posts.',
  keyPrefix: 'write:'
});

// ── 3. Input Sanitization & Anti-Tampering Middleware ─────────────────────────
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
