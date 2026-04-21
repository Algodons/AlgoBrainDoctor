import { Job, HealingAttempt, FailureType, HealingStrategy, createLogger, Logger } from '@algobrain/shared';
import { IHealingStrategy } from './retry.js';

/**
 * Quarantine Strategy - Isolates jobs with data-quality failures
 */
export class QuarantineStrategy implements IHealingStrategy {
  name: HealingStrategy = 'quarantine';
  private logger: Logger;

  constructor(private quarantineTtlMs: number = 24 * 60 * 60 * 1000) {
    this.logger = createLogger('QuarantineStrategy');
  }

  canHandle(failureType: FailureType): boolean {
    return failureType === 'data_error';
  }

  async execute(job: Job, attempt: HealingAttempt): Promise<boolean> {
    this.logger.warn('Quarantining job due to data error', {
      jobId: job.id,
      jobType: job.type,
      workerId: job.worker_id,
    });

    try {
      const quarantinedAt = new Date();
      const releaseAt = new Date(quarantinedAt.getTime() + this.quarantineTtlMs);

      attempt.details = {
        ...(attempt.details ?? {}),
        quarantine: {
          quarantined_at: quarantinedAt.toISOString(),
          release_at: releaseAt.toISOString(),
          reason: 'Data validation/corruption error detected',
        },
      };

      // In a real implementation:
      // - Update job status to `quarantined`
      // - Persist quarantine metadata in orchestration store
      // - Prevent further retries until operator action or TTL expiry
      return true;
    } catch (error) {
      this.logger.error('Failed to quarantine job', { jobId: job.id, error });
      return false;
    }
  }
}
