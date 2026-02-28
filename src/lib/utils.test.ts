import { cleanJson } from "./utils.js";

function assertEqual(actual: string, expected: string, message: string) {
  if (actual !== expected) {
    console.error(`FAILED: ${message}`);
    console.error(`  Expected: "${expected}"`);
    console.error(`  Actual:   "${actual}"`);
    process.exit(1);
  } else {
    console.log(`PASSED: ${message}`);
  }
}

console.log("Running cleanJson tests...");

assertEqual(
  cleanJson('{"foo": "bar"}'),
  '{"foo": "bar"}',
  "Should handle plain JSON"
);

assertEqual(
  cleanJson('```json\n{"foo": "bar"}\n```'),
  '{"foo": "bar"}',
  "Should handle triple backticks with json tag and newlines"
);

assertEqual(
  cleanJson('```\n{"foo": "bar"}\n```'),
  '{"foo": "bar"}',
  "Should handle triple backticks without tag"
);

assertEqual(
  cleanJson('```json{"foo": "bar"}```'),
  '{"foo": "bar"}',
  "Should handle triple backticks with json tag but no newlines"
);

console.log("All cleanJson tests passed!");
