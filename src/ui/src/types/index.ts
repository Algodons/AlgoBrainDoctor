export interface Repository {
  id: string;
  name: string;
  owner: string;
  healthScore: number;
  lastScan?: string;
  status: 'healthy' | 'warning' | 'critical';
  metrics?: {
    issues: number;
    pullRequests: number;
    commits: number;
  };
}

export interface WorkerStatus {
  id: string;
  name: string;
  status: 'active' | 'idle' | 'error';
  lastHeartbeat: string;
  jobsProcessed: number;
  currentJob?: string;
}

export interface SystemVitals {
  cpu: number;
  memory: number;
  activeWorkers: number;
  totalWorkers: number;
  queuedJobs: number;
  processedJobs: number;
}

export interface LogEntry {
  timestamp: string;
  level: 'info' | 'success' | 'warning' | 'error';
  message: string;
  worker?: string;
}
