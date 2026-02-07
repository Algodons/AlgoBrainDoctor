import {
  Job,
  FailureType,
  FailureClassification,
  HealingAttempt,
  HealingStatus,
  createLogger,
  Logger,
  HealdecError
} from '@algobrain/shared';
import { IHealingStrategy, RetryStrategy, RestartStrategy } from './strategies/index.js';

/**
 * Healdec Auto-Healing Engine
 * Detects failures and applies appropriate recovery strategies
 */
export class HealdecEngine {
  private logger: Logger;
  private strategies: Map<string, IHealingStrategy>;

  constructor() {
    this.logger = createLogger('HealdecEngine');
    this.strategies = new Map();

    // Register default strategies
    this.registerStrategy(new RetryStrategy());
    this.registerStrategy(new RestartStrategy());
  }

  /**
   * Register a healing strategy
   */
  registerStrategy(strategy: IHealingStrategy): void {
    this.strategies.set(strategy.name, strategy);
    this.logger.info('Registered healing strategy', { 
      strategy: strategy.name 
    });
  }

  /**
   * Classify a job failure and recommend healing strategy
   */
  classifyFailure(job: Job, error: Error): FailureClassification {
    this.logger.info('Classifying failure', { 
      jobId: job.id, 
      error: error.message 
    });

    // Analyze error to determine failure type
    let failureType: FailureType;
    let confidence: number;
    let reasoning: string;

    // Check for transient failures (network, timeouts, rate limits)
    if (this.isTransientError(error)) {
      failureType = 'transient';
      confidence = 0.9;
      reasoning = 'Error indicates a temporary issue (network, timeout, or rate limit)';
    }
    // Check for worker crashes
    else if (this.isCrashError(error)) {
      failureType = 'crash';
      confidence = 0.85;
      reasoning = 'Worker process crashed or became unresponsive';
    }
    // Check for data errors
    else if (this.isDataError(error)) {
      failureType = 'data_error';
      confidence = 0.8;
      reasoning = 'Invalid or corrupted data caused the failure';
    }
    // Check for partial success
    else if (this.isPartialSuccess(error)) {
      failureType = 'partial_success';
      confidence = 0.75;
      reasoning = 'Operation partially succeeded but needs rollback';
    }
    // Default to critical
    else {
      failureType = 'critical';
      confidence = 0.7;
      reasoning = 'Unknown error type - requires manual intervention';
    }

    // Recommend healing strategy based on failure type
    const recommendedStrategy = this.recommendStrategy(failureType);

    return {
      type: failureType,
      confidence,
      recommended_strategy: recommendedStrategy,
      reasoning,
    };
  }

  /**
   * Heal a failed job using the appropriate strategy
   */
  async heal(
    job: Job, 
    classification: FailureClassification
  ): Promise<HealingAttempt> {
    this.logger.info('Attempting to heal job', { 
      jobId: job.id, 
      strategy: classification.recommended_strategy 
    });

    const attempt: HealingAttempt = {
      id: `heal-${job.id}-${Date.now()}`,
      job_id: job.id,
      failure_type: classification.type,
      strategy: classification.recommended_strategy,
      status: 'in_progress',
      attempts: job.attempts,
      started_at: new Date(),
    };

    try {
      const strategy = this.strategies.get(classification.recommended_strategy);
      
      if (!strategy) {
        throw new HealdecError(
          `Strategy not found: ${classification.recommended_strategy}`
        );
      }

      // Execute the healing strategy
      const success = await strategy.execute(job, attempt);

      attempt.status = success ? 'succeeded' : 'failed';
      attempt.completed_at = new Date();

      if (success) {
        this.logger.info('Successfully healed job', { 
          jobId: job.id, 
          strategy: classification.recommended_strategy 
        });
      } else {
        this.logger.warn('Healing attempt failed', { 
          jobId: job.id, 
          strategy: classification.recommended_strategy 
        });
      }

      // Log the healing attempt
      await this.logHealingAttempt(attempt);

      return attempt;

    } catch (error) {
      attempt.status = 'failed';
      attempt.completed_at = new Date();
      attempt.error = error instanceof Error ? error.message : String(error);

      this.logger.error('Healing attempt threw error', { 
        jobId: job.id, 
        error 
      });

      await this.logHealingAttempt(attempt);
      throw error;
    }
  }

  /**
   * Determine if error is transient
   */
  private isTransientError(error: Error): boolean {
    const transientPatterns = [
      /timeout/i,
      /network/i,
      /ECONNRESET/i,
      /ETIMEDOUT/i,
      /rate limit/i,
      /503/,
      /502/,
      /429/,
    ];

    return transientPatterns.some(pattern => pattern.test(error.message));
  }

  /**
   * Determine if error is a worker crash
   */
  private isCrashError(error: Error): boolean {
    const crashPatterns = [
      /worker.*crashed/i,
      /process.*terminated/i,
      /SIGTERM/i,
      /SIGKILL/i,
      /exit code/i,
    ];

    return crashPatterns.some(pattern => pattern.test(error.message));
  }

  /**
   * Determine if error is data-related
   */
  private isDataError(error: Error): boolean {
    const dataPatterns = [
      /validation/i,
      /invalid data/i,
      /parse error/i,
      /malformed/i,
      /corrupt/i,
    ];

    return dataPatterns.some(pattern => pattern.test(error.message));
  }

  /**
   * Determine if operation partially succeeded
   */
  private isPartialSuccess(error: Error): boolean {
    const partialPatterns = [
      /partial/i,
      /incomplete/i,
      /rollback/i,
    ];

    return partialPatterns.some(pattern => pattern.test(error.message));
  }

  /**
   * Recommend healing strategy based on failure type
   */
  private recommendStrategy(failureType: FailureType): any {
    const strategyMap: Record<FailureType, any> = {
      transient: 'retry',
      crash: 'restart',
      data_error: 'quarantine',
      partial_success: 'rollback',
      critical: 'escalate',
    };

    return strategyMap[failureType] || 'escalate';
  }

  /**
   * Log healing attempt to database
   */
  private async logHealingAttempt(attempt: HealingAttempt): Promise<void> {
    // In a real implementation:
    // await db.healingAttempts.insert(attempt);

    this.logger.debug('Logged healing attempt', { 
      id: attempt.id, 
      status: attempt.status 
    });
  }

  /**
   * Get registered strategies
   */
  getStrategies(): string[] {
    return Array.from(this.strategies.keys());
  }
}
