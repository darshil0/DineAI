import { Request, Response, NextFunction } from 'express';

export function authenticateApiKey(req: Request, res: Response, next: NextFunction) {
  const configuredKey = process.env.API_KEY || process.env.AUTH_TOKEN;
  const isProduction = process.env.NODE_ENV === 'production';
  const allowUnauthDev = process.env.ALLOW_UNAUTHENTICATED_LOCAL_DEV === 'true';

  if (configuredKey) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized: Missing or invalid Authorization header.' });
      return;
    }
    const token = authHeader.substring(7).trim();
    if (token !== configuredKey) {
      res.status(401).json({ error: 'Unauthorized: Invalid API key or token.' });
      return;
    }
    return next();
  }

  // If no API key is configured
  if (isProduction) {
    console.error('[Security] Request blocked: API_KEY or AUTH_TOKEN is required in production.');
    res.status(401).json({
      error: 'Unauthorized: API authentication is required in production mode.',
    });
    return;
  }

  // Local development mode without configured key
  if (!allowUnauthDev) {
    console.warn(
      '[Security Warning] Running unauthenticated in local development mode. Set ALLOW_UNAUTHENTICATED_LOCAL_DEV=true or configure API_KEY to suppress this warning.',
    );
  }

  next();
}
