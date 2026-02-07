// Utility: Retry helpers
export interface RetryOptions {
  maxAttempts: number;
  backoffMs: number[];
  onRetry?: (attempt: number, error: Error) => void;
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < options.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt < options.maxAttempts - 1) {
        const delay = options.backoffMs[Math.min(attempt, options.backoffMs.length - 1)];
        options.onRetry?.(attempt + 1, lastError);
        await sleep(delay);
      }
    }
  }

  throw lastError || new Error('Retry failed');
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Exponential backoff calculator
export function calculateBackoff(attempt: number, baseMs: number = 1000): number {
  return Math.min(baseMs * Math.pow(2, attempt), 30000); // Max 30 seconds
}
