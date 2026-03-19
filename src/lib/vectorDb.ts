// A simple in-memory Vector DB to simulate a real service like Pinecone or Qdrant
export interface VectorRecord {
  id: string;
  embedding: number[];
  metadata: any;
}

class LocalVectorDB {
  private records: VectorRecord[] = [];

  async upsert(records: VectorRecord[]) {
    for (const record of records) {
      // Pre-normalize embeddings for faster dot-product similarity
      const normalizedEmbedding = this.normalize(record.embedding);
      const normalizedRecord = { ...record, embedding: normalizedEmbedding };

      const existingIdx = this.records.findIndex(r => r.id === record.id);
      if (existingIdx >= 0) {
        this.records[existingIdx] = normalizedRecord;
      } else {
        this.records.push(normalizedRecord);
      }
    }
  }

  async query(queryEmbedding: number[], topK: number = 10) {
    const normalizedQuery = this.normalize(queryEmbedding);
    const scored = this.records.map(record => {
      // Use dot product as similarity score (since vectors are normalized)
      const score = this.dotProduct(normalizedQuery, record.embedding);
      return { ...record, score };
    });
    
    // Sort descending by similarity score
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK);
  }

  private normalize(vec: number[]): number[] {
    const norm = Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0));
    if (norm === 0) return vec;
    return vec.map(val => val / norm);
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
}

export const vectorDb = new LocalVectorDB();
