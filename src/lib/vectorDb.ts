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
      const existingIdx = this.records.findIndex((r) => r.id === record.id);
      if (existingIdx >= 0) {
        this.records[existingIdx] = record;
      } else {
        this.records.push(record);
      }
    }
  }

  async query(queryEmbedding: number[], topK: number = 10) {
    const scored = this.records.map((record) => {
      const score = this.cosineSimilarity(queryEmbedding, record.embedding);
      return { ...record, score };
    });

    // Sort descending by similarity score
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK);
  }

  private cosineSimilarity(vecA: number[], vecB: number[]) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  async count() {
    return this.records.length;
  }
}

export const vectorDb = new LocalVectorDB();
