import { BaseWorker } from './base/Worker.js';
import { Job } from '@algobrain/shared';

/**
 * MaintenanceWorker - Runs scheduled maintenance and optimization tasks
 */
export class MaintenanceWorker extends BaseWorker {
  protected async processJob(job: Job): Promise<void> {
    const { task = 'optimize_db' } = job.payload as { task?: string };

    this.logger.info('Running maintenance task', {
      jobId: job.id,
      task,
    });

    await this.sleep(150);
  }
}
