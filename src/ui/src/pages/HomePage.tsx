import { useState } from 'react';
import Layout from '../components/layout/Layout';
import RepoCard from '../components/cards/RepoCard';
import VitalsModal from '../components/modals/VitalsModal';
import SmartBrainTerminal from '../components/modals/SmartBrainTerminal';
import { Repository } from '../types';

export default function HomePage() {
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);

  const mockRepos: Repository[] = [
    {
      id: '1',
      name: 'react',
      owner: 'facebook',
      healthScore: 92,
      status: 'healthy',
      lastScan: new Date().toISOString(),
      metrics: { issues: 234, pullRequests: 45, commits: 15234 }
    },
    {
      id: '2',
      name: 'typescript',
      owner: 'microsoft',
      healthScore: 88,
      status: 'healthy',
      lastScan: new Date().toISOString(),
      metrics: { issues: 156, pullRequests: 28, commits: 22341 }
    },
    {
      id: '3',
      name: 'vue',
      owner: 'vuejs',
      healthScore: 65,
      status: 'warning',
      lastScan: new Date().toISOString(),
      metrics: { issues: 89, pullRequests: 12, commits: 8934 }
    },
    {
      id: '4',
      name: 'angular',
      owner: 'angular',
      healthScore: 45,
      status: 'critical',
      lastScan: new Date().toISOString(),
      metrics: { issues: 412, pullRequests: 67, commits: 18234 }
    }
  ];

  const stats = {
    totalRepos: mockRepos.length,
    healthy: mockRepos.filter(r => r.status === 'healthy').length,
    warning: mockRepos.filter(r => r.status === 'warning').length,
    critical: mockRepos.filter(r => r.status === 'critical').length,
    avgHealth: Math.round(mockRepos.reduce((sum, r) => sum + r.healthScore, 0) / mockRepos.length)
  };

  return (
    <Layout>
      <div className="home-page">
        <div className="page-header">
          <h1>Repository Dashboard</h1>
          <button className="btn btn-primary">+ Add Repository</button>
        </div>

        <div className="stats-grid">
          <div className="stat-card glow-violet">
            <div className="stat-label">Total Repositories</div>
            <div className="stat-value">{stats.totalRepos}</div>
          </div>
          <div className="stat-card glow-aqua">
            <div className="stat-label">Healthy</div>
            <div className="stat-value" style={{ color: 'var(--aqua-pulse)' }}>{stats.healthy}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Warning</div>
            <div className="stat-value" style={{ color: 'var(--cyber-yellow)' }}>{stats.warning}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Critical</div>
            <div className="stat-value" style={{ color: 'var(--coral-heat)' }}>{stats.critical}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Avg Health Score</div>
            <div className="stat-value">{stats.avgHealth}</div>
          </div>
        </div>

        <div className="repos-section">
          <h2>Monitored Repositories</h2>
          <div className="repos-grid">
            {mockRepos.map(repo => (
              <RepoCard 
                key={repo.id} 
                repo={repo} 
                onViewDetails={setSelectedRepo}
              />
            ))}
          </div>
        </div>

        <div className="terminal-section">
          <SmartBrainTerminal />
        </div>

        {selectedRepo && (
          <VitalsModal 
            repo={selectedRepo} 
            onClose={() => setSelectedRepo(null)}
          />
        )}
      </div>
    </Layout>
  );
}
