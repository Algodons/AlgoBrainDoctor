import { LogEntry } from '../../types';
import { useState, useEffect } from 'react';

interface SmartBrainTerminalProps {
  logs?: LogEntry[];
  maxLines?: number;
}

export default function SmartBrainTerminal({ logs = [], maxLines = 100 }: SmartBrainTerminalProps) {
  const [terminalLogs, setTerminalLogs] = useState<LogEntry[]>(logs);

  useEffect(() => {
    const mockLogs: LogEntry[] = [
      { timestamp: new Date().toISOString(), level: 'info', message: '🧠 AlgoBrainDoctor System Online', worker: 'orchestrator' },
      { timestamp: new Date().toISOString(), level: 'success', message: '✓ Database connection established', worker: 'orchestrator' },
      { timestamp: new Date().toISOString(), level: 'info', message: '⚙️  Starting 12 parallel workers...', worker: 'orchestrator' },
      { timestamp: new Date().toISOString(), level: 'success', message: '✓ Clone Worker ready', worker: 'clone-worker' },
      { timestamp: new Date().toISOString(), level: 'success', message: '✓ Commit Worker ready', worker: 'commit-worker' },
      { timestamp: new Date().toISOString(), level: 'success', message: '✓ Identity Worker ready', worker: 'identity-worker' },
      { timestamp: new Date().toISOString(), level: 'info', message: '📊 Processing job queue...', worker: 'orchestrator' },
      { timestamp: new Date().toISOString(), level: 'success', message: '✓ Cloned repository: user/repo', worker: 'clone-worker' },
      { timestamp: new Date().toISOString(), level: 'warning', message: '⚠️  High memory usage detected: 78%', worker: 'monitor' },
      { timestamp: new Date().toISOString(), level: 'info', message: '🔍 Scanning commits...', worker: 'commit-worker' },
      ...logs
    ];
    
    setTerminalLogs(mockLogs.slice(-maxLines));
  }, [logs, maxLines]);

  const formatTimestamp = (ts: string) => {
    const date = new Date(ts);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
  };

  return (
    <div className="terminal-container">
      <div className="terminal-header">
        <div className="terminal-title">
          <span className="terminal-icon">⚡</span>
          SmartBrain Terminal
        </div>
        <div className="terminal-controls">
          <span className="terminal-dot" style={{ background: 'var(--aqua-pulse)' }}></span>
          <span className="terminal-dot" style={{ background: 'var(--cyber-yellow)' }}></span>
          <span className="terminal-dot" style={{ background: 'var(--coral-heat)' }}></span>
        </div>
      </div>
      <div className="terminal">
        {terminalLogs.map((log, idx) => (
          <div key={idx} className={`terminal-line ${log.level}`}>
            <span className="terminal-time">[{formatTimestamp(log.timestamp)}]</span>
            {log.worker && <span className="terminal-worker">[{log.worker}]</span>}
            <span className="terminal-message">{log.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
