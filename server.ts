import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import path from 'path';
import chatRouter from './src/api/chat.js';
import { bootstrapSkills } from './src/skills/bootstrap.js';
import { ingestRestaurants } from './src/scripts/ingestRestaurants.js';
import { vectorDb } from './src/lib/vectorDb.js';
import { verifyGeminiHealth } from './src/lib/geminiClient.js';

let server: any = null;
let isShuttingDown = false;

async function gracefulShutdown(signal: string, exitCode = 0) {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`[Lifecycle] Received ${signal}. Shutting down gracefully...`);

  // Set shutdown timeout to prevent hung cleanup tasks from blocking process exit
  const forceExitTimer = setTimeout(() => {
    console.error('[Lifecycle] Shutdown timed out after 5s. Forcing exit.');
    process.exit(1);
  }, 5000);
  if (forceExitTimer.unref) forceExitTimer.unref();

  try {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    vectorDb.saveToIndex();
    console.log('[Lifecycle] Vector DB index saved. Server shutdown complete.');
    process.exit(exitCode);
  } catch (error) {
    console.error('[Lifecycle] Error during shutdown:', error);
    process.exit(1);
  }
}

process.on('SIGINT', () => gracefulShutdown('SIGINT', 0));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM', 0));

process.on('uncaughtException', (err: Error) => {
  console.error('[Lifecycle] Uncaught Exception:', err.message);
  gracefulShutdown('uncaughtException', 1);
});

process.on('unhandledRejection', (reason: any) => {
  console.error('[Lifecycle] Unhandled Rejection:', reason);
  gracefulShutdown('unhandledRejection', 1);
});

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const HOST = process.env.HOST || '127.0.0.1';
  const isProduction = process.env.NODE_ENV === 'production';

  // 1. Check GEMINI_API_KEY and health
  const isHealthy = await verifyGeminiHealth();
  if (!isHealthy) {
    console.warn(
      '[Startup Warning] GEMINI_API_KEY is not configured or failed health check. Gemini features will fail until a valid key is provided.',
    );
  }

  // 2. Initialize Agent Skills
  bootstrapSkills();

  // 3. Ingest restaurants catalog into Vector DB if missing or incomplete
  await ingestRestaurants();

  // 4. Concise Request Logging Middleware
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`[HTTP] ${req.method} ${req.path} ${res.statusCode} - ${duration}ms`);
    });
    next();
  });

  // 5. Custom CORS Middleware (403 for disallowed origins)
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (!origin) {
      // Non-browser / server-to-server request
      return next();
    }

    const customOrigins = (process.env.ALLOWED_ORIGINS || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const isLocalhost =
      /^https?:\/\/localhost(:\d+)?$/.test(origin) ||
      /^https?:\/\/127\.0\.0\.1(:\d+)?$/.test(origin);

    const isAllowed = isLocalhost || customOrigins.includes(origin);

    if (!isAllowed) {
      res.status(403).json({ error: 'CORS: Origin not allowed.' });
      return;
    }

    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      res.sendStatus(204);
      return;
    }
    next();
  });

  // 6. Body Parser Middleware (JSON limit 10MB to accommodate base64 photos)
  app.use(express.json({ limit: '10mb' }));

  // 7. API Routes
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      environment: process.env.NODE_ENV || 'development',
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    });
  });

  app.use('/api/chat', chatRouter);

  // 8. Static / Vite Middleware Setup
  if (!isProduction) {
    console.log('[Server] Operating in DEVELOPMENT mode using Vite middleware...');
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    console.log('[Server] Operating in PRODUCTION mode serving built static assets...');
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('/{*splat}', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // 9. Global Error Handler Middleware
  app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('[Server Error]', err);
    if (err.type === 'entity.too.large' || err.status === 413) {
      res.status(413).json({ error: 'Payload size exceeds maximum allowed limit.' });
      return;
    }
    const statusCode = err?.statusCode ?? err?.status ?? 500;
    const message = err?.userFriendlyMessage ?? 'An unexpected error occurred.';
    res.status(statusCode).json({ error: message });
  });

  // 10. Start Server
  server = app.listen(PORT, HOST, () => {
    const displayHost = HOST === '0.0.0.0' || HOST === '127.0.0.1' ? 'localhost' : HOST;
    console.log(
      `DineAI server running in ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'} mode on http://${displayHost}:${PORT}`,
    );
  });
}

startServer().catch((err) => {
  console.error('[Server Start Failure]', err);
  process.exit(1);
});
