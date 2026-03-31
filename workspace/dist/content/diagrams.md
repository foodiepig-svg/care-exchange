# Care Exchange — System Architecture

---

## Platform Overview

Care Exchange connects the NDIS care ecosystem through a participant-controlled data layer:

```
PARTICIPANT                          CARE EXCHANGE                         PROVIDERS
─────────────────────────────────     ──────────────────────────────────     ──────────────────────
                                       ┌─────────────────────────────┐
  ┌──────────┐                         │       CONSENT LAYER          │
  │ Care     │ ◄───── Controls ─────── │  (Participant-Controlled)   │
  │ Record   │                         │  - Granular permissions       │
  │          │ ────── Shares ───────► │  - Time-limited access       │
  └──────────┘                         │  - Revocable at any time     │
    Goals,                            │  - Full audit trail          │
    Providers,                        └──────────────┬──────────────┘
    Updates,                                       │
    Consents                                       ▼
                                       ┌─────────────────────────────┐
                                       │      SECURE REFERRAL        │
                                       │         ENGINE              │
                                       └──────────────┬──────────────┘
                                                      │
                                       ┌──────────────┼──────────────┐
                                       │              │              │
                              ┌────────▼─────┐ ┌──────▼──────┐ ┌────▼────────┐
                              │  Progress   │ │    Goal    │ │   Message   │
                              │  Updates    │ │  Tracking  │ │   Thread    │
                              └─────────────┘ └─────────────┘ └─────────────┘
```

---

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          CARE EXCHANGE PLATFORM                                  │
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                         FRONTEND LAYER                                    │    │
│  │                                                                          │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │    │
│  │  │ Participant │  │  Provider   │  │Coordinator │  │     Plan     │     │    │
│  │  │   Portal    │  │   Portal    │  │   Portal    │  │    Manager    │     │    │
│  │  │             │  │             │  │             │  │     Portal    │     │    │
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘     │    │
│  │         │                │                │                │              │    │
│  └─────────┼────────────────┼────────────────┼────────────────┼──────────────┘    │
│            │                │                │                │                   │
│  ──────────┼────────────────┼────────────────┼────────────────┼─────────────────│
│            ▼                ▼                ▼                ▼                    │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                         API GATEWAY (Flask + JWT)                        │    │
│  │              Authentication │ Rate Limiting │ Role Routing                 │    │
│  └────────────────────────────────┬────────────────────────────────────────┘    │
│                                   │                                               │
└───────────────────────────────────┼───────────────────────────────────────────────┘
                                    │
