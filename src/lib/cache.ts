import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'embeddings_cache.db');
const db = new Database(dbPath);

// Initialize the cache table
db.exec(`
  CREATE TABLE IF NOT EXISTS embedding_cache (
    id TEXT PRIMARY KEY,
    embedding TEXT NOT NULL
  )
`);

interface CacheRow {
  embedding: string;
}

export const embeddingCache = {
  get(id: string): number[] | null {
    const row = db.prepare('SELECT embedding FROM embedding_cache WHERE id = ?').get(id) as CacheRow | undefined;
    if (row) {
      return JSON.parse(row.embedding);
    }
    return null;
  },

  set(id: string, embedding: number[]) {
    db.prepare('INSERT OR REPLACE INTO embedding_cache (id, embedding) VALUES (?, ?)').run(id, JSON.stringify(embedding));
  }
};
