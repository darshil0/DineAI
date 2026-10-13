// A simple in-memory Vector DB to simulate a real service like Pinecone or Qdrant
import fs from 'fs';
import path from 'path';
import { MODELS } from '../config/models.js';

const INDEX_FILE = path.join(process.cwd(), 'vector_index.json');

export interface VectorRecord {
  id: string;
  embedding: number[];
  metadata: any;
  score?: number;
}

interface IndexFilePayload {
  embeddingModel: string;
  records: VectorRecord[];
}

class LocalVectorDB {
  records: VectorRecord[] = [];

  constructor() {
    this.loadFromIndex();
  }

  normalize(vec: number[]) {
    const norm = Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0));
    if (norm === 0) return vec;
    return vec.map((val) => val / norm);
  }

  async add(record: VectorRecord) {
    const normalizedRecord = {
      ...record,
      embedding: this.normalize(record.embedding),
    };
    const existingIndex = this.records.findIndex((r) => r.id === record.id);
    if (existingIndex !== -1) {
      this.records[existingIndex] = normalizedRecord;
    } else {
      this.records.push(normalizedRecord);
    }
  }

  isEmpty() {
    return this.records.length === 0;
  }

  async upsert(records: VectorRecord[]) {
    for (const record of records) {
      const normalizedRecord = {
        ...record,
        embedding: this.normalize(record.embedding),
      };
      const existingIdx = this.records.findIndex((r) => r.id === record.id);
      if (existingIdx >= 0) {
        this.records[existingIdx] = normalizedRecord;
      } else {
        this.records.push(normalizedRecord);
      }
    }
  }

  async query(queryEmbedding: number[], topK = 10) {
    const normalizedQuery = this.normalize(queryEmbedding);
    const scored = this.records.map((record) => {
      const score = this.dotProduct(normalizedQuery, record.embedding);
      return { ...record, score };
    });

    // Sort descending by similarity score
    scored.sort((a, b) => b.score! - a.score!);
    return scored.slice(0, topK);
  }

  dotProduct(vecA: number[], vecB: number[]) {
    let dotProduct = 0;
    for (let i = 0; i < Math.min(vecA.length, vecB.length); i++) {
      dotProduct += vecA[i] * vecB[i];
    }
    return dotProduct;
  }

  async count() {
    return this.records.length;
  }

  clear() {
    this.records = [];
  }

  saveToIndex() {
    try {
      const payload: IndexFilePayload = {
        embeddingModel: MODELS.EMBEDDING,
        records: this.records,
      };
      fs.writeFileSync(INDEX_FILE, JSON.stringify(payload, null, 2), 'utf8');
      console.log(
        `Vector index saved to ${INDEX_FILE} (${this.records.length} records, model=${MODELS.EMBEDDING})`,
      );
    } catch (e) {
      console.error('Failed to save vector index:', e);
    }
  }

  loadFromIndex() {
    try {
      if (fs.existsSync(INDEX_FILE)) {
        const raw = fs.readFileSync(INDEX_FILE, 'utf8');
        const parsed = JSON.parse(raw);

        if (Array.isArray(parsed)) {
          // Old format without model metadata: clear records to ensure re-embedding with active model
          console.log(
            'Legacy vector index format detected without model version. Invalidating index...',
          );
          this.records = [];
          return;
        }

        if (parsed.embeddingModel !== MODELS.EMBEDDING) {
          console.log(
            `Embedding model changed (${parsed.embeddingModel || 'unknown'} -> ${MODELS.EMBEDDING}). Invalidating existing index...`,
          );
          this.records = [];
          return;
        }

        this.records = parsed.records || [];
        console.log(`Vector index loaded from ${INDEX_FILE} (${this.records.length} records)`);
      }
    } catch (e) {
      console.error('Failed to load vector index:', e);
      this.records = [];
    }
  }
}

export const vectorDb = new LocalVectorDB();
