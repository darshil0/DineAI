export function cleanJson(str: string): string {
  let cleaned = str.trim();
  // Remove markdown code blocks if present. Extracts the first block found.
  const match = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (match) {
    return match[1].trim();
  }
  return cleaned;
}

/**
 * Executes a function with exponential backoff retry logic.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelay: number = 500,
): Promise<T> {
  let attempts = 0;
  while (attempts < maxAttempts) {
    try {
      return await fn();
    } catch (error: any) {
      attempts++;
      if (attempts >= maxAttempts) throw error;

      // Check if it's a rate limit error (429) or other transient error
      const isRateLimit =
        error.status === 429 ||
        error.message?.includes("429") ||
        error.message?.includes("Too Many Requests");

      const delay = Math.pow(2, attempts) * (isRateLimit ? baseDelay * 2 : baseDelay);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error("Retry failed");
}
