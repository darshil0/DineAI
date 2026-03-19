// A simple in-memory Vector DB to simulate a real service like Pinecone or Qdrant
export interface VectorRecord {
  id: string;
  embedding: number[];
  metadata: any;
}

class LocalVectorDB {
  private records: VectorRecord[] = [];

  private normalize(vec: number[]): number[] {
    const norm = Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0));
    if (norm === 0) return vec;
    return vec.map(val => val / norm);
  }

  async upsert(records: VectorRecord[]) {
    for (const record of records) {
      const normalizedRecord = {
        ...record,
        embedding: this.normalize(record.embedding)
      };
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
}

export const vectorDb = new LocalVectorDB();
