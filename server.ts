import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import cors from 'cors';
import chatRouter from './src/api/chat.js';
import { bootstrapSkills } from './src/skills/bootstrap.js';
import { ingestRestaurants } from './src/scripts/ingestRestaurants.js';
import { vectorDb } from './src/lib/vectorDb.js';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize Agent Skills
  bootstrapSkills();

  // Perform initial ingestion if index is empty
  if (vectorDb.isEmpty()) {
    await ingestRestaurants();
  }

  // Graceful shutdown
  const shutdown = () => {
    console.log('Shutting down...');
    vectorDb.saveToIndex();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (server-to-server, curl) and localhost
        const allowed = !origin || /^https?:\/\/localhost(:\d+)?$/.test(origin);
        callback(allowed ? null : new Error('CORS: origin not allowed'), allowed);
      },
      methods: ['GET', 'POST'],
    }),
  );
  app.use(express.json());

  // API routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/chat', chatRouter);

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // Express v5: wildcard routes require explicit named param syntax
    app.get('/{*splat}', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
