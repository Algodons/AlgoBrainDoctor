// Healdec types
export type FailureType = 'transient' | 'crash' | 'data_error' | 'partial_success' | 'critical';
export type HealingStrategy = 'retry' | 'restart' | 'quarantine' | 'rollback' | 'escalate';
export type HealingStatus = 'pending' | 'in_progress' | 'succeeded' | 'failed';

export interface HealingAttempt {
  id: string;
  job_id: string;
  failure_type: FailureType;
  strategy: HealingStrategy;
  status: HealingStatus;
  attempts: number;
  started_at: Date;
  completed_at?: Date;
  details?: Record<string, unknown>;
  error?: string;
}

export interface FailureClassification {
  type: FailureType;
  confidence: number; // 0-1
  recommended_strategy: HealingStrategy;
  reasoning: string;
}
