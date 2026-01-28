# Brain-Doctor Hospital V4 — Mermaid Diagram Suite

> **Visual Architecture Reference**  
> **Version:** 4.0  
> **Last Updated:** 2026-01-28

This document contains comprehensive Mermaid diagrams illustrating the Brain-Doctor Hospital V4 architecture, data flows, and operational patterns.

---

## Table of Contents

1. [System Architecture](#1-system-architecture)
2. [Worker Pipeline Flow](#2-worker-pipeline-flow)
3. [Healdec Recovery Flow](#3-healdec-recovery-flow)
4. [Data Flow Diagrams](#4-data-flow-diagrams)
5. [UI Component Hierarchy](#5-ui-component-hierarchy)
6. [Database Schema ERD](#6-database-schema-erd)
7. [Deployment Topology](#7-deployment-topology)
8. [Job State Machine](#8-job-state-machine)
9. [Identity Merge Flow](#9-identity-merge-flow)

---

## 1. System Architecture

### High-Level Component Diagram

```mermaid
graph TB
    subgraph "External Systems"
        GitHub[GitHub API/Webhooks]
        Operators[Operators/Admins]
    end
    
    subgraph "Frontend Layer"
        Dashboard[Operator Dashboard<br/>React + Vite]
        AdminUI[Admin Console<br/>React + Vite]
    end
    
    subgraph "API Layer"
        API[Public API<br/>Express + TypeScript]
        Auth[JWT Auth + Rate Limiting]
    end
    
    subgraph "Orchestration Layer"
        Orchestrator[One-File Orchestrator<br/>Scheduler + Supervisor]
        Healdec[Healdec Auto-Healing Engine<br/>Classifier + Strategies]
    end
    
    subgraph "Worker Pool"
        direction LR
        W1[IndexWorker]
        W2[IdentityWorker]
        W3[ScoreWorker]
        W4[IngestWorker]
        W5[SyncWorker]
        W6[GCWorker]
        W7[AlertWorker]
        W8[ExportWorker]
        W9[AuditWorker]
        W10[RepairWorker]
        W11[BackfillWorker]
        W12[MaintenanceWorker]
    end
    
    subgraph "Data Layer"
        DB[(PostgreSQL<br/>Aurora Serverless)]
        Cache[(Redis<br/>ElastiCache)]
    end
    
    subgraph "Storage"
        S3[S3 Buckets<br/>Reports + Logs]
    end
    
    GitHub -->|Webhooks| API
    Operators --> Dashboard
    Operators --> AdminUI
    Dashboard --> API
    AdminUI --> API
    API --> Auth
    Auth --> DB
    API --> Cache
    
    Orchestrator -->|Monitors| Healdec
    Orchestrator -->|Schedules| W1
    Orchestrator -->|Schedules| W2
    Orchestrator -->|Schedules| W3
    Orchestrator -->|Schedules| W4
    Orchestrator -->|Schedules| W5
    Orchestrator -->|Schedules| W6
    Orchestrator -->|Schedules| W7
    Orchestrator -->|Schedules| W8
    Orchestrator -->|Schedules| W9
    Orchestrator -->|Schedules| W10
    Orchestrator -->|Schedules| W11
    Orchestrator -->|Schedules| W12
    
    Healdec -.->|Recovery| W1
    Healdec -.->|Recovery| W2
    Healdec -.->|Recovery| W3
    
    W1 --> DB
    W2 --> DB
    W3 --> DB
    W4 --> DB
    W5 --> DB
    W6 --> DB
    W7 --> DB
    W8 --> DB
    W9 --> DB
    W10 --> DB
    W11 --> DB
    W12 --> DB
    
    W8 --> S3
    W7 -.->|Alerts| Operators
    
    style Orchestrator fill:#A78BFA,stroke:#333,stroke-width:3px
    style Healdec fill:#F87171,stroke:#333,stroke-width:3px
    style DB fill:#4FD1C5,stroke:#333,stroke-width:2px
    style Cache fill:#FACC15,stroke:#333,stroke-width:2px
```

---

## 2. Worker Pipeline Flow

### Complete Worker Dependency Graph

```mermaid
graph TD
    Start([New Organization Added]) --> IndexWorker
    
    IndexWorker[IndexWorker<br/>Discover Repos] -->|repos created| Fork1{Parallel}
    
    Fork1 -->|for each repo| IdentityWorker[IdentityWorker<br/>Extract Identities]
    Fork1 -->|for each repo| ScoreWorker[ScoreWorker<br/>Compute Score]
    
    IdentityWorker -->|identities + claims| ScoreWorker
    
    subgraph "Real-Time Ingestion"
        Webhook([GitHub Webhook]) --> IngestWorker[IngestWorker<br/>Process Event]
        IngestWorker -->|event stored| Fork2{Trigger}
        Fork2 -->|push event| IdentityWorker
        Fork2 -->|push event| ScoreWorker
    end
    
    subgraph "Periodic Maintenance"
        Cron1([Every 6 Hours]) --> SyncWorker[SyncWorker<br/>Sync Metadata]
        SyncWorker -->|metadata updated| ScoreWorker
        
        Cron2([Nightly 2 AM]) --> GCWorker[GCWorker<br/>Garbage Collection]
        GCWorker -->|old data pruned| DB[(Database)]
        
        Cron3([Weekly Sunday 3 AM]) --> MaintenanceWorker[MaintenanceWorker<br/>Optimize DB]
        MaintenanceWorker -->|indexes rebuilt| DB
    end
    
    subgraph "Observability"
        ScoreWorker -->|score computed| AlertWorker[AlertWorker<br/>Monitor Thresholds]
        AlertWorker -->|alert fired| Notification[/Slack/Email/PagerDuty/]
        
        AnyWorker([Any Worker]) -.->|actions logged| AuditWorker[AuditWorker<br/>Compliance Log]
        AuditWorker --> AuditLog[(Audit Log)]
    end
    
    subgraph "Reporting"
        Schedule1([Weekly/On-Demand]) --> ExportWorker[ExportWorker<br/>Generate Reports]
        ExportWorker --> S3[/S3 Bucket/]
    end
    
    subgraph "Data Integrity"
        Operator([Operator Trigger]) --> RepairWorker[RepairWorker<br/>Fix Inconsistencies]
        RepairWorker -->|data repaired| DB
        
        Migration([Schema Change]) --> BackfillWorker[BackfillWorker<br/>Historical Data]
        BackfillWorker -->|history populated| DB
    end
    
    style IndexWorker fill:#A78BFA
    style IdentityWorker fill:#4FD1C5
    style ScoreWorker fill:#3fb950
    style IngestWorker fill:#F87171
    style AlertWorker fill:#d29922
```

### Individual Worker Input/Output

```mermaid
graph LR
    subgraph "IndexWorker"
        I1[Input: org_id] --> IW[Process:<br/>Query GitHub API] --> I2[Output:<br/>repos table rows]
    end
    
    subgraph "IdentityWorker"
        ID1[Input: repo_id] --> IDW[Process:<br/>Parse git log] --> ID2[Output:<br/>identities + claims]
    end
    
    subgraph "ScoreWorker"
        S1[Input: repo_id] --> SW[Process:<br/>Compute metrics] --> S2[Output:<br/>scores table row]
    end
    
    subgraph "IngestWorker"
        IN1[Input: webhook payload] --> INW[Process:<br/>Validate + store] --> IN2[Output:<br/>events table row]
    end
    
    subgraph "SyncWorker"
        SY1[Input: repo_id] --> SYW[Process:<br/>Fetch GitHub metadata] --> SY2[Output:<br/>updated repos row]
    end
    
    subgraph "GCWorker"
        G1[Input: retention policy] --> GW[Process:<br/>Delete old data] --> G2[Output:<br/>freed disk space]
    end
```

---

## 3. Healdec Recovery Flow

### Failure Classification Decision Tree

```mermaid
graph TD
    A[Job Failed] --> B{Error Type?}
    
    B -->|HTTP 429/503<br/>Timeout<br/>Network Error| C[Transient Failure]
    B -->|Out of Memory<br/>Segfault<br/>Worker Unresponsive| D[Worker Crash]
    B -->|Invalid Data<br/>Constraint Violation<br/>Parsing Error| E[Data Error]
    B -->|DB Write Failed<br/>API Call Succeeded| F[Partial Success]
    B -->|Security Breach<br/>Disk Full<br/>DB Connection Lost| G[Critical Failure]
    
    C --> C1{Attempts < Max?}
    C1 -->|Yes| C2[Retry Strategy]
    C1 -->|No| E
    
    C2 --> C3[Exponential Backoff]
    C3 --> C4{Retry Succeeded?}
    C4 -->|Yes| Success[Mark Job Complete]
    C4 -->|No| C1
    
    D --> D1{Restarts < 3?}
    D1 -->|Yes| D2[Restart Strategy]
    D1 -->|No| G
    
    D2 --> D3[Kill Worker Process]
    D3 --> D4[Spawn New Instance]
    D4 --> D5[Reassign Job]
    D5 --> D6{Job Succeeded?}
    D6 -->|Yes| Success
    D6 -->|No| D1
    
    E --> E1[Quarantine Strategy]
    E1 --> E2[Move to Quarantine Queue]
    E2 --> E3[Mark Needs Human Review]
    E3 --> E4[Notify Operator]
    E4 --> Quarantine[Job Quarantined]
    
    F --> F1[Rollback Strategy]
    F1 --> F2[Undo Side Effects]
    F2 --> F3{Rollback OK?}
    F3 -->|Yes| F4[Mark Job Failed]
    F3 -->|No| G
    
    G --> G1[Escalate Strategy]
    G1 --> G2[Page On-Call]
    G2 --> G3[Capture Diagnostics]
    G3 --> G4[Enter Safe Mode]
    G4 --> Critical[Critical Alert Fired]
    
    style Success fill:#3fb950
    style Quarantine fill:#d29922
    style Critical fill:#f85149
    style C2 fill:#A78BFA
    style D2 fill:#A78BFA
    style E1 fill:#FACC15
    style F1 fill:#4FD1C5
    style G1 fill:#F87171
```

### Recovery Strategy Selection Logic

```mermaid
flowchart TD
    Start([Job Execution Failed]) --> Log[Log Failure to healdec_log]
    Log --> Classify[Classify Failure Type]
    
    Classify --> IsTransient{Is Transient?}
    IsTransient -->|Yes| CheckRetries{Attempts < 5?}
    CheckRetries -->|Yes| Retry[Apply Retry Strategy]
    CheckRetries -->|No| QuarantineBox
    
    IsTransient -->|No| IsCrash{Worker Crash?}
    IsCrash -->|Yes| CheckRestarts{Restarts < 3?}
    CheckRestarts -->|Yes| Restart[Apply Restart Strategy]
    CheckRestarts -->|No| EscalateBox
    
    IsCrash -->|No| IsDataError{Data Error?}
    IsDataError -->|Yes| QuarantineBox[Apply Quarantine Strategy]
    
    IsDataError -->|No| IsPartial{Partial Success?}
    IsPartial -->|Yes| Rollback[Apply Rollback Strategy]
    
    IsPartial -->|No| EscalateBox[Apply Escalate Strategy]
    
    Retry --> Wait[Exponential Backoff]
    Wait --> Execute[Re-execute Job]
    Execute --> CheckResult{Success?}
    CheckResult -->|Yes| Done[Mark Complete]
    CheckResult -->|No| IsTransient
    
    Restart --> Kill[Kill Worker]
    Kill --> Spawn[Spawn New Worker]
    Spawn --> Reassign[Reassign Job]
    Reassign --> CheckResult2{Success?}
    CheckResult2 -->|Yes| Done
    CheckResult2 -->|No| IsCrash
    
    QuarantineBox --> MoveQ[Move to Quarantine Queue]
    MoveQ --> NotifyOp[Notify Operator]
    NotifyOp --> EndQ[End - Needs Review]
    
    Rollback --> Compensate[Run Compensating Transactions]
    Compensate --> Verify{Rollback OK?}
    Verify -->|Yes| FailJob[Mark Job Failed]
    Verify -->|No| EscalateBox
    
    EscalateBox --> Page[Page On-Call Engineer]
    Page --> Snapshot[Capture System Snapshot]
    Snapshot --> SafeMode[Enable Safe Mode]
    SafeMode --> EndCrit[End - Critical Alert]
    
    style Done fill:#3fb950,stroke:#333,stroke-width:2px
    style EndQ fill:#d29922,stroke:#333,stroke-width:2px
    style EndCrit fill:#f85149,stroke:#333,stroke-width:2px
```

---

## 4. Data Flow Diagrams

### 4.1 Repository Onboarding Sequence

```mermaid
sequenceDiagram
    actor Operator
    participant API
    participant Orchestrator
    participant IndexWorker
    participant GitHub
    participant DB
    participant IdentityWorker
    participant ScoreWorker
    
    Operator->>API: POST /api/v1/orgs/{id}/index
    API->>DB: Create job (type: index)
    API-->>Operator: 202 Accepted (job_id)
    
    Orchestrator->>DB: Poll for pending jobs
    DB-->>Orchestrator: job (type: index)
    Orchestrator->>IndexWorker: Assign job
    
    IndexWorker->>GitHub: GET /orgs/{org}/repos
    GitHub-->>IndexWorker: repos list
    
    loop For each repo
        IndexWorker->>DB: INSERT INTO repos
        IndexWorker->>DB: Create job (type: identity)
        IndexWorker->>DB: Create job (type: score)
    end
    
    IndexWorker->>DB: Mark index job complete
    IndexWorker->>DB: INSERT INTO events (repo.discovered)
    
    Orchestrator->>DB: Poll for pending jobs
    DB-->>Orchestrator: job (type: identity)
    Orchestrator->>IdentityWorker: Assign job
    
    IdentityWorker->>GitHub: git clone (shallow)
    GitHub-->>IdentityWorker: repo data
    IdentityWorker->>IdentityWorker: Parse git log
    
    loop For each identity
        IdentityWorker->>DB: INSERT INTO identities (if not exists)
        IdentityWorker->>DB: INSERT INTO identity_claims
    end
    
    IdentityWorker->>DB: Mark identity job complete
    
    Orchestrator->>DB: Poll for pending jobs
    DB-->>Orchestrator: job (type: score)
    Orchestrator->>ScoreWorker: Assign job
    
    ScoreWorker->>GitHub: GET /repos/{owner}/{repo}
    GitHub-->>ScoreWorker: repo metadata
    ScoreWorker->>DB: SELECT identity_claims (for commit activity)
    DB-->>ScoreWorker: claims data
    ScoreWorker->>ScoreWorker: Compute score
    ScoreWorker->>DB: INSERT INTO scores
    ScoreWorker->>DB: Mark score job complete
    
    ScoreWorker->>API: Emit score.computed event
    API->>Operator: WebSocket notification
```

### 4.2 Identity Claim Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Discovered: IdentityWorker finds new commit author
    
    Discovered --> CheckExists: Normalize email
    CheckExists --> ExistingIdentity: Identity exists
    CheckExists --> NewIdentity: Identity not found
    
    NewIdentity --> CreateIdentity: INSERT INTO identities
    CreateIdentity --> CreateClaim
    
    ExistingIdentity --> CheckClaim: Identity found
    CheckClaim --> UpdateClaim: Claim exists
    CheckClaim --> CreateClaim: Claim not found
    
    CreateClaim --> Claimed: INSERT INTO identity_claims
    UpdateClaim --> Claimed: UPDATE commit_count, last_commit_at
    
    Claimed --> DetectDuplicates: Check for similar identities
    DetectDuplicates --> NoDuplicates: No match
    DetectDuplicates --> FoundDuplicates: Similar email/username
    
    NoDuplicates --> Active
    
    FoundDuplicates --> MergeReview: Operator reviews
    MergeReview --> Rejected: Not same person
    MergeReview --> Approved: Confirmed merge
    
    Rejected --> Active
    
    Approved --> MergeIdentities: UPDATE merged_into
    MergeIdentities --> TransferClaims: UPDATE identity_claims
    TransferClaims --> Merged
    
    Active --> [*]
    Merged --> [*]
    
    note right of Merged
        Original identity preserved
        for audit trail, but all
        claims point to merged identity
    end note
```

### 4.3 Auto-Healing Lifecycle

```mermaid
sequenceDiagram
    participant Worker
    participant Job
    participant Healdec
    participant HealdecLog as healdec_log
    participant Operator
    participant Monitor
    
    Worker->>Job: Execute
    Job--xWorker: Failed (exception)
    Worker->>Healdec: Report failure
    
    Healdec->>Healdec: Classify failure type
    Healdec->>HealdecLog: Log classification
    
    alt Transient Failure
        Healdec->>Healdec: Select Retry Strategy
        Healdec->>HealdecLog: Log strategy choice
        Healdec->>Job: Update attempts++
        Healdec->>Worker: Retry with backoff
        
        alt Retry Succeeds
            Worker->>Job: Complete
            Worker->>HealdecLog: Log success
        else Max Retries Exceeded
            Healdec->>Healdec: Escalate to Quarantine
        end
        
    else Worker Crash
        Healdec->>Healdec: Select Restart Strategy
        Healdec->>HealdecLog: Log strategy choice
        Healdec->>Worker: Kill process
        Healdec->>Worker: Spawn new instance
        Healdec->>Job: Reassign
        
        alt Restart Succeeds
            Worker->>Job: Complete
            Worker->>HealdecLog: Log success
        else Max Restarts Exceeded
            Healdec->>Healdec: Escalate to Critical
        end
        
    else Data Error
        Healdec->>Healdec: Select Quarantine Strategy
        Healdec->>HealdecLog: Log strategy choice
        Healdec->>Job: Move to quarantine queue
        Healdec->>Operator: Notify (needs review)
        Operator-->>Healdec: Acknowledge
        
    else Partial Success
        Healdec->>Healdec: Select Rollback Strategy
        Healdec->>HealdecLog: Log strategy choice
        Healdec->>Worker: Execute compensating transaction
        Worker->>Job: Mark failed (after rollback)
        Worker->>HealdecLog: Log rollback complete
        
    else Critical Failure
        Healdec->>Healdec: Select Escalate Strategy
        Healdec->>HealdecLog: Log strategy choice
        Healdec->>Operator: Page on-call
        Healdec->>Monitor: Enable safe mode
        Healdec->>HealdecLog: Log escalation
        Operator-->>Healdec: Acknowledge page
    end
    
    Monitor->>HealdecLog: Query recovery stats
    HealdecLog-->>Monitor: Success rate, strategy effectiveness
```

### 4.4 Webhook Ingestion Flow

```mermaid
flowchart TD
    Start([GitHub Webhook Fired]) --> Receive[API Receives POST]
    Receive --> ValidateSignature{Valid Signature?}
    
    ValidateSignature -->|No| Reject[Return 401 Unauthorized]
    ValidateSignature -->|Yes| ParsePayload[Parse JSON Payload]
    
    ParsePayload --> CreateJob[Create IngestWorker Job]
    CreateJob --> Ack[Return 200 OK within 10s]
    
    Ack --> Orchestrator[Orchestrator Polls]
    Orchestrator --> AssignWorker[Assign to IngestWorker]
    
    AssignWorker --> StoreEvent[Store in events table]
    StoreEvent --> DetermineType{Event Type?}
    
    DetermineType -->|push| TriggerIdentity[Trigger IdentityWorker]
    DetermineType -->|push| TriggerScore[Trigger ScoreWorker]
    DetermineType -->|pull_request| TriggerScore
    DetermineType -->|issues| TriggerScore
    DetermineType -->|star| TriggerScore
    DetermineType -->|fork| TriggerScore
    DetermineType -->|Other| NoAction[Store only, no trigger]
    
    TriggerIdentity --> Complete[Mark Job Complete]
    TriggerScore --> Complete
    NoAction --> Complete
    
    Complete --> End([Done])
    Reject --> End
    
    style Ack fill:#3fb950
    style Reject fill:#f85149
```

---

## 5. UI Component Hierarchy

### Operator Dashboard Component Tree

```mermaid
graph TD
    App[App.tsx] --> Router[React Router]
    
    Router --> HomePage[HomePage]
    Router --> ReposPage[RepositoriesPage]
    Router --> IdentitiesPage[IdentitiesPage]
    Router --> JobsPage[JobsPage]
    Router --> HealdecPage[HealdecPage]
    Router --> LogsPage[LogsPage]
    
    App --> Layout[Layout Component]
    Layout --> TopNav[TopNav]
    Layout --> LeftPanel[LeftPanel]
    Layout --> CenterPanel[CenterPanel]
    Layout --> RightPanel[RightPanel]
    
    LeftPanel --> RepoSwitcher[RepoSwitcher]
    RepoSwitcher --> RepoCard[RepoCard]
    RepoCard --> HealthBar[HealthBar]
    
    CenterPanel --> HomePage
    CenterPanel --> ReposPage
    CenterPanel --> IdentitiesPage
    CenterPanel --> JobsPage
    CenterPanel --> HealdecPage
    CenterPanel --> LogsPage
    
    HomePage --> VitalsModal[VitalsModal]
    HomePage --> ScanBox[ScanBox]
    HomePage --> ActionButtons[ActionButtons]
    
    ReposPage --> RepoTable[RepoTable]
    RepoTable --> RepoCard
    RepoCard --> OpenVitals[Click] -.-> VitalsModal
    
    IdentitiesPage --> IdentityTable[IdentityTable]
    IdentityTable --> IdentityCard[IdentityCard]
    IdentityCard --> MergeAction[Merge Button] -.-> MergeModal[IdentityMergeModal]
    
    JobsPage --> JobQueue[JobQueue]
    JobQueue --> JobCard[JobCard]
    JobCard --> InspectAction[Inspect] -.-> BlackboxModal[BlackboxModal]
    JobCard --> RetryAction[Retry] -.-> ConfirmModal[ConfirmDialog]
    
    HealdecPage --> HealdecDashboard[HealdecDashboard]
    HealdecDashboard --> StrategyChart[StrategyChart]
    HealdecDashboard --> HealdecControls[HealdecControls]
    HealdecControls --> ImmunizerModal[ImmunizerModal]
    
    LogsPage --> SmartBrainTerminal[SmartBrainTerminal]
    SmartBrainTerminal --> LogFilters[LogFilters]
    SmartBrainTerminal --> LogStream[LogStream]
    
    RightPanel --> HealthStream[HealthStream]
    RightPanel --> RecentEvents[RecentEvents]
    
    VitalsModal --> HealthReportModal[HealthReportModal]
    
    ActionButtons --> TriggerWorkflow[Trigger] -.-> ActionWorkflowModal[ActionWorkflowModal]
    
    style App fill:#A78BFA,stroke:#333,stroke-width:3px
    style VitalsModal fill:#4FD1C5,stroke:#333,stroke-width:2px
    style HealthReportModal fill:#4FD1C5,stroke:#333,stroke-width:2px
    style BlackboxModal fill:#0d1117,stroke:#FACC15,stroke-width:2px
    style ImmunizerModal fill:#F87171,stroke:#333,stroke-width:2px
    style SmartBrainTerminal fill:#21262d,stroke:#3fb950,stroke-width:2px
```

### Modal Relationships & Navigation

```mermaid
graph LR
    subgraph "Primary Views"
        Home[Home Dashboard]
        Repos[Repositories]
        Identities[Identities]
        Jobs[Jobs Queue]
        Healdec[Healdec Control]
        Logs[Logs Viewer]
    end
    
    subgraph "Modals - Data Display"
        VitalsModal[VitalsModal<br/>Quick Health View]
        HealthReport[HealthReportModal<br/>Full Diagnostic Report]
        BlackboxModal[BlackboxModal<br/>Job Inspector]
    end
    
    subgraph "Modals - Actions"
        ActionWorkflow[ActionWorkflowModal<br/>Trigger Manual Jobs]
        ImmunizerModal[ImmunizerModal<br/>Healdec Override]
        MergeModal[IdentityMergeModal<br/>Merge Identities]
    end
    
    subgraph "Components"
        RepoCard[RepoCard]
        ScanBox[ScanBox]
        Terminal[SmartBrainTerminal]
    end
    
    Home --> RepoCard
    RepoCard -->|Click| VitalsModal
    VitalsModal -->|View Full Report| HealthReport
    
    Home --> ScanBox
    ScanBox -->|Active Scan| Terminal
    
    Repos --> RepoCard
    
    Home --> ActionWorkflow
    ActionWorkflow -->|Submit| Jobs
    
    Jobs --> BlackboxModal
    BlackboxModal -->|Failed Job| Healdec
    
    Healdec --> ImmunizerModal
    
    Identities --> MergeModal
    MergeModal -->|Confirm| Identities
    
    Logs --> Terminal
    
    style VitalsModal fill:#4FD1C5
    style HealthReport fill:#4FD1C5
    style ActionWorkflow fill:#3fb950
    style ImmunizerModal fill:#F87171
```

---

## 6. Database Schema ERD

### Complete Schema with Relationships

```mermaid
erDiagram
    orgs ||--o{ repos : "owns"
    repos ||--o{ identity_claims : "has"
    repos ||--o{ scores : "scored"
    repos ||--o{ events : "triggers"
    repos ||--o{ jobs : "targets"
    
    identities ||--o{ identity_claims : "claims"
    identities ||--o| identities : "merged_into"
    
    jobs ||--o{ healdec_log : "healed"
    jobs }o--|| workers : "assigned_to"
    
    orgs {
        uuid id PK
        string name
        string slug
        boolean active
        timestamp created_at
        timestamp updated_at
    }
    
    repos {
        uuid id PK
        uuid org_id FK
        string name
        string full_name UK
        text description
        string url
        int stars
        int forks
        boolean archived
        timestamp created_at
        timestamp updated_at
        timestamp last_synced_at
    }
    
    identities {
        uuid id PK
        string email UK
        string name
        string github_username
        string avatar_url
        uuid merged_into FK
        timestamp created_at
        timestamp updated_at
    }
    
    identity_claims {
        uuid id PK
        uuid identity_id FK
        uuid repo_id FK
        int commit_count
        timestamp first_commit_at
        timestamp last_commit_at
        timestamp created_at
    }
    
    scores {
        uuid id PK
        uuid repo_id FK
        int score
        int activity_score
        int documentation_score
        int community_score
        int maintenance_score
        jsonb breakdown
        timestamp computed_at
    }
    
    events {
        uuid id PK
        string event_type
        string entity_type
        uuid entity_id
        jsonb payload
        timestamp created_at
    }
    
    jobs {
        uuid id PK
        string job_type
        string status
        int priority
        jsonb payload
        string worker_id
        int attempts
        int max_attempts
        timestamp scheduled_at
        timestamp started_at
        timestamp completed_at
        text error
        timestamp created_at
    }
    
    healdec_log {
        uuid id PK
        uuid job_id FK
        string worker_id
        string failure_type
        string strategy
        int attempt_number
        boolean success
        jsonb context
        boolean operator_notified
        timestamp created_at
    }
    
    migrations {
        int id PK
        string name UK
        timestamp applied_at
    }
    
    workers {
        string id PK
        string name
        int concurrency
        timestamp last_heartbeat
        string status
        jsonb config
    }
```

### Table Cardinality Summary

```mermaid
graph LR
    subgraph "Core Entities"
        Orgs[orgs<br/>~100 rows]
        Repos[repos<br/>~10K rows]
        Identities[identities<br/>~100K rows]
        Claims[identity_claims<br/>~1M rows]
        Scores[scores<br/>~10M rows<br/>time series]
    end
    
    subgraph "Operational"
        Events[events<br/>~100M rows<br/>append-only]
        Jobs[jobs<br/>~10K active<br/>~100M total]
        Healdec[healdec_log<br/>~1M rows]
    end
    
    subgraph "System"
        Migrations[migrations<br/>~100 rows]
        Workers[workers<br/>~12 rows]
    end
    
    Orgs -.->|1:N| Repos
    Repos -.->|1:N| Claims
    Repos -.->|1:N| Scores
    Identities -.->|1:N| Claims
    Jobs -.->|1:N| Healdec
```

---

## 7. Deployment Topology

### AWS Infrastructure Diagram

```mermaid
graph TB
    subgraph "Public Internet"
        Users[Operators/Admins]
        GitHub[GitHub Webhooks]
    end
    
    subgraph "AWS Cloud - us-east-1"
        subgraph "VPC - 10.0.0.0/16"
            subgraph "Public Subnets"
                ALB[Application Load Balancer<br/>ALB]
                NAT[NAT Gateway]
            end
            
            subgraph "Private Subnets - AZ1"
                ECS1[ECS Fargate<br/>API Servers x2-10<br/>Auto-scaling]
                Orch1[ECS Fargate<br/>Orchestrator x1<br/>Singleton]
                Workers1[ECS Fargate<br/>Worker Pool<br/>x12-120]
            end
            
            subgraph "Private Subnets - AZ2"
                ECS2[ECS Fargate<br/>API Servers x2-10<br/>Auto-scaling]
                RDS_Replica[RDS Aurora<br/>Read Replica]
                Redis_Replica[ElastiCache<br/>Redis Replica]
            end
            
            subgraph "Database Subnet - AZ1"
                RDS[RDS Aurora<br/>PostgreSQL 15<br/>Primary]
            end
            
            subgraph "Cache Subnet - AZ1"
                Redis[ElastiCache<br/>Redis 7<br/>Primary]
            end
        end
        
        subgraph "S3 + CloudFront"
            S3_Frontend[S3 Bucket<br/>Static Frontend]
            CloudFront[CloudFront<br/>CDN]
            S3_Data[S3 Bucket<br/>Reports + Exports]
        end
        
        subgraph "Monitoring & Logging"
            CloudWatch[CloudWatch Logs]
            Datadog[Datadog APM]
            PagerDuty[PagerDuty]
        end
        
        subgraph "Secrets & Config"
            SecretsManager[AWS Secrets Manager]
            ParamStore[Systems Manager<br/>Parameter Store]
        end
    end
    
    Users --> CloudFront
    CloudFront --> S3_Frontend
    
    Users --> ALB
    GitHub --> ALB
    
    ALB --> ECS1
    ALB --> ECS2
    
    ECS1 --> RDS
    ECS2 --> RDS
    ECS1 --> Redis
    ECS2 --> Redis
    
    Orch1 --> RDS
    Orch1 --> Redis
    Orch1 --> Workers1
    
    Workers1 --> RDS
    Workers1 --> RDS_Replica
    Workers1 --> S3_Data
    
    RDS -.->|Replication| RDS_Replica
    Redis -.->|Replication| Redis_Replica
    
    ECS1 --> NAT
    ECS2 --> NAT
    Workers1 --> NAT
    Orch1 --> NAT
    
    NAT --> GitHub
    
    ECS1 -.->|Logs| CloudWatch
    ECS2 -.->|Logs| CloudWatch
    Workers1 -.->|Logs| CloudWatch
    Orch1 -.->|Logs| CloudWatch
    
    CloudWatch -.->|Metrics| Datadog
    Datadog -.->|Alerts| PagerDuty
    
    ECS1 -.->|Fetch Secrets| SecretsManager
    Workers1 -.->|Fetch Config| ParamStore
    
    style ALB fill:#ff9900,stroke:#333,stroke-width:2px
    style RDS fill:#4FD1C5,stroke:#333,stroke-width:3px
    style Redis fill:#FACC15,stroke:#333,stroke-width:3px
    style Orch1 fill:#A78BFA,stroke:#333,stroke-width:3px
    style Workers1 fill:#3fb950,stroke:#333,stroke-width:2px
```

### Scaling Paths

```mermaid
graph TD
    subgraph "Compute Scaling"
        A1[Low Load<br/>2 API servers<br/>12 workers] -->|CPU >70%| A2[Medium Load<br/>5 API servers<br/>36 workers]
        A2 -->|CPU >70%| A3[High Load<br/>10 API servers<br/>120 workers]
        A3 -->|CPU <30%| A2
        A2 -->|CPU <30%| A1
    end
    
    subgraph "Database Scaling"
        B1[Aurora Serverless<br/>0.5 ACU] -->|Connections >80%| B2[1 ACU]
        B2 -->|Queries >1000/s| B3[2 ACU]
        B3 -->|Write load high| B4[Add Read Replica]
        B4 -->|Complex queries| B5[Add Materialized Views]
    end
    
    subgraph "Cache Scaling"
        C1[t4g.medium<br/>1 replica] -->|Memory >80%| C2[t4g.large<br/>1 replica]
        C2 -->|Hit rate <90%| C3[Optimize TTL]
        C2 -->|Read heavy| C4[Add 2nd replica]
    end
    
    style A3 fill:#F87171
    style B5 fill:#4FD1C5
    style C4 fill:#FACC15
```

---

## 8. Job State Machine

### Job Lifecycle States

```mermaid
stateDiagram-v2
    [*] --> Pending: Job created
    
    Pending --> Scheduled: Orchestrator polls
    Scheduled --> Assigned: Worker available
    Assigned --> Running: Worker accepts
    
    Running --> Completed: Success
    Running --> Failed: Error occurred
    
    Failed --> RetryPending: Healdec retry
    RetryPending --> Scheduled: Backoff elapsed
    
    Failed --> Quarantined: Max attempts or data error
    Failed --> Escalated: Critical failure
    
    Quarantined --> UnderReview: Operator inspects
    UnderReview --> Scheduled: Fix applied, retry
    UnderReview --> Cancelled: Invalid job
    
    Escalated --> UnderReview: Incident resolved
    
    Completed --> [*]
    Cancelled --> [*]
    
    note right of Running
        Worker sends heartbeat
        every 30 seconds
    end note
    
    note right of Failed
        Healdec classifies
        and selects strategy
    end note
    
    note right of Quarantined
        Requires human
        intervention
    end note
```

---

## 9. Identity Merge Flow

### Identity Deduplication Process

```mermaid
sequenceDiagram
    actor Operator
    participant UI as Dashboard
    participant API
    participant DB
    participant RepairWorker
    
    Operator->>UI: Navigate to Identities page
    UI->>API: GET /api/v1/identities?duplicates=true
    API->>DB: Query identities with similar emails
    DB-->>API: Potential duplicates
    API-->>UI: Display grouped identities
    
    Operator->>UI: Select identities to merge
    Operator->>UI: Confirm merge (A → B)
    UI->>API: POST /api/v1/identities/merge
    API->>DB: Create RepairWorker job
    API-->>UI: 202 Accepted (job_id)
    
    RepairWorker->>DB: BEGIN TRANSACTION
    
    RepairWorker->>DB: UPDATE identities<br/>SET merged_into = B.id<br/>WHERE id = A.id
    
    RepairWorker->>DB: SELECT identity_claims<br/>WHERE identity_id = A.id
    DB-->>RepairWorker: Claims to transfer
    
    loop For each claim
        RepairWorker->>DB: Check if B already has claim for repo
        
        alt B has existing claim
            RepairWorker->>DB: UPDATE B's claim<br/>ADD commit_count from A<br/>Update first/last_commit_at
            RepairWorker->>DB: DELETE A's claim
        else B has no claim
            RepairWorker->>DB: UPDATE claim<br/>SET identity_id = B.id
        end
    end
    
    RepairWorker->>DB: INSERT INTO events<br/>(identity.merged)
    RepairWorker->>DB: INSERT INTO healdec_log<br/>(repair action)
    
    RepairWorker->>DB: COMMIT TRANSACTION
    
    RepairWorker->>API: Emit merge.completed event
    API->>UI: WebSocket notification
    UI-->>Operator: Show success message
    
    Operator->>UI: Refresh identities list
    UI->>API: GET /api/v1/identities/{B.id}
    API->>DB: Query identity with claims
    DB-->>API: Merged identity data
    API-->>UI: Display consolidated identity
```

---

## Additional Resources

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Full architecture specification
- [docs/REPOSITORY_STRUCTURE.md](./docs/REPOSITORY_STRUCTURE.md) - Suggested folder layout
- [docs/OPERATOR_HANDBOOK.md](./docs/OPERATOR_HANDBOOK.md) - Deployment and operations guide
- [docs/DOCS_SITE_STRUCTURE.md](./docs/DOCS_SITE_STRUCTURE.md) - Documentation site layout

---

**Last Updated:** 2026-01-28  
**Maintained By:** AlgoBrainDoctor Core Team  
**License:** MIT
