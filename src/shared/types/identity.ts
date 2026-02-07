// Developer identity types
export interface Identity {
  id: string;
  github_login?: string;
  email?: string;
  name: string;
  avatar_url?: string;
  bio?: string;
  company?: string;
  location?: string;
  verified: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface IdentityClaim {
  id: string;
  identity_id: string;
  github_login?: string;
  email?: string;
  status: 'pending' | 'verified' | 'rejected';
  proof?: Record<string, unknown>;
  submitted_at: Date;
  resolved_at?: Date;
}
