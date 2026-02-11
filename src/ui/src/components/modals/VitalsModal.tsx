import { Repository } from '../../types';

interface VitalsModalProps {
  repo: Repository;
  onClose: () => void;
}

export default function VitalsModal({ repo, onClose }: VitalsModalProps) {
  const mockVitals = {
    codeQuality: 85,
    testCoverage: 72,
    documentation: 68,
    security: 91,
    performance: 78,
    maintainability: 82
  };

  const mockIssues = [
    { severity: 'warning', message: 'Test coverage below 80%', file: 'src/workers/clone.ts' },
    { severity: 'info', message: 'Documentation could be improved', file: 'README.md' },
    { severity: 'success', message: 'Security scan passed', file: 'All files' }
  ];

  const getVitalColor = (score: number) => {
    if (score >= 80) return 'var(--aqua-pulse)';
    if (score >= 60) return 'var(--cyber-yellow)';
    return 'var(--coral-heat)';
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal vitals-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Repository Health Dashboard</h2>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>
        
        <div className="modal-body">
          <div className="repo-info-section">
            <h3>{repo.owner}/{repo.name}</h3>
            <div className={`health-score ${repo.healthScore >= 80 ? 'excellent' : repo.healthScore >= 60 ? 'good' : 'poor'}`}>
              Overall Score: {repo.healthScore}
            </div>
          </div>

          <div className="vitals-grid">
            {Object.entries(mockVitals).map(([key, value]) => (
              <div key={key} className="vital-card">
                <div className="vital-label">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                <div className="vital-score" style={{ color: getVitalColor(value) }}>
                  {value}%
                </div>
                <div className="vital-bar">
                  <div 
                    className="vital-bar-fill" 
                    style={{ 
                      width: `${value}%`,
                      background: getVitalColor(value)
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="issues-section">
            <h3>Recent Findings</h3>
            <div className="issues-list">
              {mockIssues.map((issue, idx) => (
                <div key={idx} className={`issue-item ${issue.severity}`}>
                  <span className="issue-icon">
                    {issue.severity === 'warning' ? '⚠️' : issue.severity === 'success' ? '✅' : 'ℹ️'}
                  </span>
                  <div className="issue-content">
                    <div className="issue-message">{issue.message}</div>
                    <div className="issue-file">{issue.file}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="btn" onClick={onClose}>Close</button>
          <button className="btn btn-primary">Run Full Scan</button>
        </div>
      </div>
    </div>
  );
}
