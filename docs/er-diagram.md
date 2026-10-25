# SkillNest ER diagram

IDs are `BIGINT` auto-increment. Enums are stored as strings (`@Enumerated(EnumType.STRING)`). Relationships are unidirectional `@ManyToOne` from the child.

```mermaid
erDiagram
    USER {
        bigint id PK
        string name
        string email UK
        string passwordHash
        string role
        string bio
        int currentStreakDays
        datetime createdAt
    }

    CIRCLE {
        bigint id PK
        string name
        string topic
        string description
        string goalType
        string commitment
        date deadline
        string status
        datetime createdAt
    }

    CIRCLE_MEMBER {
        bigint id PK
        bigint circle_id FK
        bigint user_id FK
        int assessmentScore
        string skillLevel
        datetime joinedAt
    }

    SUB_GROUP {
        bigint id PK
        bigint circle_id FK
        string name
        bigint leader_id FK
        string balanceLabel
        datetime createdAt
    }

    SUB_GROUP_MEMBER {
        bigint id PK
        bigint sub_group_id FK
        bigint user_id FK
    }

    TASK {
        bigint id PK
        bigint sub_group_id FK
        string title
        string description
        bigint assignee_id FK
        date dueDate
        string status
        string proofUrl
        string reviewNote
        datetime createdAt
    }

    TASK_VERIFICATION {
        bigint id PK
        bigint task_id FK
        bigint verified_by_id FK
        datetime createdAt
    }

    MESSAGE {
        bigint id PK
        bigint sub_group_id FK
        bigint sender_id FK
        string body
        datetime sentAt
    }

    MILESTONE {
        bigint id PK
        bigint sub_group_id FK
        string title
        string description
        date dueDate
        string status
    }

    RESOURCE {
        bigint id PK
        bigint sub_group_id FK
        string title
        string url
        bigint added_by_id FK
        datetime addedAt
    }

    BADGE {
        bigint id PK
        string name
        string description
    }

    USER_BADGE {
        bigint id PK
        bigint user_id FK
        bigint badge_id FK
        datetime earnedAt
    }

    REPORT {
        bigint id PK
        bigint reporter_id FK
        bigint reported_user_id FK
        bigint sub_group_id FK
        string reason
        string note
        string status
        datetime createdAt
    }

    USER ||--o{ CIRCLE_MEMBER : joins
    CIRCLE ||--o{ CIRCLE_MEMBER : has
    CIRCLE ||--o{ SUB_GROUP : splits_into
    USER ||--o{ SUB_GROUP : leads
    SUB_GROUP ||--o{ SUB_GROUP_MEMBER : has
    USER ||--o{ SUB_GROUP_MEMBER : belongs_to
    SUB_GROUP ||--o{ TASK : contains
    USER ||--o{ TASK : assigned
    TASK ||--o{ TASK_VERIFICATION : confirmed_by
    USER ||--o{ TASK_VERIFICATION : verifies
    SUB_GROUP ||--o{ MESSAGE : has
    USER ||--o{ MESSAGE : sends
    SUB_GROUP ||--o{ MILESTONE : has
    SUB_GROUP ||--o{ RESOURCE : has
    USER ||--o{ RESOURCE : adds
    USER ||--o{ USER_BADGE : earns
    BADGE ||--o{ USER_BADGE : awarded_as
    USER ||--o{ REPORT : files
    USER ||--o{ REPORT : is_reported
    SUB_GROUP ||--o{ REPORT : context
```

## Constraints

- `users.email` is unique.
- `circle_members` is unique on `(circle_id, user_id)`.
- `sub_group_members` is unique on `(sub_group_id, user_id)`.

## Enum values

| Field | Values |
| --- | --- |
| `USER.role` | LEARNER, ADMIN |
| `CIRCLE.goalType` | LEARN, BUILD, COMPETE |
| `CIRCLE.commitment` | CASUAL, SERIOUS |
| `CIRCLE.status` | OPEN, GROUPED, CLOSED |
| `CIRCLE_MEMBER.skillLevel` | BEGINNER, INTERMEDIATE, ADVANCED |
| `TASK.status` | IN_PROGRESS, PENDING_PEER_CONFIRMATION, VERIFIED, CHANGES_REQUESTED |
| `MILESTONE.status` | NOT_STARTED, IN_PROGRESS, COMPLETED |
| `REPORT.status` | OPEN, RESOLVED |
