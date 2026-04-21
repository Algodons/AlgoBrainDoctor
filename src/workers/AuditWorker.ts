import { BaseWorker } from './base/Worker.js';
import { Job } from '@algobrain/shared';

/**
 * AuditWorker - Creates compliance and operational audit entries
 */
export class AuditWorker extends BaseWorker {
  protected async processJob(job: Job): Promise<void> {
    const { scope = 'system' } = job.payload as { scope?: string };

    this.logger.info('Recording audit event', {
      jobId: job.id,
      scope,
    });

    await this.sleep(40);
  }
}
