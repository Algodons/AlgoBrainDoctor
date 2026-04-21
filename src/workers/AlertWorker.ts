import { BaseWorker } from './base/Worker.js';
import { Job } from '@algobrain/shared';

/**
 * AlertWorker - Dispatches system and healing alerts to operators
 */
export class AlertWorker extends BaseWorker {
  protected async processJob(job: Job): Promise<void> {
    const { channel = 'on-call', severity = 'warning' } = job.payload as {
      channel?: string;
      severity?: string;
    };

    this.logger.warn('Dispatching operator alert', {
      jobId: job.id,
      channel,
      severity,
    });

    await this.sleep(30);
  }
}