┌───────────────────────────────────┼───────────────────────────────────────────────┐
│                                   ▼                                               │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                      CORE SERVICES LAYER                                 │    │
│  │                                                                          │    │
│  │   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐  │    │
│  │   │   Referral   │  │   Consent    │  │     Goal     │  │    Update   │  │    │
│  │   │   Service    │  │   Service    │  │   Service    │  │   Service   │  │    │
│  │   │              │  │              │  │              │  │             │  │    │
│  │   │  - Create    │  │  - Granular  │  │  - Create    │  │  - Structured │ │    │
│  │   │  - Tokenize  │  │    scoping   │  │  - Track     │  │    categories │ │    │
│  │   │  - Expire    │  │  - Expiry    │  │  - Measure   │  │  - Timeline  │ │    │
│  │   │  - Track     │  │  - Revoke    │  │  - Celebrate │  │    append    │ │    │
│  │   └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └─────┬──────┘  │    │
│  │          │                 │                  │                 │          │    │
│  │          └─────────────────┼──────────────────┴─────────────────┘          │    │
│  │                            │                                               │    │
│  │   ┌──────────────┐  ┌──────┴──────┐  ┌──────────────┐  ┌────────────┐  │    │
│  │   │   Message    │  │  Notification│  │     Auth     │  │   Audit    │  │    │
│  │   │   Service    │  │   Service   │  │   Service    │  │    Log      │  │    │
│  │   └──────────────┘  └─────────────┘  └──────────────┘  └────────────┘  │    │
│  │                                                                          │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────  │
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                         DATA LAYER                                       │    │
│  │                                                                          │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │    │
│  │  │  PostgreSQL │  │    Redis     │  │   JWT       │  │  Referral   │   │    │
│  │  │  (Primary)  │  │  (Sessions)  │  │  (Tokens)   │  │  (Tokens)   │   │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │    │
│  │                                                                          │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────  │
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                      EXTERNAL INTEGRATIONS                                │    │
│  │                                                                          │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │    │
│  │  │  NDIS      │  │   Email     │  │    SMS      │  │  Plan Mgmt  │   │    │
│  │  │  myplace   │  │  (SendGrid) │  │  (Twilio)   │  │   Software  │   │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │    │
│  │                                                                          │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## Data Model

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DATA MODEL                                       │
│                                                                             │
│   ┌─────────────┐         ┌─────────────┐         ┌─────────────┐          │
│   │   User      │         │ Participant │         │  Provider   │          │
│   ├─────────────┤         ├─────────────┤         ├─────────────┤          │
│   │ id          │◄───────┐│ id          │        ││ id          │          │
│   │ email       │        ││ user_id     │────────►││ user_id     │          │
│   │ password    │        ││ ndis_number │    ┌───►││ abn         │          │
│   │ role        │        ││ plan_type   │    │    ││ ndis_reg    │          │
│   │ created_at  │        ││ plan_expiry │    │    ││ org_name    │          │
│   └─────────────┘        │└─────────────┘    │    │└─────────────┘          │
│                          │         │         │            │                 │
│                          │         │         │            │                 │
│                          │         ▼         │            │                 │
│   ┌─────────────┐        │┌─────────────┐     │            │                 │
│   │CareRecord  │◄───────┘│Goal         │     │            │                 │
│   ├─────────────┤        ├─────────────┤     │            │                 │
│   │ id          │        │ id          │     │            │                 │
│   │participant_id│──────►│care_record_id│───┘            │                 │
│   │version      │        │title         │                │                 │
│   │created_at   │        │category      │                │                 │
│   │updated_at   │        │target_date   │                │                 │
│   └─────────────┘        │progress_pct  │                │                 │
│          │               └─────────────┘                │                 │
│          │                                                  │                 │
│          │               ┌─────────────┐                   │                 │
│          └──────────────►│ Referral    │◄──────────────────┘                 │
│                          ├─────────────┤                                     │
│                          │ id          │                                     │
│                          │ from_user   │                                     │
│                          │ to_provider │                                     │
│                          │ status      │                                     │
│                          │ token       │                                     │
│                          │ expires_at  │                                     │
│                          │ consent_scope│                                    │
│                          └──────┬──────┘                                     │
│                                 │                                            │
│                                 ▼                                            │
│                          ┌─────────────┐         ┌─────────────┐              │
│                          │  Consent    │         │ProgressUpdate│             │
│                          ├─────────────┤         ├─────────────┤              │
│                          │ id          │         │ id          │              │
│                          │ referral_id │────────►│ referral_id │              │
│                          │ category    │         │ goal_id     │              │
│                          │ granted_at  │         │ category    │              │
│                          │ expires_at  │         │ content     │              │
│                          │ revoked_at  │         │ progress_pct│              │
│                          └─────────────┘         │ created_by  │              │
│                                                 │ created_at  │              │
│                                                 └─────────────┘              │
│                                                                             │
│   ┌─────────────┐         ┌─────────────┐                                 │
│   │  Message    │         │AuditEntry   │                                 │
│   ├─────────────┤         ├─────────────┤                                 │
│   │ id          │         │ id          │                                 │
│   │ thread_id   │         │ user_id     │                                 │
│   │ sender_id   │         │ action      │                                 │
│   │ content     │         │ resource    │                                 │
│   │ created_at  │         │ resource_id │                                 │
│   └─────────────┘         │ ip_address  │                                 │
│                          │ timestamp   │                                 │
│                          └─────────────┘                                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Referral Flow (State Machine)

```
  ┌─────────┐
  │ DRAFT   │  (Participant creates referral, selects provider, sets scope)
  └────┬────┘
       │  Participant sends referral
       ▼
  ┌─────────┐
  │  SENT   │  (Link generated, delivered via email/SMS to provider)
  └────┬────┘
       │  Provider views referral link
       ▼
  ┌─────────┐
  │ VIEWED  │  (Provider opens link, reviews care record excerpt)
  └────┬────┘
       │
       ├── Provider declines
       │      ▼
       │  ┌──────────┐
       │  │ DECLINED │  (No data shared, participant notified)
       │  └──────────┘
       │
       │  Provider accepts
       ▼
  ┌──────────┐
  │ ACCEPTED │  (Consent recorded, provider linked to care team)
  └────┬─────┘
       │  First session occurs, update submitted
       ▼
  ┌─────────┐
  │ ACTIVE  │  (Provider submits updates, accesses care record per consent)
  └────┬────┘
       │
       ├── Participant revokes consent
       │      ▼
       │  ┌──────────┐
       │  │REVOKED   │  (Provider access terminated, history retained)
       │  └──────────┘
       │
       ├── Plan expires / service ends
       │      ▼
       │  ┌──────────┐
       │  │ COMPLETED│  (Record archived, provider marked as "previous")
       │  └──────────┘
       │
       └── No updates for 45 days
              ▼
         ┌─────────┐
         │ON_HOLD │  (Provider dormant, can be reactivated)
         └─────────┘
```

