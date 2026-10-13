import dotenv from 'dotenv';
dotenv.config();

import { verifyGeminiHealth } from '../lib/geminiClient.js';
import { MODELS } from '../config/models.js';

async function runHealthCheck() {
  console.log('=== DineAI Health & System Self-Test ===');
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Configured Models:`);
  console.log(` - Reasoning:   ${MODELS.REASONING}`);
  console.log(` - Performance: ${MODELS.PERFORMANCE}`);
  console.log(` - Embedding:   ${MODELS.EMBEDDING}`);

  const apiKeyPresent = Boolean(process.env.GEMINI_API_KEY);
  console.log(`GEMINI_API_KEY Present: ${apiKeyPresent}`);

  if (!apiKeyPresent) {
    console.error('ERROR: GEMINI_API_KEY environment variable is not set.');
    process.exit(1);
  }

  const isHealthy = await verifyGeminiHealth();
  if (isHealthy) {
    console.log('SUCCESS: Gemini client initialized successfully.');
    process.exit(0);
  } else {
    console.error('ERROR: Gemini client initialization or connectivity check failed.');
    process.exit(1);
  }
}

runHealthCheck();
