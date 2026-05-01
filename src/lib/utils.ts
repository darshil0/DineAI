export function cleanJson(str: string): string {
  let cleaned = str.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.substring(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  return cleaned.trim();
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000,
): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (retries <= 0) throw error;

    // Check for 429 Too Many Requests or transient errors (5xx)
    const is429 = error.message?.includes('429') || error.status === 429;
    const isTransient = error.status >= 500 && error.status <= 599;
    const isNetworkError = error.message?.includes('fetch failed') || error.message?.includes('ECONNRESET');

    if (is429 || isTransient || isNetworkError) {
      console.warn(
        `Transient error (${error.status || 'network'}). Retrying in ${delay}ms... (${retries} retries left)`,
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
      return withRetry(fn, retries - 1, delay * 2); // Exponential backoff
    }

    throw error;
  }
}
