import { BaseWorker } from './base/Worker.js';
import { Job, WorkerError } from '@algobrain/shared';

/**
 * SyncWorker - Synchronizes repository metadata and state
 */
export class SyncWorker extends BaseWorker {
  protected async processJob(job: Job): Promise<void> {
    const { repoId } = job.payload as { repoId?: string };

    if (!repoId) {
      throw new WorkerError('Sync job payload must include repoId');
    }

    this.logger.info('Syncing repository metadata', { jobId: job.id, repoId });
    await this.sleep(75);
  }
}
