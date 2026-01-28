

# Deeplinkers – Agentic AI Copilot for EV Swap Station Operations

## Project Overview
A role-based web application for monitoring and managing EV battery swap stations. The system provides real-time operational visibility, AI-powered recommendations, and coordinated workflows across three user roles.

---

## 🎨 Design System

**Theme:** Modern dark operations dashboard
- **Background:** Deep charcoal/slate (#0f172a to #1e293b)
- **Cards:** Semi-transparent dark panels with subtle glow borders
- **Accent Colors:** 
  - Green (#22c55e) → Healthy/Resolved
  - Yellow (#eab308) → Attention/Warning
  - Red (#ef4444) → Critical/Risk
  - Blue (#3b82f6) → Info/Actions
- **Typography:** Clean sans-serif, strong hierarchy
- **Icons:** Lucide icons throughout

---

## 🗂️ Application Structure

### Global Layout
- **Collapsible sidebar** (desktop) / **Bottom nav** (mobile)
- Consistent header with role badge, notifications bell, and user menu
- Real-time connection indicator (simulated)

### Navigation Items by Role

| Driver | Field Ops | Admin |
|--------|-----------|-------|
| Dashboard | Dashboard | Dashboard |
| Nearby Stations | My Tickets | City View |
| Notifications | Station Health | Alerts |
| Settings | Resolved History | Recommendations |
| — | Settings | Tickets Overview |
| — | — | Notification Log |
| — | — | Settings |

---

## 📄 Page 0: Login & Role Routing

### Layout
- Centered login card on dark gradient background
- Deeplinkers logo and tagline at top
- Email/password form with clean input styling

### Features
- Demo accounts section showing quick-access credentials:
  - 🔵 admin@demo.com (Admin)
  - 🟢 fieldops@demo.com (Field Ops)  
  - 🟡 driver@demo.com (Driver)
- One-click demo login buttons
- Auto-redirect based on profile role after authentication

---

## 📄 Page 1: Driver Dashboard (Mobile-First)

### Purpose
Help drivers quickly find the best swap station and receive reroute guidance.

### Sections

**1. Current Station Card (Hero)**
- Large station name with status pill
- Estimated wait time (e.g., "~8 min wait")
- Battery availability indicator
- "Navigate" button

**2. Reroute Alert Banner (When Active)**
- Prominent yellow/orange banner
- Message: "Station A is congested → Head to Station B (2.4 km)"
- Reason tag: "High queue detected"
- "Open Maps" action button

**3. Nearby Stations List**
- Top 3-5 alternative stations
- Each card shows: Name, Distance, Status pill, Availability
- Quick-select to update current station

**4. Notification History**
- Scrollable list of past reroute messages
- Timestamp, message, and status
- Pull-to-refresh gesture

**5. Simple Profile**
- User name, vehicle info (mock)
- Logout button

---

## 📄 Page 2: Field Ops Dashboard

### Purpose
Manage maintenance tickets efficiently and track station health.

### Sections

**1. Active Tickets Board**
- Kanban-style columns or card list:
  - **New** → **Acknowledged** → **In Progress** → **Resolved**
- Each ticket card shows:
  - Station name + location
  - Issue type icon (wrench, alert, battery)
  - Priority badge (P0/P1/P2/P3)
  - Probable root cause
  - Time since created

**2. Ticket Detail Modal/Drawer**
- Full issue description
- Fault timeline (synthetic events)
- Status update buttons
- Notes field for fix summary
- Station quick-view metrics

**3. Station Health Snapshot**
- For currently selected ticket
- Mini dashboard: Uptime %, Error count, Queue level
- Last 24h trend sparkline

**4. Resolved History**
- Completed tickets with resolution time
- Filter by date range

**5. Quick Stats Header**
- My open tickets count
- Urgent tickets (P0/P1)
- Resolved today

---

## 📄 Page 3: Admin HQ Control Tower

### Purpose
City-wide monitoring with actionable AI recommendations.

### Sections

**1. KPI Strip (Top)**
Five cards in a row:
- Total Stations (with city breakdown)
- Stations at Risk (yellow/red count)
- Avg Queue Level (with trend arrow)
- Fleet Uptime %
- Active Alerts (with P0 highlight)

**2. City View (Dual Mode)**
- Toggle: Grid View ↔ Map View
- **Grid:** Filterable station cards with status colors
- **Map:** Stylized city map with station pins
- Filters: City, Risk Type, Priority, Status

**3. Alerts Panel**
- Sorted by priority (P0 at top, highlighted)
- Each alert: Station, Risk type, Time, Status
- Quick actions: Acknowledge, View Details
- Search and filter controls

**4. Top 3 Actions Now (Hero Module)**
- Prominent section with top recommendations
- Ranked by impact × confidence
- Each shows action type, station, and one-line reason
- Quick approve button

**5. Recommendations Feed**
- Full list of pending recommendations
- Each card displays:
  - **Action Tag:** REROUTE / TICKET / REBALANCE / ESCALATE
  - **Station:** Name and location
  - **Why:** "Queue exceeded threshold for 15 mins"
  - **Expected Impact:** "Reduce wait by ~12 mins"
  - **Confidence:** Score bar (0-100%)
  - **Buttons:** ✓ Approve | 💤 Snooze | ✗ Reject

**6. Reroute Scope Policy Card**
- Visual display of search radius rules:
  - Default: 3 km radius
  - Expanded: 5 km if no suitable station
  - Emergency: 10 km for critical outages

**7. Notification Center**
- Log of all sent notifications
- Filter by role (Driver/Field Ops)
- Shows: Message, Channel, Timestamp, Status

**8. Tickets Overview**
- Summary table of all open tickets
- SLA indicator (time remaining/overdue)
- Assigned field ops user

**9. Ops Assistant Chatbox (Sidebar Widget)**
- Collapsible chat panel
- Quick action buttons:
  - "Why did we reroute Station A?"
  - "Show critical stations"
  - "Today's approved actions"
- Text input with keyword matching
- Pre-written contextual responses

---

## 🔄 Workflow Automation (UI Flows)

### When Admin Approves a Recommendation:
1. Recommendation status → "Approved"
2. If action = REROUTE: Create notification for affected drivers
3. If action = TICKET: Create ticket assigned to Field Ops
4. Show success toast with summary

### Ticket Lifecycle:
```
New → Acknowledged → In Progress → Resolved
```
- Field Ops updates status via dropdown/buttons
- Admin sees real-time status in Tickets Overview
- Resolution time tracked automatically

---

## 🗄️ Database Structure (Supabase)

### Tables
1. **profiles** – User info with role assignment
2. **user_roles** – Role management (driver/field_ops/admin)
3. **stations** – Station master data with location
4. **station_metrics** – Time-series operational data
5. **alerts** – Risk detection records
6. **recommendations** – AI-generated action items
7. **tickets** – Maintenance tasks
8. **notifications** – Sent message log

### Synthetic Data
- 16 stations across 2 cities (e.g., Jakarta & Surabaya)
- Metrics that shift every 5-10 seconds (simulated live)
- 12 active alerts with mixed priorities
- 10 pending recommendations
- 8 open tickets
- 20 notification history entries

---

## 🧩 Shared Component Library

- **StatusPill** – Green/Yellow/Red status indicators
- **PriorityBadge** – P0/P1/P2/P3 badges
- **StationCard** – Reusable station display
- **MetricCard** – KPI with value, label, trend
- **AlertCard** – Alert display with actions
- **RecommendationCard** – Full explainability layout
- **TicketCard** – Ticket summary with status
- **DataTable** – Sortable, filterable tables
- **ConfidenceBar** – Visual score indicator
- **ChatWidget** – Collapsible assistant panel

---

## 📁 Folder Structure (Team Split)

```
/src
  /components
    /ui         → Shared shadcn components
    /shared     → StatusPill, MetricCard, etc.
  /pages
    /auth       → Login, routing logic
    /driver     → Driver dashboard (Teammate 1)
    /field-ops  → Field Ops pages (Teammate 2)
    /admin      → Admin HQ pages (Teammate 3)
  /hooks        → Shared data hooks
  /lib          → Utils, mock data generators
```

---

## ⚡ Real-Time Simulation

- Use React state + setInterval to shift metrics every 5-10 seconds
- Random fluctuations in queue levels, uptime %
- Occasionally spawn new alerts/recommendations
- Subtle animations for value changes

---

## 🚀 Implementation Priority

**Phase 1: Foundation**
- Auth flow with role routing
- Sidebar navigation
- Shared component library
- Mock data setup

**Phase 2: Core Pages**
- Driver dashboard
- Field Ops ticket board
- Admin KPI strip + Alerts

**Phase 3: Advanced Features**
- Recommendations workflow
- City view with dual modes
- Notification system
- Ops Assistant chatbox

