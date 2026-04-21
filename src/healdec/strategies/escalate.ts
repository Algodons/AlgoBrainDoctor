import { Job, HealingAttempt, FailureType, HealingStrategy, createLogger, Logger } from '@algobrain/shared';
import { IHealingStrategy } from './retry.js';

/**
 * Escalate Strategy - Alerts operators when automatic healing cannot safely proceed
 */
export class EscalateStrategy implements IHealingStrategy {
  name: HealingStrategy = 'escalate';
  private logger: Logger;

  constructor(private defaultChannel: string = 'on-call') {
    this.logger = createLogger('EscalateStrategy');
  }

  canHandle(failureType: FailureType): boolean {
    return failureType === 'critical';
  }

  async execute(job: Job, attempt: HealingAttempt): Promise<boolean> {
    const channel = this.resolveAlertChannel(job);

    this.logger.error('Escalating critical failure to operators', {
      jobId: job.id,
      jobType: job.type,
      channel,
      attempts: attempt.attempts,
    });

    try {
      // In a real implementation:
      // - Emit structured alert event (PagerDuty/Slack/email)
      // - Attach job context and failure classification details
      // - Create operator ticket for manual intervention
      attempt.details = {
        ...(attempt.details ?? {}),
        escalation: {
          channel,
          escalated_at: new Date().toISOString(),
        },
      };

      return true;
    } catch (error) {
      this.logger.error('Escalation dispatch failed', { jobId: job.id, error });
      return false;
    }
  }

  private resolveAlertChannel(job: Job): string {
    const metadataChannel = job.metadata?.['alert_channel'];
    return typeof metadataChannel === 'string' && metadataChannel.length > 0
      ? metadataChannel
      : this.defaultChannel;
  }
}
