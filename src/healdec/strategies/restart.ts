import { 
  Job, 
  HealingAttempt, 
  FailureType, 
  HealingStrategy, 
  createLogger,
  Logger 
} from '@algobrain/shared';
import { IHealingStrategy } from './retry.js';

/**
 * Restart Strategy - Handles worker crashes by restarting the worker
 * Status: Finalizing from 40% complete
 */
export class RestartStrategy implements IHealingStrategy {
  name: HealingStrategy = 'restart';
  private logger: Logger;

  constructor(
    private maxRestarts: number = 3,
    private restartCooldownMs: number = 5000,
    private gracefulShutdownTimeoutMs: number = 10000
  ) {
    this.logger = createLogger('RestartStrategy');
  }

  canHandle(failureType: FailureType): boolean {
    // Restart strategy is best for worker crashes
    return failureType === 'crash';
  }

  async execute(job: Job, attempt: HealingAttempt): Promise<boolean> {
    this.logger.info('Executing restart strategy', { 
      jobId: job.id, 
      workerId: job.worker_id,
      attempt: attempt.attempts 
    });

    // Check if we've exceeded max restarts
    if (attempt.attempts >= this.maxRestarts) {
      this.logger.warn('Max restarts exceeded', { 
        jobId: job.id, 
        workerId: job.worker_id,
        attempts: attempt.attempts 
      });
      return false;
    }

    if (!job.worker_id) {
      this.logger.error('Cannot restart: no worker ID associated with job', { 
        jobId: job.id 
      });
      return false;
    }

    try {
      // Step 1: Attempt graceful shutdown of crashed worker
      const shutdownSuccess = await this.gracefulShutdown(job.worker_id);
      
      if (!shutdownSuccess) {
        // Force kill if graceful shutdown fails
        await this.forceKill(job.worker_id);
      }

      // Step 2: Wait for cooldown period
      this.logger.info('Waiting for restart cooldown', { 
        workerId: job.worker_id, 
        cooldownMs: this.restartCooldownMs 
      });
      await this.sleep(this.restartCooldownMs);

      // Step 3: Start new worker instance
      await this.startWorker(job.worker_id, job.type);

      // Step 4: Reassign job to new worker instance
      await this.reassignJob(job);

      this.logger.info('Successfully restarted worker and reassigned job', { 
        jobId: job.id, 
        workerId: job.worker_id 
      });
      
      return true;

    } catch (error) {
      this.logger.error('Failed to restart worker', { 
        jobId: job.id, 
        workerId: job.worker_id,
        error 
      });
      return false;
    }
  }

  /**
   * Attempt graceful shutdown of worker
   */
  private async gracefulShutdown(workerId: string): Promise<boolean> {
    this.logger.info('Attempting graceful worker shutdown', { workerId });

    try {
      // In a real implementation, would:
      // 1. Send SIGTERM to worker process
      // 2. Wait for worker to finish current job
      // 3. Close connections gracefully
      // await workerManager.shutdown(workerId, this.gracefulShutdownTimeoutMs);

      // Simulate shutdown
      await this.sleep(500);
      
      this.logger.info('Worker shutdown completed', { workerId });
      return true;

    } catch (error) {
      this.logger.warn('Graceful shutdown failed', { 
        workerId, 
        error 
      });
      return false;
    }
  }

  /**
   * Force kill worker process
   */
  private async forceKill(workerId: string): Promise<void> {
    this.logger.warn('Force killing worker', { workerId });

    // In a real implementation:
    // await workerManager.kill(workerId);

    // Simulate force kill
    await this.sleep(100);
    
    this.logger.info('Worker forcefully terminated', { workerId });
  }

  /**
   * Start a new worker instance
   */
  private async startWorker(workerId: string, jobType: string): Promise<void> {
    this.logger.info('Starting new worker instance', { 
      workerId, 
      jobType 
    });

    // In a real implementation:
    // await workerManager.start({
    //   id: workerId,
    //   type: jobType,
    //   config: workerConfigs[jobType]
    // });

    // Simulate worker startup
    await this.sleep(1000);
    
    this.logger.info('Worker started successfully', { 
      workerId, 
      jobType 
    });
  }

  /**
   * Reassign job to the restarted worker
   */
  private async reassignJob(job: Job): Promise<void> {
    this.logger.info('Reassigning job to restarted worker', { 
      jobId: job.id, 
      workerId: job.worker_id 
    });

    // In a real implementation:
    // await db.jobs.update(job.id, {
    //   status: 'pending',
    //   error: null,
    //   started_at: null
    // });

    // Simulate database update
    await this.sleep(50);
    
    this.logger.info('Job reassigned successfully', { jobId: job.id });
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get strategy configuration
   */
  getConfig() {
    return {
      maxRestarts: this.maxRestarts,
      restartCooldownMs: this.restartCooldownMs,
      gracefulShutdownTimeoutMs: this.gracefulShutdownTimeoutMs,
    };
  }

  /**
   * Update strategy configuration
   */
  updateConfig(config: Partial<{
    maxRestarts: number;
    restartCooldownMs: number;
    gracefulShutdownTimeoutMs: number;
  }>) {
    if (config.maxRestarts !== undefined) {
      this.maxRestarts = config.maxRestarts;
    }
    if (config.restartCooldownMs !== undefined) {
      this.restartCooldownMs = config.restartCooldownMs;
    }
    if (config.gracefulShutdownTimeoutMs !== undefined) {
      this.gracefulShutdownTimeoutMs = config.gracefulShutdownTimeoutMs;
    }
    
    this.logger.info('Updated restart strategy config', this.getConfig());
  }
}
