import { Job, HealingAttempt, FailureType, HealingStrategy, createLogger, Logger } from '@algobrain/shared';
import { IHealingStrategy } from './retry.js';

/**
 * Rollback Strategy - Applies compensating action for partially completed operations
 */
export class RollbackStrategy implements IHealingStrategy {
  name: HealingStrategy = 'rollback';
  private logger: Logger;

  constructor(private rollbackTimeoutMs: number = 30_000) {
    this.logger = createLogger('RollbackStrategy');
  }

  canHandle(failureType: FailureType): boolean {
    return failureType === 'partial_success';
  }

  async execute(job: Job, attempt: HealingAttempt): Promise<boolean> {
    this.logger.warn('Executing rollback strategy', {
      jobId: job.id,
      jobType: job.type,
      timeoutMs: this.rollbackTimeoutMs,
    });

    try {
      // In a real implementation:
      // - Read idempotency key / transaction markers from job metadata
      // - Execute compensating operations in reverse order
      // - Persist rollback audit trail
      await this.sleep(Math.min(this.rollbackTimeoutMs, 500));

      attempt.details = {
        ...(attempt.details ?? {}),
        rollback: {
          applied_at: new Date().toISOString(),
          status: 'compensated',
        },
      };

      return true;
    } catch (error) {
      this.logger.error('Rollback failed', { jobId: job.id, error });
      return false;
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
