import { vectorDb } from "../vectorDb.js";

async function testVectorDb() {
  console.log("Testing Vector DB optimization...");

  const record1 = { id: "1", embedding: [1, 0, 0], metadata: { name: "A" } };
  const record2 = { id: "2", embedding: [0, 1, 0], metadata: { name: "B" } };
  const record3 = { id: "3", embedding: [0.707, 0.707, 0], metadata: { name: "C" } }; // ~45 deg

  await vectorDb.upsert([record1, record2, record3]);

  // Query for record 1 (should have similarity 1.0)
  const results1 = await vectorDb.query([1, 0, 0], 3);
  console.log("Results for [1,0,0]:", results1.map(r => ({ id: r.id, score: r.score.toFixed(3) })));
  
  if (Math.abs(results1[0].score - 1.0) > 0.01) {
    throw new Error(`Expected similarity 1.0 for perfect match, got ${results1[0].score}`);
  }

  // Record 3 should be roughly 0.707 similarity with Record 1
  const rec3Match = results1.find(r => r.id === "3");
  if (!rec3Match || Math.abs(rec3Match.score - 0.707) > 0.01) {
      throw new Error(`Expected similarity ~0.707 for 45 deg angle, got ${rec3Match?.score}`);
  }

  console.log("Vector DB optimization test passed!");
}

testVectorDb().catch(err => {
  console.error(err);
  process.exit(1);
});
