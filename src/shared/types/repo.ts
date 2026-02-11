// Base types for repositories
export interface Repository {
  id: string;
  name: string;
  full_name: string;
  owner: string;
  description?: string;
  url: string;
  default_branch: string;
  created_at: Date;
  updated_at: Date;
  pushed_at?: Date;
  size: number;
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  open_issues_count: number;
  language?: string;
  topics: string[];
  archived: boolean;
  disabled: boolean;
  visibility: 'public' | 'private' | 'internal';
}

export interface RepositoryHealth {
  repo_id: string;
  score: number; // 0-100
  breakdown: {
    documentation: number;
    testing: number;
    security: number;
    maintenance: number;
    community: number;
  };
  computed_at: Date;
  frameworks_detected: string[];
}
