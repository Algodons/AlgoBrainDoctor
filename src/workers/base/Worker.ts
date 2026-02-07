import { Job, JobStatus, JobType, WorkerConfig, createLogger, Logger, WorkerError } from '@algobrain/shared';

export abstract class BaseWorker {
  protected logger: Logger;
  protected isRunning: boolean = false;
  protected currentJob: Job | null = null;

  constructor(
    protected config: WorkerConfig
  ) {
    this.logger = createLogger(`${config.type}Worker`);
  }

  /**
   * Abstract method that each worker must implement to process a job
   */
  protected abstract processJob(job: Job): Promise<void>;

  /**
   * Start the worker
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      throw new WorkerError('Worker is already running');
    }

    this.isRunning = true;
    this.logger.info('Worker started', { type: this.config.type });
    
    // Start the main work loop
    this.runLoop().catch(error => {
      this.logger.error('Worker loop crashed', error);
      this.isRunning = false;
    });
  }

  /**
   * Stop the worker
   */
  async stop(): Promise<void> {
    this.logger.info('Stopping worker', { type: this.config.type });
    this.isRunning = false;

    // Wait for current job to complete
    if (this.currentJob) {
      this.logger.info('Waiting for current job to complete', { jobId: this.currentJob.id });
      // In a real implementation, we'd wait with a timeout
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    this.logger.info('Worker stopped', { type: this.config.type });
  }

  /**
   * Main work loop - polls for jobs and processes them
   */
  private async runLoop(): Promise<void> {
    while (this.isRunning) {
      try {
        // In a real implementation, this would poll from a job queue
        // For now, we'll just simulate the loop
        await this.sleep(this.config.pollInterval);

        // Placeholder for job polling
        // const job = await this.pollForJob();
        // if (job) {
        //   await this.executeJob(job);
        // }
      } catch (error) {
        this.logger.error('Error in work loop', error);
        await this.sleep(1000); // Brief pause before retrying
      }
    }
  }

  /**
   * Execute a job with timeout and error handling
   */
  async executeJob(job: Job): Promise<void> {
    this.currentJob = job;
    const startTime = Date.now();

    try {
      this.logger.info('Starting job', { jobId: job.id, type: job.type });

      // Set a timeout for job execution
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Job timeout')), this.config.timeout);
      });

      // Race between job execution and timeout
      await Promise.race([
        this.processJob(job),
        timeoutPromise
      ]);

      const duration = Date.now() - startTime;
      this.logger.info('Job completed', { 
        jobId: job.id, 
        durationMs: duration 
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error('Job failed', { 
        jobId: job.id, 
        error, 
        durationMs: duration 
      });
      throw error;
    } finally {
      this.currentJob = null;
    }
  }

  /**
   * Get worker status
   */
  getStatus() {
    return {
      type: this.config.type,
      isRunning: this.isRunning,
      currentJobId: this.currentJob?.id,
    };
  }

  protected sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
