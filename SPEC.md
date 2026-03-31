# Care Exchange — Product Specification

> "Care that connects, Outcomes that matter."

## 1. Concept & Vision

Care Exchange is a participant-controlled coordination platform for the NDIS ecosystem. It acts as shared digital infrastructure that enables people with disabilities, families, Support Coordinators, and providers to work together securely — without replacing the clinical or practice management systems providers already use.

The platform bridges the fragmentation gap in long-term care by providing: secure referral links, structured provider updates, a central care record, and consent-driven information sharing.

**Feel:** Warm, trustworthy, calm. Healthcare tools often feel clinical and cold. Care Exchange should feel human — like a caring coordinator who has everything organized and keeps everyone informed.

---

## 2. Design Language

### Color Palette
- **Primary:** `#0F766E` (teal-700) — trustworthy, calm, healthcare-appropriate
- **Primary Light:** `#14B8A6` (teal-500)
- **Secondary:** `#7C3AED` (violet-600) — for actions and CTAs
- **Background:** `#F8FAFC` (slate-50)
- **Surface:** `#FFFFFF`
- **Text Primary:** `#0F172A` (slate-900)
- **Text Secondary:** `#475569` (slate-600)
- **Border:** `#E2E8F0` (slate-200)
- **Success:** `#16A34A` (green-600)
- **Warning:** `#D97706` (amber-600)
- **Error:** `#DC2626` (red-600)

### Typography
- **Headings:** Inter (700, 600)
- **Body:** Inter (400, 500)
- **Monospace:** JetBrains Mono (for codes/IDs)
- **Scale:** 12 / 14 / 16 / 18 / 24 / 32 / 48px

### Spatial System
- Base unit: 4px
- Component padding: 12px / 16px / 24px
- Section spacing: 32px / 48px / 64px
- Border radius: 8px (cards), 6px (buttons), 12px (modals)

### Motion Philosophy
- Micro-interactions: 150ms ease-out
- Page transitions: 200ms ease-in-out
- Modal entrance: scale(0.95→1) + fade, 200ms
- Loading states: skeleton shimmer animation
- No gratuitous animation — motion serves comprehension

### Visual Assets
- Icons: Lucide React (consistent stroke weight)
- Empty states: illustrated with brief, warm copy
- Status badges: pill-shaped with semantic colors

---

## 3. Layout & Structure

### Information Architecture

```
Care Exchange
├── Participant Portal
│   ├── Dashboard (care team overview, recent activity)
│   ├── My Care Record (goals, plans, documents)
│   ├── Referrals (sent/received)
│   ├── Care Team (providers, coordinators)
│   └── Messages
├── Provider Portal
│   ├── Dashboard (active referrals, pending updates)
│   ├── Received Referrals
│   ├── Send Updates
│   └── Participant Lookup (by consent)
├── Coordinator Portal
│   ├── Dashboard (caseload overview)
│   ├── Participants (managed)
│   └── Referrals
└── Auth
    ├── Login
    ├── Register (with role selection)
    └── Password Reset
```

### Page Structure
- **Top nav:** Logo | Search | Notifications | Profile menu
- **Sidebar (dashboard):** Role-specific navigation
- **Content area:** Card-based layouts with clear hierarchy
- **Responsive:** Mobile-first; sidebar collapses on tablet/mobile

---

## 4. Features & Interactions

### 4.1 Authentication & Roles

**Roles:**
- `participant` — Person with disability, controls their care record
- `family` — Family member with delegated access
- `provider` — Service provider organization
- `coordinator` — Support Coordinator managing participants

**Registration flow:**
1. Enter email + password + full name
2. Select role (Participant / Provider / Coordinator)
3. Participants: verify mobile number
4. Providers/Coordinators: verify organization + ABN
5. Email verification link

**Login:** Email + password, optional 2FA for providers.

### 4.2 Care Record (Participant)

Central record controlled by the participant containing:
- **Goals** — Personal goals with target dates and progress tracking
- **Care Plans** — Active supports and services with dates
- **Progress Notes** — Structured entries from providers
- **Documents** — Uploaded files (reports, assessments, plans)
- **Consent Settings** — Per-provider, per-data-type permissions

**Consent-driven:** Participant must explicitly grant each provider/coordinator read access to specific data categories.

### 4.3 Secure Referral System

**Send a Referral:**
1. Participant/Coordinator selects provider from directory
2. System generates secure referral link (time-limited, single-use)
3. Provider receives link via email/SMS
4. Provider reviews and accepts/declines
5. Accepted referral creates a care relationship

**Referral Status Flow:**
`draft → sent → viewed → accepted/declined → active → on_hold → completed`

**Referral Link Contents:**
- Participant summary (name, goals, relevant history)
- Referral reason and urgency
- Required supports
- Funding information (plan number, allocated funds)
- Previous provider information

### 4.4 Structured Provider Updates

Instead of lengthy reports, providers submit short structured updates:
- **Category:** Progress note / Incident report / Medication change / Goal update / General note
- **Summary:** 2-3 sentences max
- **Observations:** Free text
- **Recommendations:** Optional next steps
- **Time spent:** In 15-min increments

Updates are time-stamped, linked to the participant's care plan, and visible to the care team based on consent settings.

### 4.5 Care Team Messaging

- End-to-end encrypted messaging within care teams
- Threaded by topic (not chronological chaos)
- File attachments (images, PDFs)
- Read receipts and timestamps
- Group threads for multi-party coordination

