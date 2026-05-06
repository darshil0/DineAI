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
  let isShuttingDown = false;

  // Initialize Agent Skills
  bootstrapSkills();

  // Ingest restaurants into Vector DB
  try {
    await ingestRestaurants();
  } catch (error) {
    console.error('Failed to ingest restaurants, continuing with empty Vector DB:', error);
  }

  // Graceful shutdown with timeout guard
  const shutdown = async () => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    console.log('Shutting down gracefully...');
    const shutdownTimeout = setTimeout(() => {
      console.error('Shutdown timeout exceeded, forcing exit');
      process.exit(1);
    }, 5000); // 5 second timeout

    try {
      // Properly await the save operation
      vectorDb.saveToIndex();
      console.log('Vector index saved successfully');
      clearTimeout(shutdownTimeout);
      process.exit(0);
    } catch (error) {
      console.error('Error during shutdown:', error);
      clearTimeout(shutdownTimeout);
      process.exit(1);
    }
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  app.use(cors());
  app.use(express.json());

  // API routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use('/api/chat', chatRouter);

  // Error handling middleware
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Express error:', err);
    res.status(err.status || 500).json({
      error: err.message || 'Internal Server Error',
      userMessage: 'An unexpected error occurred. Please try again.',
    });
  });

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
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:3000`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
