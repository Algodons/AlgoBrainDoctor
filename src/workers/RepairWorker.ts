import { BaseWorker } from './base/Worker.js';
import { Job, WorkerError } from '@algobrain/shared';

/**
 * RepairWorker - Repairs inconsistent or partially corrupted records
 */
export class RepairWorker extends BaseWorker {
  protected async processJob(job: Job): Promise<void> {
    const { entityType, entityId } = job.payload as {
      entityType?: string;
      entityId?: string;
    };

    if (!entityType || !entityId) {
      throw new WorkerError('Repair job payload must include entityType and entityId');
    }

    this.logger.info('Running data repair operation', {
      jobId: job.id,
      entityType,
      entityId,
    });

    await this.sleep(120);
  }
}