### 4.6 Notifications

- Email + in-app notifications
- Notification types:
  - Referral received / accepted / declined
  - Update received from provider
  - Document shared with you
  - Consent request pending
  - Care plan goal approaching target date
  - Message received

---

## 5. Component Inventory

### Navigation
- **TopNav:** Logo, global search, notification bell (badge count), profile dropdown
- **Sidebar:** Role-based nav links with icons, active state highlight, collapse toggle
- **Breadcrumbs:** On detail pages

### Buttons
- **Primary:** Teal fill, white text — main actions
- **Secondary:** White fill, teal border — secondary actions
- **Ghost:** No border — tertiary actions (cancel, skip)
- **Danger:** Red fill — destructive actions
- States: default, hover (lighten 10%), active (darken 5%), disabled (50% opacity), loading (spinner)

### Cards
- White background, 1px slate border, 8px radius, subtle shadow
- **Document Card:** Icon + title + meta + actions menu
- **Referral Card:** Status badge + participant name + provider + date + action buttons
- **Update Card:** Category tag + summary + timestamp + author
- **Stat Card:** Large number + label + trend indicator

### Forms
- Labels above inputs, 12px font, slate-600
- Inputs: 40px height, slate-200 border, 6px radius, teal focus ring
- Validation: inline error below field, red border
- Select dropdowns, date pickers, file upload zones

### Tables
- Header: slate-100 background, uppercase labels, 11px
- Rows: alternating white/slate-50, hover slate-100
- Pagination below table

### Modals
- Centered, max-width 600px (md) / 900px (lg)
- Overlay: black 50% opacity
- Header with title + close X
- Footer with action buttons right-aligned

### Status Badges
- Pill-shaped, 10px font, semibold
- Colors: success/green (active), warning/amber (pending), slate (inactive), error/red (declined)

### Empty States
- Centered illustration + heading + brief description + CTA button
- Example: "No referrals yet" → "Send your first referral"

---

## 6. Technical Approach

### Stack
- **Frontend:** React 18 + Vite + React Router v6 + Tailwind CSS
- **Backend:** Python Flask + SQLAlchemy + Flask-JWT-Extended
- **Database:** PostgreSQL 15
- **File Storage:** Local filesystem (production: S3-compatible)
- **Email:** Resend API (or SendGrid)
- **Hosting:** Docker (Render or Railway)

### Project Structure

```
care-exchange/
├── backend/
│   ├── app.py              # Flask app factory
│   ├── requirements.txt
│   ├── config.py           # Environment config
│   ├── models/             # SQLAlchemy models
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── participant.py
│   │   ├── provider.py
│   │   ├── referral.py
│   │   ├── update.py
│   │   └── message.py
│   ├── routes/             # API endpoints
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── participants.py
│   │   ├── referrals.py
│   │   ├── updates.py
│   │   └── messages.py
│   └── services/            # Business logic
│       ├── __init__.py
│       ├── referral_service.py
│       └── notification_service.py
├── workspace/               # React frontend
│   ├── src/
│   │   ├── pages/          # Route pages
│   │   ├── components/     # Shared UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── context/        # React context (auth, theme)
│   │   ├── services/       # API client
│   │   └── styles/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
├── docker-compose.yml
├── Dockerfile.backend
├── Dockerfile.frontend
└── SPEC.md
```

### API Design

**Base URL:** `/api/v1`

**Auth:**
- `POST /auth/register` — Create account
- `POST /auth/login` — Get JWT tokens
- `POST /auth/refresh` — Refresh access token
- `POST /auth/logout` — Invalidate refresh token

**Participants:**
- `GET /participants/me` — Current user's participant profile
- `PUT /participants/me` — Update profile
- `GET /participants/me/care-team` — List care team members
- `POST /participants/me/consent` — Grant consent to a provider/coordinator

**Referrals:**
- `POST /referrals` — Create referral (generates secure link)
- `GET /referrals` — List referrals (filtered by role)
- `GET /referrals/:id` — Referral detail
- `PUT /referrals/:id/status` — Update status

**Updates:**
- `POST /updates` — Submit structured update
- `GET /updates` — List updates (filtered by participant consent)
- `GET /updates/:id` — Update detail

**Messages:**
- `GET /messages/threads` — List threads
- `GET /messages/threads/:id` — Thread messages
- `POST /messages/threads/:id` — Send message

### Data Model

**User:** id, email, password_hash, role, created_at, verified_at
**Participant:** id, user_id, full_name, date_of_birth, ndis_number, plan_number, goals, care_plans
**Provider:** id, user_id, organisation_name, abn, contact_name, service_types
**Coordinator:** id, user_id, full_name, organisation
**Referral:** id, participant_id, provider_id, coordinator_id, status, referral_link_token, sent_at, responded_at
**Update:** id, referral_id, author_id, category, summary, observations, recommendations, time_spent_minutes
**Message:** id, thread_id, sender_id, content, sent_at, read_at
**Consent:** id, participant_id, granted_to_id, data_categories, granted_at, expires_at

### Security Considerations
- JWT access tokens (15 min expiry) + refresh tokens (7 days)
- Password hashing with bcrypt
- Referral tokens: cryptographically random, single-use, 7-day expiry
- All API endpoints require authentication except `/auth/*`
- Role-based access control on all data endpoints
- Consent must be active before any data access
- File uploads scanned and type-validated
- HTTPS everywhere in production
