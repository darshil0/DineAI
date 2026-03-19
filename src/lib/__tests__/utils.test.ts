import { withRetry } from "../utils.js";

async function testWithRetry() {
  console.log("Testing withRetry utility...");

  let attempts = 0;
  const failingFn = async () => {
    attempts++;
    if (attempts < 3) {
      const err: any = new Error("Rate limited (429)");
      err.status = 429;
      throw err;
    }
    return "success";
  };

  const result = await withRetry(failingFn, 3, 10);
  if (result !== "success" || attempts !== 3) {
    throw new Error(`withRetry failed: expected success and 3 attempts, got ${result} and ${attempts} attempts`);
  }

  console.log("withRetry test passed!");
}

testWithRetry().catch(err => {
  console.error(err);
  process.exit(1);
});
