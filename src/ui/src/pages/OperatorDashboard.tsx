import Layout from '../components/layout/Layout';
import SmartBrainTerminal from '../components/modals/SmartBrainTerminal';
import { WorkerStatus, SystemVitals } from '../types';

export default function OperatorDashboard() {
  const systemVitals: SystemVitals = {
    cpu: 45,
    memory: 62,
    activeWorkers: 10,
    totalWorkers: 12,
    queuedJobs: 23,
    processedJobs: 1547
  };

  const workers: WorkerStatus[] = [
    { id: '1', name: 'Clone Worker', status: 'active', lastHeartbeat: new Date().toISOString(), jobsProcessed: 234, currentJob: 'Cloning facebook/react' },
    { id: '2', name: 'Commit Worker', status: 'active', lastHeartbeat: new Date().toISOString(), jobsProcessed: 456, currentJob: 'Scanning commits' },
    { id: '3', name: 'Identity Worker', status: 'idle', lastHeartbeat: new Date().toISOString(), jobsProcessed: 123 },
    { id: '4', name: 'Log Processor', status: 'active', lastHeartbeat: new Date().toISOString(), jobsProcessed: 789, currentJob: 'Processing logs' },
    { id: '5', name: 'Health Calculator', status: 'active', lastHeartbeat: new Date().toISOString(), jobsProcessed: 345, currentJob: 'Computing health scores' },
    { id: '6', name: 'Alert Dispatcher', status: 'idle', lastHeartbeat: new Date().toISOString(), jobsProcessed: 67 },
    { id: '7', name: 'Cache Manager', status: 'active', lastHeartbeat: new Date().toISOString(), jobsProcessed: 890, currentJob: 'Cache cleanup' },
    { id: '8', name: 'Metrics Collector', status: 'active', lastHeartbeat: new Date().toISOString(), jobsProcessed: 234, currentJob: 'Collecting metrics' },
    { id: '9', name: 'Report Generator', status: 'idle', lastHeartbeat: new Date().toISOString(), jobsProcessed: 156 },
    { id: '10', name: 'Backup Service', status: 'active', lastHeartbeat: new Date().toISOString(), jobsProcessed: 45, currentJob: 'Running backup' },
    { id: '11', name: 'Archive Worker', status: 'active', lastHeartbeat: new Date().toISOString(), jobsProcessed: 278, currentJob: 'Archiving old data' },
    { id: '12', name: 'Cleanup Worker', status: 'error', lastHeartbeat: new Date(Date.now() - 300000).toISOString(), jobsProcessed: 89 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'var(--aqua-pulse)';
      case 'idle': return 'var(--cyber-yellow)';
      case 'error': return 'var(--coral-heat)';
      default: return 'var(--text-secondary)';
    }
  };

  const getVitalColor = (value: number, max: number) => {
    const percentage = (value / max) * 100;
    if (percentage < 60) return 'var(--aqua-pulse)';
    if (percentage < 80) return 'var(--cyber-yellow)';
    return 'var(--coral-heat)';
  };

  return (
    <Layout>
      <div className="operator-dashboard">
        <div className="page-header">
          <h1>Operator Dashboard</h1>
          <div className="header-actions">
            <button className="btn">Refresh</button>
            <button className="btn btn-primary">Emergency Stop</button>
          </div>
        </div>

        <div className="vitals-overview">
          <div className="vital-card large glow-violet">
            <div className="vital-icon">⚡</div>
            <div className="vital-content">
              <div className="vital-label">System Status</div>
              <div className="vital-value" style={{ color: 'var(--aqua-pulse)' }}>Operational</div>
            </div>
          </div>

          <div className="vital-card large">
            <div className="vital-icon">💻</div>
            <div className="vital-content">
              <div className="vital-label">CPU Usage</div>
              <div className="vital-value" style={{ color: getVitalColor(systemVitals.cpu, 100) }}>
                {systemVitals.cpu}%
              </div>
            </div>
          </div>

          <div className="vital-card large">
            <div className="vital-icon">🧠</div>
            <div className="vital-content">
              <div className="vital-label">Memory Usage</div>
              <div className="vital-value" style={{ color: getVitalColor(systemVitals.memory, 100) }}>
                {systemVitals.memory}%
              </div>
            </div>
          </div>

          <div className="vital-card large glow-aqua">
            <div className="vital-icon">⚙️</div>
            <div className="vital-content">
              <div className="vital-label">Active Workers</div>
              <div className="vital-value">
                {systemVitals.activeWorkers}/{systemVitals.totalWorkers}
              </div>
            </div>
          </div>

          <div className="vital-card large">
            <div className="vital-icon">📊</div>
            <div className="vital-content">
              <div className="vital-label">Queued Jobs</div>
              <div className="vital-value">{systemVitals.queuedJobs}</div>
            </div>
          </div>

          <div className="vital-card large">
            <div className="vital-icon">✅</div>
            <div className="vital-content">
              <div className="vital-label">Processed Jobs</div>
              <div className="vital-value">{systemVitals.processedJobs}</div>
            </div>
          </div>
        </div>

        <div className="workers-section">
          <h2>Worker Status</h2>
          <div className="workers-grid">
            {workers.map(worker => (
              <div key={worker.id} className="worker-card card">
                <div className="worker-header">
                  <div className="worker-name">{worker.name}</div>
                  <div 
                    className="worker-status-badge" 
                    style={{ 
                      background: `${getStatusColor(worker.status)}20`,
                      color: getStatusColor(worker.status),
                      border: `1px solid ${getStatusColor(worker.status)}`
                    }}
                  >
                    {worker.status}
                  </div>
                </div>
                
                <div className="worker-stats">
                  <div className="worker-stat">
                    <span className="stat-label">Jobs Processed</span>
                    <span className="stat-value">{worker.jobsProcessed}</span>
                  </div>
                  <div className="worker-stat">
                    <span className="stat-label">Last Heartbeat</span>
                    <span className="stat-value">
                      {Math.round((Date.now() - new Date(worker.lastHeartbeat).getTime()) / 1000)}s ago
                    </span>
                  </div>
                </div>

                {worker.currentJob && (
                  <div className="worker-current-job">
                    <span className="job-icon">🔄</span>
                    <span className="job-text">{worker.currentJob}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="terminal-section">
          <h2>System Logs</h2>
          <SmartBrainTerminal maxLines={150} />
        </div>
      </div>
    </Layout>
  );
}
