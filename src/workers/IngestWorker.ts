import { BaseWorker } from './base/Worker.js';
import { Job, WorkerError } from '@algobrain/shared';

/**
 * IngestWorker - Ingests webhook events into the orchestration pipeline
 */
export class IngestWorker extends BaseWorker {
  protected async processJob(job: Job): Promise<void> {
    const { source = 'unknown', eventType = 'unknown' } = job.payload as {
      source?: string;
      eventType?: string;
    };

    if (source === 'unknown') {
      throw new WorkerError('Ingest job payload must include source');
    }

    this.logger.info('Ingesting webhook payload', { jobId: job.id, source, eventType });
    await this.sleep(50);
  }
}
