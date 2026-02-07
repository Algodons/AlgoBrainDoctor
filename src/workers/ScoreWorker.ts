import { BaseWorker } from './base/Worker.js';
import { Job, RepositoryHealth } from '@algobrain/shared';

/**
 * ScoreWorker - Computes repository health scores (0-100)
 * Status: Finalizing from 50% complete
 */
export class ScoreWorker extends BaseWorker {
  /**
   * Process a health score computation job
   */
  protected async processJob(job: Job): Promise<void> {
    const { repoId } = job.payload as { repoId: string };

    this.logger.info('Computing health score', { repoId });

    try {
      // Fetch repository data
      const repoData = await this.fetchRepositoryData(repoId);
      
      // Compute health score with breakdown
      const health = await this.computeHealthScore(repoId, repoData);
      
      this.logger.info('Computed health score', { 
        repoId, 
        score: health.score,
        breakdown: health.breakdown 
      });

      // Store health score
      await this.storeHealthScore(health);

      // Create health event
      await this.createHealthEvent(repoId, health);

      this.logger.info('Successfully scored repository', { 
        repoId, 
        score: health.score 
      });
    } catch (error) {
      this.logger.error('Failed to compute health score', { repoId, error });
      throw error;
    }
  }

  /**
   * Fetch repository data needed for scoring
   */
  private async fetchRepositoryData(repoId: string): Promise<any> {
    // Simulate data fetch
    await this.sleep(100);

    // In a real implementation:
    // const repo = await db.repositories.findById(repoId);
    // const files = await fetchRepositoryFiles(repo);
    // const commits = await fetchRecentCommits(repo);
    // const issues = await fetchIssues(repo);
    // const prs = await fetchPullRequests(repo);
    // return { repo, files, commits, issues, prs };

    // Mock data
    return {
      hasReadme: true,
      hasLicense: true,
      hasContributing: false,
      hasTests: true,
      hasCI: true,
      recentCommits: 15,
      openIssues: 5,
      openPRs: 2,
      hasSecurityPolicy: false,
      hasDependabot: true,
      codeOwners: true,
    };
  }

  /**
   * Compute health score with detailed breakdown
   */
  private async computeHealthScore(
    repoId: string, 
    data: any
  ): Promise<RepositoryHealth> {
    // Compute individual component scores (0-100)
    const documentation = this.scoreDocumentation(data);
    const testing = this.scoreTesting(data);
    const security = this.scoreSecurity(data);
    const maintenance = this.scoreMaintenance(data);
    const community = this.scoreCommunity(data);

    // Weighted average for overall score
    const weights = {
      documentation: 0.20,
      testing: 0.25,
      security: 0.25,
      maintenance: 0.20,
      community: 0.10,
    };

    const score = Math.round(
      documentation * weights.documentation +
      testing * weights.testing +
      security * weights.security +
      maintenance * weights.maintenance +
      community * weights.community
    );

    return {
      repo_id: repoId,
      score,
      breakdown: {
        documentation,
        testing,
        security,
        maintenance,
        community,
      },
      computed_at: new Date(),
      frameworks_detected: this.detectFrameworks(data),
    };
  }

  /**
   * Score documentation quality (README, wikis, docs folder, etc.)
   */
  private scoreDocumentation(data: any): number {
    let score = 0;
    
    if (data.hasReadme) score += 40;
    if (data.hasLicense) score += 20;
    if (data.hasContributing) score += 20;
    if (data.hasCodeOfConduct) score += 10;
    if (data.hasWiki) score += 10;

    return Math.min(score, 100);
  }

  /**
   * Score testing coverage and practices
   */
  private scoreTesting(data: any): number {
    let score = 0;
    
    if (data.hasTests) score += 50;
    if (data.hasCI) score += 30;
    if (data.testCoverage > 80) score += 20;
    else if (data.testCoverage > 50) score += 10;

    return Math.min(score, 100);
  }

  /**
   * Score security practices
   */
  private scoreSecurity(data: any): number {
    let score = 0;
    
    if (data.hasSecurityPolicy) score += 30;
    if (data.hasDependabot) score += 25;
    if (data.hasCodeScanning) score += 25;
    if (data.hasSecretScanning) score += 20;

    return Math.min(score, 100);
  }

  /**
   * Score maintenance activity
   */
  private scoreMaintenance(data: any): number {
    let score = 0;
    
    // Recent activity
    if (data.recentCommits > 10) score += 30;
    else if (data.recentCommits > 5) score += 20;
    else if (data.recentCommits > 0) score += 10;

    // Issue management
    if (data.openIssues < 5) score += 20;
    else if (data.openIssues < 20) score += 10;

    // PR management
    if (data.openPRs < 3) score += 20;
    else if (data.openPRs < 10) score += 10;

    // Code owners
    if (data.codeOwners) score += 30;

    return Math.min(score, 100);
  }

  /**
   * Score community health
   */
  private scoreCommunity(data: any): number {
    let score = 0;
    
    if (data.hasContributing) score += 25;
    if (data.hasCodeOfConduct) score += 25;
    if (data.hasIssueTemplates) score += 25;
    if (data.hasPRTemplates) score += 25;

    return Math.min(score, 100);
  }

  /**
   * Detect frameworks and technologies used
   */
  private detectFrameworks(data: any): string[] {
    const frameworks: string[] = [];

    // In a real implementation, would analyze package files, imports, etc.
    // For now, return mock data
    frameworks.push('TypeScript', 'React', 'Node.js');

    return frameworks;
  }

  /**
   * Store computed health score
   */
  private async storeHealthScore(health: RepositoryHealth): Promise<void> {
    // Simulate database write
    await this.sleep(50);

    // In a real implementation:
    // await db.repositoryHealth.insert(health);
    
    this.logger.debug('Stored health score', { 
      repoId: health.repo_id, 
      score: health.score 
    });
  }

  /**
   * Create a health event for the timeline
   */
  private async createHealthEvent(
    repoId: string, 
    health: RepositoryHealth
  ): Promise<void> {
    // Simulate database write
    await this.sleep(30);

    // In a real implementation:
    // await db.events.insert({
    //   type: 'scan',
    //   severity: health.score < 50 ? 'warning' : 'info',
    //   repo_id: repoId,
    //   message: `Health score computed: ${health.score}/100`,
    //   details: { health },
    //   created_at: new Date(),
    // });
    
    this.logger.debug('Created health event', { repoId });
  }
}
