// Job and worker types
export type JobStatus = 'pending' | 'running' | 'completed' | 'failed' | 'quarantined';
export type JobType = 'index' | 'identity' | 'score' | 'ingest' | 'sync' | 'gc' | 'alert' | 'export' | 'audit' | 'repair' | 'backfill' | 'maintenance';

export interface Job {
  id: string;
  type: JobType;
  status: JobStatus;
  payload: Record<string, unknown>;
  worker_id?: string;
  attempts: number;
  max_attempts: number;
  created_at: Date;
  started_at?: Date;
  completed_at?: Date;
  error?: string;
  metadata?: Record<string, unknown>;
}

export interface WorkerStatus {
  id: string;
  type: JobType;
  status: 'idle' | 'busy' | 'crashed' | 'shutdown';
  current_job_id?: string;
  last_heartbeat: Date;
  started_at: Date;
  jobs_completed: number;
  jobs_failed: number;
}

export interface WorkerConfig {
  type: JobType;
  concurrency: number;
  pollInterval: number; // ms
  timeout: number; // ms
  retryBackoff: number[]; // ms array for exponential backoff
}
