import { Repository } from '../../types';

interface RepoCardProps {
  repo: Repository;
  onViewDetails: (repo: Repository) => void;
}

export default function RepoCard({ repo, onViewDetails }: RepoCardProps) {
  const getHealthClass = (score: number) => {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    return 'poor';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'var(--aqua-pulse)';
      case 'warning': return 'var(--cyber-yellow)';
      case 'critical': return 'var(--coral-heat)';
      default: return 'var(--text-secondary)';
    }
  };

  return (
    <div className="card repo-card" onClick={() => onViewDetails(repo)}>
      <div className="repo-header">
        <div className="repo-info">
          <h3 className="repo-name">{repo.owner}/{repo.name}</h3>
          {repo.lastScan && (
            <p className="repo-meta">Last scan: {new Date(repo.lastScan).toLocaleString()}</p>
          )}
        </div>
        <div className={`health-score ${getHealthClass(repo.healthScore)}`}>
          {repo.healthScore}
        </div>
      </div>
      
      <div className="repo-status">
        <div className="status-indicator" style={{ 
          background: getStatusColor(repo.status),
          width: '8px',
          height: '8px',
          borderRadius: '50%'
        }} />
        <span style={{ textTransform: 'capitalize' }}>{repo.status}</span>
      </div>
      
      {repo.metrics && (
        <div className="repo-metrics">
          <div className="metric">
            <span className="metric-label">Issues</span>
            <span className="metric-value">{repo.metrics.issues}</span>
          </div>
          <div className="metric">
            <span className="metric-label">PRs</span>
            <span className="metric-value">{repo.metrics.pullRequests}</span>
          </div>
          <div className="metric">
            <span className="metric-label">Commits</span>
            <span className="metric-value">{repo.metrics.commits}</span>
          </div>
        </div>
      )}
    </div>
  );
}
