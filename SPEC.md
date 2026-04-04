# Help & Support Tickets — SPEC

## Overview

Allow Care Exchange users to submit bug reports and feature requests. Admins manage all tickets via an internal Tickets page.

---

## Data Model

### tickets
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| user_id | UUID | FK → users.id |
| title | VARCHAR(200) | required |
| description | TEXT | required |
| type | ENUM | `issue` or `feature` |
| status | ENUM | `open` → `triaged` → `in_progress` → `resolved` → `closed` |
| priority | ENUM | `low` (default), `medium`, `high` |
| resolved_at | TIMESTAMP | nullable, set when status → resolved |
| created_at | TIMESTAMP | auto |
| updated_at | TIMESTAMP | auto |

### ticket_comments
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| ticket_id | UUID | FK → tickets.id |
| author_id | UUID | FK → users.id |
| author_role | VARCHAR(50) | snapshot of role at time of comment |
| comment | TEXT | required |
| created_at | TIMESTAMP | auto |

---

## API Endpoints

### User-facing
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/tickets | List own tickets (ordered desc by created_at) |
| POST | /api/tickets | Create a new ticket |
| GET | /api/tickets/:id | Get ticket detail with comments |
| POST | /api/tickets/:id/comments | Add comment to own ticket |

### Admin-only
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/admin/tickets | List all tickets (filter by type, status, priority) |
| PATCH | /api/admin/tickets/:id | Update status and/or priority |
| GET | /api/admin/tickets/:id/comments | List all comments for ticket |
| POST | /api/admin/tickets/:id/comments | Add admin comment |

---

## App Frontend: Help & Support (`/app/support`)

- Accessible from sidebar nav (all roles: "Help & Support")
- Layout: sidebar with 2 sections — "My Tickets" + "Submit New"
- **Submit New** form: Title (text), Type (select: Bug / Feature Request), Description (textarea), Submit button
- **My Tickets** list: cards showing title, type badge, status badge, date; click opens detail modal
- **Ticket detail modal**: shows full description, status timeline, comments thread, and "Add comment" input
- Non-admin users see their own tickets only; cannot change status

---

## Admin Frontend: Tickets (`/admin/tickets`)

- Full page (not modal) with data table
- Columns: ID (short), Title, Type, Status, Priority, Submitted by (role + name), Date
- Filter bar: Type dropdown, Status dropdown, Priority dropdown
- Click row → slide-over detail panel
- Detail panel: full ticket info, comments thread, status/priority update controls, add comment form
- Status buttons: Open / Triaged / In Progress / Resolved / Closed — admin clicks to cycle
- Priority selector: Low / Medium / High

---

## Seed Data

- 3 tickets across different roles (participant, provider, coordinator)
- 1 issue (open), 1 feature (triaged), 1 issue (in_progress)
- 1 comment on the first ticket

---

## Implementation Order

1. Backend: Ticket model + migration, ticket routes, comment routes, seed data
2. App: Help & Support page with ticket form and own ticket list
3. Admin: Tickets index page with filters and detail slide-over
4. Wire up routes in app.py and App.jsx