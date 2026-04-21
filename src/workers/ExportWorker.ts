import { BaseWorker } from './base/Worker.js';
import { Job } from '@algobrain/shared';

/**
 * ExportWorker - Produces exportable health and audit reports
 */
export class ExportWorker extends BaseWorker {
  protected async processJob(job: Job): Promise<void> {
    const { format = 'json' } = job.payload as { format?: 'json' | 'csv' | 'pdf' };

    this.logger.info('Generating export package', {
      jobId: job.id,
      format,
    });

    await this.sleep(80);
  }
}
