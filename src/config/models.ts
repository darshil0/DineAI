// Centralized Gemini Model Configuration

export const MODELS = {
  // Reasoning Tier: Used for complex synthesis (Finalizer), search-grounded trend analysis (Trend Analyst)
  REASONING: process.env.GEMINI_REASONING_MODEL || 'gemini-2.5-pro',

  // Performance Tier: Used for high-throughput extraction, classification, and vision
  PERFORMANCE: process.env.GEMINI_TEXT_MODEL || 'gemini-2.5-flash',

  // Embedding Tier: Used for semantic vector embeddings (text-only RAG)
  EMBEDDING: process.env.GEMINI_EMBEDDING_MODEL || 'gemini-embedding-001',
} as const;