---

## Consent Scope Model

```
PARTICIPANT CONTROLS WHAT EACH PROVIDER SEES
══════════════════════════════════════════

Per-Referral, Per-Category Consent:

┌────────────────────────────────────────────────────────────────┐
│  Referral to: Apex Allied Health (Occupational Therapy)       │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  [✓] Goals                                                     │
│      - All goals                                               │
│      - Goal: "Improve fine motor skills for keyboarding"        │
│      - Goal: "Increase upper limb strength"                    │
│                                                                │
│  [ ] Full care plan                                            │
│                                                                │
│  [✓] Progress updates                                          │
│      - Last 3 months                                           │
│                                                                │
│  [ ] Incident reports                                          │
│                                                                │
│  [ ] Financial / plan information                              │
│                                                                │
│  [✓] Equipment and aids                                        │
│      - Current equipment list only                             │
│                                                                │
│  [ ] Medical history                                           │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│  Access Level: [Active Care Team ▼]                            │
│  Expires: [30 days ▼]                                         │
│                                                                │
│                              [Cancel]  [Save & Send Referral]  │
└────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

```
┌──────────────────────────────────────────────────────────────┐
│                        FRONTEND                               │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │    React     │  │     Vite     │  │  Tailwind    │       │
│  │   18.x       │  │   Build      │  │    CSS       │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ React Router │  │    Lucide    │  │    React    │       │
│  │     v6        │  │    Icons    │  │  Hook Form  │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│                                                               │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                         BACKEND                               │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │    Flask     │  │  SQLAlchemy  │  │  Flask-JWT   │       │
│  │   Python     │  │    ORM       │  │  Extended    │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │Flask-Migrate │  │    PyJWT     │  │  Flask-CORS  │       │
│  │   (Alembic)  │  │              │  │              │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│                                                               │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                       DATA LAYER                              │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ PostgreSQL   │  │    Redis     │  │   Gunicorn   │       │
│  │   (Docker)   │  │  (Sessions)  │  │    (WSGI)    │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│                                                               │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                       DEPLOYMENT                              │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Docker     │  │   Docker     │  │    Nginx     │       │
│  │  Compose     │  │   Network    │  │  (Reverse    │       │
│  │              │  │   Overlay    │  │   Proxy)     │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

---

## Security & Compliance Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                   SECURITY LAYERS                               │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  TRANSPORT: TLS 1.3 (All traffic)                         │ │
│  └──────────────────────────────────────────────────────────┘ │
│                            │                                   │
│                            ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  AUTHENTICATION                                           │ │
│  │  - JWT tokens (15-min access, 7-day refresh)             │ │
│  │  - Passwords: bcrypt with salt                           │ │
│  │  - Role-based access: Participant, Provider, Coordinator │ │
│  └──────────────────────────────────────────────────────────┘ │
│                            │                                   │
│                            ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  CONSENT ENFORCEMENT                                      │ │
│  │  - Every API call checks consent scope                    │ │
│  │  - Referral tokens: cryptographic, single-use            │ │
│  │  - Access expiry enforced at API layer                   │ │
│  └──────────────────────────────────────────────────────────┘ │
│                            │                                   │
│                            ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  AUDIT LOGGING (Non-repudiable)                          │ │
│  │  - All data access logged with timestamp, user, IP       │ │
│  │  - Consent grants and revocations                        │ │
│  │  - Immutable — append only                               │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      DOCKER COMPOSE STACK                        │
│                                                                 │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐     │
│  │  frontend     │  │   backend      │  │     db        │     │
│  │  (React/Nginx)│  │  (Flask/Gunic)│  │  (PostgreSQL) │     │
│  │               │  │               │  │               │     │
│  │  Port: 3000   │  │  Port: 5000   │  │  Port: 5432   │     │
│  └───────┬───────┘  └───────┬───────┘  └───────┬───────┘     │
│          │                    │                    │              │
│          └────────────────────┼────────────────────┘              │
│                               │                                   │
│                               ▼                                   │
│                    ┌─────────────────────┐                       │
│                    │   shared-network     │                       │
│                    └─────────────────────┘                       │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  HOST: localhost:3000 → Frontend → API Gateway          │    │
│  │         localhost:5000 → Backend API (direct)            │    │
│  └─────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────┘
```
