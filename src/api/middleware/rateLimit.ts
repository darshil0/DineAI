import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitStore>();

// Clean up stale entries every 5 minutes
setInterval(
  () => {
    const now = Date.now();
    for (const [key, record] of rateLimitMap.entries()) {
      if (now > record.resetTime) {
        rateLimitMap.delete(key);
      }
    }
  },
  5 * 60 * 1000,
).unref();

export function createRateLimiter(options: { windowMs?: number; max?: number } = {}) {
  const windowMs = options.windowMs || 60 * 1000; // 1 minute
  const max = options.max || 30; // 30 requests per window

  return (req: Request, res: Response, next: NextFunction) => {
    // Key by Authorization header token or IP address
    const authHeader = req.headers.authorization;
    const clientKey = authHeader || req.ip || req.socket.remoteAddress || 'unknown';

    const now = Date.now();
    let record = rateLimitMap.get(clientKey);

    if (!record || now > record.resetTime) {
      record = {
        count: 1,
        resetTime: now + windowMs,
      };
      rateLimitMap.set(clientKey, record);
      return next();
    }

    record.count++;

    if (record.count > max) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfter);
      res.status(429).json({
        error: 'Too many requests. Please try again later.',
      });
      return;
    }

    next();
  };
}
