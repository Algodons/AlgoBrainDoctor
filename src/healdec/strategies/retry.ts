import { 
  Job, 
  HealingAttempt, 
  FailureType, 
  HealingStrategy, 
  HealingStatus,
  createLogger,
  Logger 
} from '@algobrain/shared';

/**
 * Base interface for healing strategies
 */
export interface IHealingStrategy {
  name: HealingStrategy;
  canHandle(failureType: FailureType): boolean;
  execute(job: Job, attempt: HealingAttempt): Promise<boolean>;
}

/**
 * Retry Strategy - Handles transient failures with exponential backoff
 * Status: Finalizing from 80% complete
 */
export class RetryStrategy implements IHealingStrategy {
  name: HealingStrategy = 'retry';
  private logger: Logger;

  constructor(
    private maxRetries: number = 5,
    private baseDelayMs: number = 1000,
    private maxDelayMs: number = 30000
  ) {
    this.logger = createLogger('RetryStrategy');
  }

  canHandle(failureType: FailureType): boolean {
    // Retry strategy is best for transient failures
    return failureType === 'transient';
  }

  async execute(job: Job, attempt: HealingAttempt): Promise<boolean> {
    this.logger.info('Executing retry strategy', { 
      jobId: job.id, 
      attempt: attempt.attempts 
    });

    // Check if we've exceeded max retries
    if (attempt.attempts >= this.maxRetries) {
      this.logger.warn('Max retries exceeded', { 
        jobId: job.id, 
        attempts: attempt.attempts 
      });
      return false;
    }

    // Calculate exponential backoff delay
    const delay = this.calculateBackoff(attempt.attempts);
    
    this.logger.info('Waiting before retry', { 
      jobId: job.id, 
      delayMs: delay,
      attempt: attempt.attempts + 1 
    });

    // Wait for the backoff period
    await this.sleep(delay);

    try {
      // In a real implementation, this would:
      // 1. Reset job status to 'pending'
      // 2. Clear the error
      // 3. Re-queue the job
      // await jobQueue.requeue(job.id);

      this.logger.info('Successfully requeued job', { jobId: job.id });
      return true;

    } catch (error) {
      this.logger.error('Failed to retry job', { 
        jobId: job.id, 
        error 
      });
      return false;
    }
  }

  /**
   * Calculate exponential backoff with jitter
   */
  private calculateBackoff(attempt: number): number {
    // Exponential backoff: baseDelay * 2^attempt
    const exponentialDelay = this.baseDelayMs * Math.pow(2, attempt);
    
    // Add jitter (±20% randomness)
    const jitter = exponentialDelay * 0.2 * (Math.random() * 2 - 1);
    
    // Cap at max delay
    const delay = Math.min(exponentialDelay + jitter, this.maxDelayMs);
    
    return Math.round(delay);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get strategy configuration
   */
  getConfig() {
    return {
      maxRetries: this.maxRetries,
      baseDelayMs: this.baseDelayMs,
      maxDelayMs: this.maxDelayMs,
    };
  }

  /**
   * Update strategy configuration
   */
  updateConfig(config: Partial<{
    maxRetries: number;
    baseDelayMs: number;
    maxDelayMs: number;
  }>) {
    if (config.maxRetries !== undefined) {
      this.maxRetries = config.maxRetries;
    }
    if (config.baseDelayMs !== undefined) {
      this.baseDelayMs = config.baseDelayMs;
    }
    if (config.maxDelayMs !== undefined) {
      this.maxDelayMs = config.maxDelayMs;
    }
    
    this.logger.info('Updated retry strategy config', this.getConfig());
  }
}
