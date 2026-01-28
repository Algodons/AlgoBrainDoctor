# Brain-Doctor Hospital V4 — Operator Handbook

> **Production Operations Guide**  
> **Version:** 4.0  
> **Last Updated:** 2026-01-28

This handbook provides step-by-step runbooks for deploying, monitoring, healing, scaling, troubleshooting, and maintaining Brain-Doctor Hospital V4 in production.

---

## Table of Contents

1. [Deployment Runbook](#1-deployment-runbook)
2. [Monitoring & Observability](#2-monitoring--observability)
3. [Healing & Recovery](#3-healing--recovery)
4. [Scaling](#4-scaling)
5. [Troubleshooting](#5-troubleshooting)
6. [Maintenance](#6-maintenance)

---

## 1. Deployment Runbook

### 1.1 Prerequisites

Before deploying Brain-Doctor Hospital V4, ensure the following requirements are met:

#### Infrastructure
- ✅ **AWS Account** with admin access
- ✅ **Terraform** 1.6+ installed locally
- ✅ **Docker** 24+ for building container images
- ✅ **AWS CLI** 2.0+ configured with credentials
- ✅ **kubectl** 1.28+ (if using Kubernetes)

#### Services
- ✅ **PostgreSQL 15+** (RDS Aurora Serverless recommended)
- ✅ **Redis 7+** (ElastiCache recommended)
- ✅ **S3 Buckets** for frontend static files and exports
- ✅ **CloudFront** distribution (optional, for CDN)
- ✅ **Application Load Balancer** for API traffic

#### Secrets
- ✅ **GitHub Personal Access Token** with `repo` and `org:read` scopes
- ✅ **GitHub Webhook Secret** (generate with `openssl rand -hex 32`)
- ✅ **JWT Secret** (generate with `openssl rand -base64 64`)
- ✅ **Datadog API Key** (if using Datadog for monitoring)
- ✅ **PagerDuty Integration Key** (if using PagerDuty for alerts)

#### Local Tools
- ✅ **Node.js 20+** and **pnpm 8+**
- ✅ **psql** client for database operations
- ✅ **redis-cli** for cache operations

---

### 1.2 Environment Setup

#### Step 1: Clone Repository

```bash
git clone https://github.com/Algodons/AlgoBrainDoctor.git
cd AlgoBrainDoctor
```

#### Step 2: Configure Environment Variables

Create a `.env.production` file:

```bash
# Database
DATABASE_URL=postgresql://user:pass@algobrain-prod.cluster-xxx.us-east-1.rds.amazonaws.com:5432/algobrain
DATABASE_POOL_SIZE=20
DATABASE_SSL=true

# Redis
REDIS_URL=rediss://algobrain-prod.xxx.cache.amazonaws.com:6379
REDIS_PASSWORD=<from-secrets-manager>
REDIS_TLS=true

# GitHub
GITHUB_TOKEN=<from-secrets-manager>
GITHUB_WEBHOOK_SECRET=<from-secrets-manager>

# Orchestrator
ORCHESTRATOR_POLL_INTERVAL_MS=5000
ORCHESTRATOR_MAX_CONCURRENT_JOBS=100
HEALDEC_ENABLED=true

# Workers (concurrency settings)
WORKER_CONCURRENCY_INDEX=5
WORKER_CONCURRENCY_IDENTITY=10
WORKER_CONCURRENCY_SCORE=8
WORKER_CONCURRENCY_INGEST=20
WORKER_CONCURRENCY_SYNC=5
WORKER_CONCURRENCY_GC=1
WORKER_CONCURRENCY_ALERT=3
WORKER_CONCURRENCY_EXPORT=2
WORKER_CONCURRENCY_AUDIT=5
WORKER_CONCURRENCY_REPAIR=1
WORKER_CONCURRENCY_BACKFILL=3
WORKER_CONCURRENCY_MAINTENANCE=1

# API
JWT_SECRET=<from-secrets-manager>
API_RATE_LIMIT_PER_MINUTE=100
API_CORS_ORIGINS=https://dashboard.algobrain.doctor,https://admin.algobrain.doctor

# Observability
DATADOG_API_KEY=<from-secrets-manager>
LOG_LEVEL=info
SENTRY_DSN=<from-secrets-manager>

# AWS
AWS_REGION=us-east-1
S3_EXPORTS_BUCKET=algobrain-exports
```

#### Step 3: Store Secrets in AWS Secrets Manager

```bash
# GitHub Token
aws secretsmanager create-secret \
  --name algobrain/prod/github-token \
  --secret-string "ghp_xxxxxxxxxxxx"

# JWT Secret
aws secretsmanager create-secret \
  --name algobrain/prod/jwt-secret \
  --secret-string "$(openssl rand -base64 64)"

# Webhook Secret
aws secretsmanager create-secret \
  --name algobrain/prod/webhook-secret \
  --secret-string "$(openssl rand -hex 32)"

# Database Password
aws secretsmanager create-secret \
  --name algobrain/prod/db-password \
  --secret-string "$(openssl rand -base64 32)"

# Redis Password
aws secretsmanager create-secret \
  --name algobrain/prod/redis-password \
  --secret-string "$(openssl rand -base64 32)"
```

---

### 1.3 Database Migrations

#### Step 1: Connect to Production Database

```bash
export DATABASE_URL="postgresql://admin:<password>@algobrain-prod.cluster-xxx.us-east-1.rds.amazonaws.com:5432/algobrain"

# Test connection
psql $DATABASE_URL -c "SELECT version();"
```

#### Step 2: Run Migrations

```bash
# Dry run (check what will be applied)
./scripts/db/migrate.sh --dry-run

# Apply migrations
./scripts/db/migrate.sh

# Verify migrations
psql $DATABASE_URL -c "SELECT * FROM migrations ORDER BY id DESC LIMIT 5;"
```

**Expected Output:**
```
 id |             name             |        applied_at
----+-----------------------------+---------------------------
  5 | 005_add_audit_indexes       | 2026-01-28 09:00:00
  4 | 004_add_indexes             | 2026-01-28 08:50:00
  3 | 003_add_workers_table       | 2026-01-28 08:45:00
  2 | 002_add_healdec_log         | 2026-01-28 08:40:00
  1 | 001_initial_schema          | 2026-01-28 08:30:00
```

#### Step 3: Backup Database (Before Going Live)

```bash
./scripts/db/backup.sh production
```

---

### 1.4 Service Startup

#### Option A: Docker Compose (Simple Setup)

```bash
# Build images
docker-compose -f infra/docker/docker-compose.prod.yml build

# Start all services
docker-compose -f infra/docker/docker-compose.prod.yml up -d

# Check logs
docker-compose -f infra/docker/docker-compose.prod.yml logs -f
```

#### Option B: AWS ECS (Recommended for Production)

##### 1. Build and Push Docker Images

```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Build and push API
./scripts/deploy/build-api.sh
docker tag algobrain-api:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/algobrain-api:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/algobrain-api:latest

# Build and push Orchestrator
./scripts/deploy/build-orchestrator.sh
docker tag algobrain-orchestrator:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/algobrain-orchestrator:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/algobrain-orchestrator:latest

# Build and push Workers
./scripts/deploy/build-workers.sh
docker tag algobrain-workers:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/algobrain-workers:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/algobrain-workers:latest
```

##### 2. Deploy ECS Services

```bash
# Deploy API (auto-scaling: 2-10 tasks)
aws ecs update-service \
  --cluster algobrain-prod \
  --service api \
  --force-new-deployment \
  --desired-count 2

# Deploy Orchestrator (singleton: 1 task)
aws ecs update-service \
  --cluster algobrain-prod \
  --service orchestrator \
  --force-new-deployment \
  --desired-count 1

# Deploy Workers (auto-scaling: 12-120 tasks)
aws ecs update-service \
  --cluster algobrain-prod \
  --service workers \
  --force-new-deployment \
  --desired-count 12
```

##### 3. Deploy Frontend to S3 + CloudFront

```bash
# Build frontend
cd src/ui
pnpm build

# Upload to S3
aws s3 sync dist/ s3://algobrain-frontend-prod/ --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id E1234ABCDEF \
  --paths "/*"
```

---

### 1.5 Health Checks and Smoke Tests

#### API Health Check

```bash
curl -i https://api.algobrain.doctor/health
```

**Expected Response:**
```
HTTP/2 200
content-type: application/json

{
  "status": "healthy",
  "timestamp": "2026-01-28T09:00:00Z",
  "services": {
    "database": "up",
    "redis": "up",
    "orchestrator": "up",
    "workers": 12
  }
}
```

#### Orchestrator Heartbeat

```bash
aws dynamodb get-item \
  --table-name algobrain-heartbeats \
  --key '{"service": {"S": "orchestrator"}}'
```

**Expected Output:** `last_heartbeat` within last 60 seconds.

#### Worker Status

```bash
aws ecs list-tasks \
  --cluster algobrain-prod \
  --service workers
```

**Expected:** At least 12 running tasks.

#### Smoke Test: Create Test Job

```bash
# Create test index job
curl -X POST https://api.algobrain.doctor/api/v1/jobs \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "job_type": "index",
    "payload": {
      "org_id": "test-org-123",
      "org_name": "test-org"
    }
  }'
```

**Expected:** Job created and processed within 30 seconds. Check logs:

```bash
aws logs tail /ecs/algobrain-workers --follow
```

#### UI Accessibility

```bash
curl -I https://dashboard.algobrain.doctor
```

**Expected:** `HTTP/2 200` with `content-type: text/html`.

---

## 2. Monitoring & Observability

### 2.1 Key Metrics to Track

#### System-Level Metrics

| Metric | Target | Alert Threshold | Priority |
|--------|--------|-----------------|----------|
| **Worker Success Rate** | >99% | <95% for 5 min | Critical |
| **Healdec Action Rate** | <5% of jobs | >15% for 10 min | High |
| **API Latency (p95)** | <500ms | >1000ms for 5 min | High |
| **Database Connections** | <80% pool | >90% pool | Critical |
| **Redis Hit Rate** | >90% | <70% | Medium |
| **Queue Depth** | <100 pending | >1000 pending | High |
| **API Error Rate** | <1% | >5% for 5 min | Critical |
| **Disk Usage** | <80% | >90% | High |
| **Memory Usage** | <80% | >90% | High |

#### Worker-Specific Metrics

| Worker | Throughput Target | Error Rate Target |
|--------|-------------------|-------------------|
| IndexWorker | 10 repos/min | <1% |
| IdentityWorker | 5 repos/min | <2% |
| ScoreWorker | 10 repos/min | <1% |
| IngestWorker | 100 events/min | <0.5% |
| SyncWorker | 20 repos/min | <2% |
| GCWorker | 1000 rows/min | <1% |
| AlertWorker | 10 alerts/min | <0.1% |

---

### 2.2 Log Aggregation Setup

#### CloudWatch Logs Configuration

```bash
# Create log groups
aws logs create-log-group --log-group-name /ecs/algobrain-api
aws logs create-log-group --log-group-name /ecs/algobrain-orchestrator
aws logs create-log-group --log-group-name /ecs/algobrain-workers

# Set retention (30 days)
aws logs put-retention-policy \
  --log-group-name /ecs/algobrain-api \
  --retention-in-days 30
```

#### Query Logs with CloudWatch Insights

```bash
# Find all errors in last hour
fields @timestamp, @message
| filter @message like /ERROR/
| sort @timestamp desc
| limit 100

# Worker failures by type
fields job_type, error
| filter level = "error" and worker_id != ""
| stats count() by job_type
| sort count desc

# Healdec recovery actions
fields strategy, success, job_id
| filter message like /healdec/
| stats count() by strategy, success
```

#### Stream Logs to Datadog (Optional)

```bash
# Install Datadog Lambda forwarder
aws cloudformation create-stack \
  --stack-name datadog-log-forwarder \
  --template-url https://datadog-cloudformation-template.s3.amazonaws.com/aws/forwarder/latest.yaml \
  --parameters ParameterKey=DdApiKey,ParameterValue=<your-api-key>

# Subscribe log groups to forwarder
aws logs put-subscription-filter \
  --log-group-name /ecs/algobrain-api \
  --filter-name datadog \
  --filter-pattern "" \
  --destination-arn arn:aws:lambda:us-east-1:123456789012:function:datadog-forwarder
```

---

### 2.3 Alerting Thresholds

#### Critical Alerts (Page On-Call)

```yaml
# datadog-monitors.yaml
- name: "Worker Success Rate Below 95%"
  type: metric alert
  query: "avg(last_5m):avg:algobrain.worker.success_rate{*} < 0.95"
  message: "@pagerduty-critical Worker success rate dropped below 95%"

- name: "API Error Rate Above 5%"
  type: metric alert
  query: "avg(last_5m):avg:algobrain.api.error_rate{*} > 0.05"
  message: "@pagerduty-critical API error rate above 5%"

- name: "Database Connections Exhausted"
  type: metric alert
  query: "avg(last_1m):avg:algobrain.db.connections{*} / avg:algobrain.db.pool_size{*} > 0.9"
  message: "@pagerduty-critical Database connection pool at 90%"

- name: "Orchestrator Down"
  type: service check
  query: "service_check:algobrain.orchestrator.heartbeat"
  message: "@pagerduty-critical Orchestrator heartbeat missing"
```

#### High Priority Alerts (Notify Slack)

```yaml
- name: "Queue Depth High"
  type: metric alert
  query: "avg(last_10m):avg:algobrain.jobs.pending{*} > 1000"
  message: "@slack-ops Queue depth above 1000 for 10 minutes"

- name: "Healdec Action Rate High"
  type: metric alert
  query: "avg(last_10m):avg:algobrain.healdec.action_rate{*} > 0.15"
  message: "@slack-ops Healdec acting on >15% of jobs"
```

---

### 2.4 Dashboard Walkthroughs

#### Datadog Dashboard JSON

```json
{
  "title": "Brain-Doctor Hospital V4 - Overview",
  "widgets": [
    {
      "definition": {
        "type": "timeseries",
        "title": "Worker Success Rate",
        "requests": [
          {
            "q": "avg:algobrain.worker.success_rate{*} by {worker_type}",
            "display_type": "line"
          }
        ]
      }
    },
    {
      "definition": {
        "type": "query_value",
        "title": "Pending Jobs",
        "requests": [
          {
            "q": "sum:algobrain.jobs.pending{status:pending}",
            "aggregator": "last"
          }
        ]
      }
    },
    {
      "definition": {
        "type": "toplist",
        "title": "Top Failing Workers",
        "requests": [
          {
            "q": "top(avg:algobrain.worker.error_count{*} by {worker_type}, 10, 'sum', 'desc')"
          }
        ]
      }
    }
  ]
}
```

#### Grafana Dashboard (Alternative)

Import dashboard from: `https://grafana.com/grafana/dashboards/algobrain-v4`

**Key Panels:**
- Worker throughput (jobs/minute)
- API latency percentiles (p50, p95, p99)
- Database query time
- Redis hit/miss rate
- Healdec recovery success rate

---

## 3. Healing & Recovery

### 3.1 How to Read Healdec Logs

#### Query Healdec Logs

```sql
SELECT
  id,
  job_id,
  failure_type,
  strategy,
  attempt_number,
  success,
  operator_notified,
  created_at
FROM healdec_log
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC
LIMIT 50;
```

#### Log Interpretation

| Failure Type | Strategy | Action Taken |
|--------------|----------|--------------|
| `transient` | `retry` | Job retried with exponential backoff |
| `crash` | `restart` | Worker restarted, job reassigned |
| `data` | `quarantine` | Job moved to quarantine queue, operator notified |
| `partial` | `rollback` | Compensating transactions executed, job failed |
| `critical` | `escalate` | On-call paged, system entered safe mode |

#### Example Log Entry

```json
{
  "id": "log-123",
  "job_id": "job-456",
  "worker_id": "identity-worker-3",
  "failure_type": "transient",
  "strategy": "retry",
  "attempt_number": 2,
  "success": true,
  "context": {
    "error": "GitHub API rate limit exceeded",
    "backoff_ms": 4000,
    "next_retry_at": "2026-01-28T09:05:00Z"
  },
  "operator_notified": false,
  "created_at": "2026-01-28T09:01:00Z"
}
```

**Interpretation:** Identity worker hit rate limit, Healdec applied retry strategy with 4-second backoff, retry succeeded.

---

### 3.2 Manual Job Reruns

#### Rerun a Failed Job

```bash
# Get job details
psql $DATABASE_URL -c "SELECT * FROM jobs WHERE id = 'job-123';"

# Reset job to pending
psql $DATABASE_URL -c "
  UPDATE jobs
  SET status = 'pending',
      attempts = 0,
      error = NULL,
      scheduled_at = NOW()
  WHERE id = 'job-123';
"
```

**Or via API:**

```bash
curl -X POST https://api.algobrain.doctor/api/v1/jobs/job-123/retry \
  -H "Authorization: Bearer <admin-token>"
```

#### Rerun All Failed Jobs of a Type

```bash
# Reset all failed index jobs
psql $DATABASE_URL -c "
  UPDATE jobs
  SET status = 'pending',
      attempts = 0,
      error = NULL,
      scheduled_at = NOW()
  WHERE job_type = 'index'
    AND status = 'failed'
    AND completed_at > NOW() - INTERVAL '24 hours';
"
```

---

### 3.3 Quarantine Inspection and Resolution

#### List Quarantined Jobs

```sql
SELECT
  id,
  job_type,
  payload,
  error,
  created_at
FROM jobs
WHERE status = 'quarantined'
ORDER BY created_at DESC
LIMIT 20;
```

#### Inspect Individual Job

```bash
# Via CLI
psql $DATABASE_URL -c "SELECT * FROM jobs WHERE id = 'job-789';"

# Via Dashboard
# Navigate to: Jobs > Quarantine Queue > Select Job
```

#### Resolve Quarantine

**Option 1: Fix Data and Retry**

```bash
# Update job payload with corrected data
psql $DATABASE_URL -c "
  UPDATE jobs
  SET payload = jsonb_set(payload, '{repo_id}', '\"correct-repo-id\"'),
      status = 'pending',
      attempts = 0,
      error = NULL
  WHERE id = 'job-789';
"
```

**Option 2: Cancel Invalid Job**

```bash
psql $DATABASE_URL -c "
  UPDATE jobs
  SET status = 'cancelled',
      error = 'Invalid payload - cancelled by operator'
  WHERE id = 'job-789';
"
```

---

### 3.4 RepairWorker Triggers

#### Trigger Identity Merge Repair

```bash
curl -X POST https://api.algobrain.doctor/api/v1/jobs \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "job_type": "repair",
    "payload": {
      "repair_type": "merge_identities",
      "identity_ids": ["id-1", "id-2"],
      "target_identity_id": "id-1"
    }
  }'
```

#### Trigger Orphaned Claims Cleanup

```bash
curl -X POST https://api.algobrain.doctor/api/v1/jobs \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "job_type": "repair",
    "payload": {
      "repair_type": "cleanup_orphaned_claims"
    }
  }'
```

#### Trigger Rebuild Indexes

```bash
curl -X POST https://api.algobrain.doctor/api/v1/jobs \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "job_type": "repair",
    "payload": {
      "repair_type": "rebuild_indexes"
    }
  }'
```

---

## 4. Scaling

### 4.1 Horizontal Scaling for API

#### Check Current API Capacity

```bash
aws ecs describe-services \
  --cluster algobrain-prod \
  --services api \
  --query 'services[0].[desiredCount,runningCount,pendingCount]'
```

#### Scale API Servers Manually

```bash
# Scale to 5 instances
aws ecs update-service \
  --cluster algobrain-prod \
  --service api \
  --desired-count 5
```

#### Configure Auto-Scaling

```bash
# Register auto-scaling target
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --resource-id service/algobrain-prod/api \
  --scalable-dimension ecs:service:DesiredCount \
  --min-capacity 2 \
  --max-capacity 10

# Create CPU-based scaling policy
aws application-autoscaling put-scaling-policy \
  --service-namespace ecs \
  --resource-id service/algobrain-prod/api \
  --scalable-dimension ecs:service:DesiredCount \
  --policy-name api-cpu-scaling \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration '{
    "TargetValue": 70.0,
    "PredefinedMetricSpecification": {
      "PredefinedMetricType": "ECSServiceAverageCPUUtilization"
    },
    "ScaleInCooldown": 300,
    "ScaleOutCooldown": 60
  }'
```

---

### 4.2 Worker Pool Tuning

#### Increase Worker Concurrency (Without Scaling Instances)

```bash
# Update environment variable in ECS task definition
aws ecs register-task-definition \
  --cli-input-json file://task-def-workers-updated.json

# Force redeployment
aws ecs update-service \
  --cluster algobrain-prod \
  --service workers \
  --task-definition algobrain-workers:NEW_VERSION \
  --force-new-deployment
```

**Example `task-def-workers-updated.json`:**
```json
{
  "containerDefinitions": [{
    "environment": [
      {"name": "WORKER_CONCURRENCY_IDENTITY", "value": "15"},
      {"name": "WORKER_CONCURRENCY_SCORE", "value": "12"}
    ]
  }]
}
```

#### Scale Worker Instances Horizontally

```bash
# Scale to 20 worker instances
aws ecs update-service \
  --cluster algobrain-prod \
  --service workers \
  --desired-count 20
```

#### Worker Auto-Scaling Based on Queue Depth

```bash
aws application-autoscaling put-scaling-policy \
  --service-namespace ecs \
  --resource-id service/algobrain-prod/workers \
  --scalable-dimension ecs:service:DesiredCount \
  --policy-name workers-queue-depth-scaling \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration '{
    "TargetValue": 500.0,
    "CustomizedMetricSpecification": {
      "MetricName": "JobQueueDepth",
      "Namespace": "AlgoBrain",
      "Statistic": "Average"
    },
    "ScaleInCooldown": 600,
    "ScaleOutCooldown": 120
  }'
```

---

### 4.3 Database Read Replicas

#### Create Read Replica

```bash
aws rds create-db-cluster-reader \
  --db-cluster-identifier algobrain-prod \
  --db-instance-identifier algobrain-prod-replica-1 \
  --db-instance-class db.r6g.large \
  --engine aurora-postgresql
```

#### Configure Application to Use Replica

Update `.env.production`:

```bash
DATABASE_URL_PRIMARY=postgresql://user:pass@algobrain-prod.cluster-xxx.us-east-1.rds.amazonaws.com:5432/algobrain
DATABASE_URL_REPLICA=postgresql://user:pass@algobrain-prod-replica-1.cluster-ro-xxx.us-east-1.rds.amazonaws.com:5432/algobrain
```

**In code:**
```typescript
// Use primary for writes
const primaryPool = new Pool({ connectionString: process.env.DATABASE_URL_PRIMARY });

// Use replica for reads
const replicaPool = new Pool({ connectionString: process.env.DATABASE_URL_REPLICA });

// Example: Read from replica
const repos = await replicaPool.query('SELECT * FROM repos WHERE archived = false');

// Example: Write to primary
await primaryPool.query('INSERT INTO jobs (job_type, payload) VALUES ($1, $2)', ['index', {}]);
```

---

### 4.4 Cache Optimization

#### Increase Redis Memory

```bash
# Modify cache cluster to larger node type
aws elasticache modify-cache-cluster \
  --cache-cluster-id algobrain-prod \
  --cache-node-type cache.r6g.large \
  --apply-immediately
```

#### Tune Cache TTLs

```typescript
// Short TTL for frequently changing data
await redis.setex('repo:scores:latest', 300, JSON.stringify(scores)); // 5 minutes

// Long TTL for stable data
await redis.setex('repo:metadata', 3600, JSON.stringify(repo)); // 1 hour

// No expiry for configuration
await redis.set('config:worker_concurrency', JSON.stringify(config));
```

#### Add Cache Replicas for Read Scaling

```bash
aws elasticache modify-replication-group \
  --replication-group-id algobrain-prod \
  --num-cache-clusters 3 \
  --apply-immediately
```

---

## 5. Troubleshooting

### 5.1 Common Failure Patterns

#### Pattern 1: Worker Stuck on GitHub Rate Limit

**Symptoms:**
- Workers failing with "rate limit exceeded" errors
- Healdec retry strategy constantly triggered
- Queue depth increasing

**Diagnosis:**
```bash
# Check GitHub rate limit status
curl -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/rate_limit
```

**Resolution:**
```bash
# Option 1: Wait for reset (shown in rate limit response)
# Option 2: Use multiple GitHub tokens (round-robin)
# Option 3: Reduce worker concurrency temporarily

aws ecs update-service \
  --cluster algobrain-prod \
  --service workers \
  --environment-overrides WORKER_CONCURRENCY_INDEX=2,WORKER_CONCURRENCY_IDENTITY=5
```

---

#### Pattern 2: Database Connection Pool Exhausted

**Symptoms:**
- API returning 500 errors
- Workers timing out
- Logs show "connection pool exhausted"

**Diagnosis:**
```sql
SELECT
  count(*) as active_connections,
  max_conn as max_connections
FROM pg_stat_activity, pg_settings
WHERE name = 'max_connections'
GROUP BY max_conn;
```

**Resolution:**
```bash
# Option 1: Increase pool size (temporary)
# Update environment variable and redeploy

# Option 2: Scale down workers temporarily
aws ecs update-service --desired-count 8

# Option 3: Add read replica and redirect read queries
```

---

#### Pattern 3: Orchestrator Not Scheduling Jobs

**Symptoms:**
- Jobs stuck in "pending" status
- Orchestrator logs show no activity
- Heartbeat missing in DynamoDB

**Diagnosis:**
```bash
# Check orchestrator logs
aws logs tail /ecs/algobrain-orchestrator --follow

# Check if orchestrator task is running
aws ecs list-tasks --cluster algobrain-prod --service orchestrator
```

**Resolution:**
```bash
# Restart orchestrator
aws ecs update-service \
  --cluster algobrain-prod \
  --service orchestrator \
  --force-new-deployment
```

---

### 5.2 Worker-Specific Debug Steps

#### IndexWorker Issues

```bash
# Check GitHub API connectivity
curl -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/orgs/test-org/repos

# Test IndexWorker locally
cd src/workers
pnpm dev:index
```

#### IdentityWorker Issues

```bash
# Check git clone access
git clone --depth 1 https://github.com/test-org/test-repo /tmp/test-clone

# Test IdentityWorker with sample repo
curl -X POST http://localhost:3001/api/v1/jobs \
  -H "Content-Type: application/json" \
  -d '{"job_type": "identity", "payload": {"repo_id": "test-repo-123"}}'
```

#### ScoreWorker Issues

```bash
# Query missing scores
psql $DATABASE_URL -c "
  SELECT r.id, r.name, s.score
  FROM repos r
  LEFT JOIN scores s ON s.repo_id = r.id AND s.computed_at > NOW() - INTERVAL '7 days'
  WHERE s.id IS NULL
  LIMIT 10;
"

# Manually trigger score job
curl -X POST https://api.algobrain.doctor/api/v1/jobs \
  -H "Authorization: Bearer <token>" \
  -d '{"job_type": "score", "payload": {"repo_id": "repo-123"}}'
```

---

### 5.3 Database Connection Issues

#### Connection Refused

```bash
# Check security group rules
aws ec2 describe-security-groups --group-ids sg-xxx

# Verify connection from ECS task
aws ecs execute-command \
  --cluster algobrain-prod \
  --task <task-id> \
  --interactive \
  --command "psql $DATABASE_URL -c 'SELECT 1;'"
```

#### Slow Queries

```sql
-- Find slow queries
SELECT
  pid,
  now() - pg_stat_activity.query_start AS duration,
  query
FROM pg_stat_activity
WHERE state = 'active'
  AND now() - pg_stat_activity.query_start > interval '5 seconds'
ORDER BY duration DESC;

-- Kill slow query
SELECT pg_terminate_backend(<pid>);
```

---

### 5.4 Queue Backpressure Handling

#### Check Queue Depth

```sql
SELECT
  job_type,
  COUNT(*) as pending_count
FROM jobs
WHERE status = 'pending'
GROUP BY job_type
ORDER BY pending_count DESC;
```

#### Prioritize Critical Jobs

```sql
-- Boost priority of ingest jobs (real-time webhooks)
UPDATE jobs
SET priority = 10
WHERE job_type = 'ingest' AND status = 'pending';

-- Lower priority of backfill jobs
UPDATE jobs
SET priority = 1
WHERE job_type = 'backfill' AND status = 'pending';
```

#### Temporarily Pause Low-Priority Workers

```bash
# Scale down non-essential workers
aws ecs update-service --service workers --desired-count 8

# Or disable specific worker types via config
# (requires redeployment with updated environment variables)
```

---

## 6. Maintenance

### 6.1 Running Backfills

#### Backfill Historical Scores

```bash
curl -X POST https://api.algobrain.doctor/api/v1/jobs \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "job_type": "backfill",
    "payload": {
      "entity": "scores",
      "start_date": "2025-01-01",
      "end_date": "2026-01-27"
    }
  }'
```

#### Monitor Backfill Progress

```sql
SELECT
  COUNT(*) as total_jobs,
  SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
  SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
  SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed
FROM jobs
WHERE job_type = 'backfill'
  AND created_at > NOW() - INTERVAL '1 day';
```

---

### 6.2 Schema Migrations

#### Run New Migration

```bash
# Create migration file
cat > src/db/migrations/006_add_security_score.sql <<EOF
ALTER TABLE scores ADD COLUMN security_score INTEGER;
CREATE INDEX idx_scores_security ON scores(security_score);
EOF

# Apply migration
./scripts/db/migrate.sh

# Verify
psql $DATABASE_URL -c "\d scores"
```

#### Rollback Migration

```bash
./scripts/db/rollback.sh 006_add_security_score
```

---

### 6.3 Garbage Collection Tuning

#### Adjust GC Retention Policies

```bash
# Update GC worker config
cat > /tmp/gc-config.json <<EOF
{
  "events_retention_days": 90,
  "jobs_retention_days": 180,
  "healdec_logs_retention_days": 365,
  "quarantined_jobs_retention_days": 30
}
EOF

# Update via API
curl -X PATCH https://api.algobrain.doctor/api/v1/config/gc \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d @/tmp/gc-config.json
```

#### Trigger Manual GC

```bash
curl -X POST https://api.algobrain.doctor/api/v1/jobs \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{"job_type": "gc", "payload": {}}'
```

---

### 6.4 Secrets Rotation

#### Rotate GitHub Token

```bash
# Step 1: Generate new token on GitHub
# Step 2: Update Secrets Manager
aws secretsmanager update-secret \
  --secret-id algobrain/prod/github-token \
  --secret-string "ghp_new_token_here"

# Step 3: Restart services (they will fetch new secret on startup)
aws ecs update-service --cluster algobrain-prod --service workers --force-new-deployment
aws ecs update-service --cluster algobrain-prod --service orchestrator --force-new-deployment
```

#### Rotate Database Password

```bash
# Step 1: Change password in RDS
aws rds modify-db-cluster \
  --db-cluster-identifier algobrain-prod \
  --master-user-password "new_secure_password" \
  --apply-immediately

# Step 2: Update Secrets Manager
aws secretsmanager update-secret \
  --secret-id algobrain/prod/db-password \
  --secret-string "new_secure_password"

# Step 3: Restart all services
for service in api orchestrator workers; do
  aws ecs update-service --cluster algobrain-prod --service $service --force-new-deployment
done
```

#### Rotate JWT Secret

```bash
# Generate new secret
NEW_JWT_SECRET=$(openssl rand -base64 64)

# Update Secrets Manager
aws secretsmanager update-secret \
  --secret-id algobrain/prod/jwt-secret \
  --secret-string "$NEW_JWT_SECRET"

# Restart API (will invalidate all existing tokens!)
aws ecs update-service --cluster algobrain-prod --service api --force-new-deployment

# Notify users to re-authenticate
```

---

## Additional Resources

- [ARCHITECTURE.md](../ARCHITECTURE.md) - Full architecture specification
- [MERMEDA.md](../MERMEDA.md) - Mermaid diagram suite
- [REPOSITORY_STRUCTURE.md](./REPOSITORY_STRUCTURE.md) - Folder layout
- [DOCS_SITE_STRUCTURE.md](./DOCS_SITE_STRUCTURE.md) - Documentation site layout

---

## Emergency Contacts

| Role | Name | Slack | Phone | Escalation Level |
|------|------|-------|-------|------------------|
| **On-Call Engineer** | @oncall | #algobrain-oncall | +1-555-0100 | Primary |
| **Tech Lead** | Alice Johnson | @alice | +1-555-0101 | Secondary |
| **Engineering Manager** | Bob Smith | @bob | +1-555-0102 | Escalation |
| **CTO** | Carol Davis | @carol | +1-555-0103 | Final |

---

**Last Updated:** 2026-01-28  
**Maintained By:** AlgoBrainDoctor Core Team  
**License:** MIT
