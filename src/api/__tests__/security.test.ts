import { describe, it } from 'node:test';
import assert from 'node:assert';
import express from 'express';
import { authenticateApiKey } from '../middleware/auth.js';
import { createRateLimiter } from '../middleware/rateLimit.js';

describe('Security & Middleware Tests', () => {
  it('should reject requests with missing or invalid Auth header when API_KEY is set', async () => {
    process.env.API_KEY = 'test-secret-key';
    const app = express();
    app.use(authenticateApiKey);
    app.get('/test', (_req, res) => {
      res.json({ ok: true });
    });

    const server = app.listen(0);
    const address = server.address() as any;
    const port = address.port;

    try {
      // 1. Missing header
      const res1 = await fetch(`http://127.0.0.1:${port}/test`);
      assert.strictEqual(res1.status, 401);

      // 2. Invalid token
      const res2 = await fetch(`http://127.0.0.1:${port}/test`, {
        headers: { Authorization: 'Bearer wrong-key' },
      });
      assert.strictEqual(res2.status, 401);

      // 3. Valid token
      const res3 = await fetch(`http://127.0.0.1:${port}/test`, {
        headers: { Authorization: 'Bearer test-secret-key' },
      });
      assert.strictEqual(res3.status, 200);
      const data = await res3.json();
      assert.deepStrictEqual(data, { ok: true });
    } finally {
      delete process.env.API_KEY;
      server.close();
    }
  });

  it('should enforce rate limits and return 429 when threshold exceeded', async () => {
    const app = express();
    app.use(createRateLimiter({ windowMs: 1000, max: 3 }));
    app.get('/limited', (_req, res) => res.send('ok'));

    const server = app.listen(0);
    const address = server.address() as any;
    const port = address.port;

    try {
      for (let i = 0; i < 3; i++) {
        const res = await fetch(`http://127.0.0.1:${port}/limited`);
        assert.strictEqual(res.status, 200);
      }
      const res4 = await fetch(`http://127.0.0.1:${port}/limited`);
      assert.strictEqual(res4.status, 429);
      const body = await res4.json();
      assert.strictEqual(body.error, 'Too many requests. Please try again later.');
    } finally {
      server.close();
    }
  });

  it('should reject disallowed browser origins with 403', async () => {
    const app = express();
    app.use((req, res, next) => {
      const origin = req.headers.origin;
      if (!origin) return next();
      const isLocalhost =
        /^https?:\/\/localhost(:\d+)?$/.test(origin) ||
        /^https?:\/\/127\.0\.0\.1(:\d+)?$/.test(origin);
      if (!isLocalhost) {
        return res.status(403).json({ error: 'CORS: Origin not allowed.' });
      }
      res.setHeader('Access-Control-Allow-Origin', origin);
      next();
    });
    app.get('/cors-test', (_req, res) => res.send('ok'));

    const server = app.listen(0);
    const address = server.address() as any;
    const port = address.port;

    try {
      // Allowed origin
      const res1 = await fetch(`http://127.0.0.1:${port}/cors-test`, {
        headers: { Origin: 'http://localhost:3000' },
      });
      assert.strictEqual(res1.status, 200);

      // Disallowed origin
      const res2 = await fetch(`http://127.0.0.1:${port}/cors-test`, {
        headers: { Origin: 'https://evil-site.com' },
      });
      assert.strictEqual(res2.status, 403);
      const body = await res2.json();
      assert.strictEqual(body.error, 'CORS: Origin not allowed.');
    } finally {
      server.close();
    }
  });
});
