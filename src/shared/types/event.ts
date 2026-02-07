// Event and timeline types
export type EventType = 'scan' | 'governance' | 'healing' | 'identity' | 'alert';
export type EventSeverity = 'info' | 'warning' | 'error' | 'critical';

export interface Event {
  id: string;
  type: EventType;
  severity: EventSeverity;
  repo_id?: string;
  identity_id?: string;
  message: string;
  details?: Record<string, unknown>;
  created_at: Date;
}

export interface HealthEvent extends Event {
  type: 'scan' | 'governance' | 'healing';
  score_delta?: number;
  affected_components?: string[];
}
