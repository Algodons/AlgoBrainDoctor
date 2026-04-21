import { BaseWorker } from './base/Worker.js';
import { Job } from '@algobrain/shared';

/**
 * BackfillWorker - Reprocesses historical repository and identity data
 */
export class BackfillWorker extends BaseWorker {
  protected async processJob(job: Job): Promise<void> {
    const { from, to } = job.payload as { from?: string; to?: string };

    this.logger.info('Backfilling historical data range', {
      jobId: job.id,
      from: from ?? 'beginning',
      to: to ?? 'latest',
    });

    await this.sleep(90);
  }
}
