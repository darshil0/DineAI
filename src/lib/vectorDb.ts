// A simple in-memory Vector DB to simulate a real service like Pinecone or Qdrant
import fs from 'fs';
import path from 'path';

export interface VectorRecord {
  id: string;
  embedding: number[];
  metadata: any;
}

const INDEX_FILE = path.join(process.cwd(), 'vector_index.json');

class LocalVectorDB {
  private records: VectorRecord[] = [];

  constructor() {
    this.loadFromIndex();
  }

  private normalize(vec: number[]): number[] {
    const norm = Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0));
    if (norm === 0) return vec;
    return vec.map((val) => val / norm);
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

  async query(queryEmbedding: number[], topK: number = 10) {
    const normalizedQuery = this.normalize(queryEmbedding);
    const scored = this.records.map((record) => {
      const score = this.dotProduct(normalizedQuery, record.embedding);
      return { ...record, score };
    });

    // Sort descending by similarity score
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK);
  }

  private dotProduct(vecA: number[], vecB: number[]) {
    let dotProduct = 0;
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
    }
    return dotProduct;
  }

  async count() {
    return this.records.length;
  }

  saveToIndex() {
    try {
      fs.writeFileSync(INDEX_FILE, JSON.stringify(this.records), 'utf8');
      console.log(`Vector index saved to ${INDEX_FILE} (${this.records.length} records)`);
    } catch (e) {
      console.error('Failed to save vector index:', e);
    }
  }

  private loadFromIndex() {
    try {
      if (fs.existsSync(INDEX_FILE)) {
        const data = fs.readFileSync(INDEX_FILE, 'utf8');
        this.records = JSON.parse(data);
        console.log(`Vector index loaded from ${INDEX_FILE} (${this.records.length} records)`);
      }
    } catch (e) {
      console.error('Failed to load vector index:', e);
      this.records = [];
    }
  }
}

export const vectorDb = new LocalVectorDB();
