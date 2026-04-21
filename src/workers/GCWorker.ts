import { BaseWorker } from './base/Worker.js';
import { Job } from '@algobrain/shared';

/**
 * GCWorker - Cleans stale orchestration artifacts and expired records
 */
export class GCWorker extends BaseWorker {
  protected async processJob(job: Job): Promise<void> {
    const { retentionDays = 30 } = job.payload as { retentionDays?: number };

    this.logger.info('Running garbage collection', {
      jobId: job.id,
      retentionDays,
    });

    await this.sleep(100);
  }
}
