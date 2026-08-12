# Study Hub — Architecture & Documentation

## System Overview

Study Hub is a student-facing web application and production education platform built with:

| Layer | Technology |
|---|---|
| Frontend | Vite + React 19 + TypeScript |
| Styling | Tailwind CSS (dark theme) |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth (Email + Google OAuth) |
| AI | Gemini Flash (via Supabase Edge Function in production, Vite dev plugin in dev) |
| Storage | Supabase Storage (resource files, thumbnails) |
| Edge Functions | Supabase Deno Runtime |
| PWA | Service Worker + Web App Manifest |

---

## Phase Architecture

### Phase 1 — Student Core
- Dashboard, Exam Setup, Roadmap, PYQ Practice, Mock Tests, Performance

### Phase 2 — Intelligence Engine
- Mistake Notebook, Spaced Revision, Flashcards, Adaptive Practice, StudyMate AI, Learning Insights, Exam Readiness, Resource Intelligence

### Phase 3 — Retention Ecosystem
- Streaks, XP, Levels, Achievements, Daily Goals, Challenges, Study Circles, Community, Study Rooms, Profiles, Notifications, Moderation

### Phase 4 — Production Platform
- Admin CMS, RBAC, Content Management, Question Bank, Exam Config, Mock Builder, Moderation Center, Audit Logs, System Health, Security, Performance, SEO, PWA, Settings, Billing Readiness

---

## Directory Structure

```
e:/STUDY WEBSITE/
├── src/
│   ├── App.tsx                    # Main router + error boundaries
│   ├── main.tsx                   # Entry point + env validation
│   ├── components/
│   │   ├── admin/                 # AdminGuard component
│   │   ├── gamification/          # Achievement modal, XP toast
│   │   ├── layout/                # MobileNav
│   │   ├── notifications/         # Notification bell
│   │   ├── study-ai/              # FloatingAIButton, AIFeedback
│   │   ├── ui/                    # Toast, shared UI primitives
│   │   ├── ErrorBoundary.tsx      # Route-level error boundary
│   │   ├── Navbar.tsx
│   │   └── ...
│   ├── context/
│   │   └── AuthContext.tsx        # Supabase auth context
│   ├── hooks/
│   │   └── useAdminRole.ts        # Server-verified RBAC hook
│   ├── lib/
│   │   ├── supabase.ts            # Supabase client
│   │   ├── adminApi.ts            # Edge Function calls
│   │   ├── cache.ts               # Session-scoped TTL cache
│   │   ├── contentSanitizer.ts    # XSS prevention
│   │   ├── envValidator.ts        # Startup env check
│   │   └── ...api files...
│   ├── pages/
│   │   ├── admin/                 # All admin pages
│   │   ├── Settings.tsx           # User settings center
│   │   ├── ResourcePage.tsx       # Public SEO resource page
│   │   └── ...student pages...
│   └── types/
├── supabase/
│   ├── functions/
│   │   ├── study-ai/              # Gemini AI Edge Function
│   │   ├── admin-stats/           # Admin dashboard stats
│   │   ├── admin-users/           # User management
│   │   ├── data-export/           # GDPR data export
│   │   └── account-delete/        # Account deletion
│   └── migrations/
│       ├── 20260812_student_core_phase1.sql
│       ├── 20260812_intelligence_engine_phase2.sql
│       ├── 20260812_ecosystem_phase3.sql
│       ├── 20260812_study_ai_chat_history.sql
│       └── 20260812_production_phase4.sql
├── scripts/
│   ├── import-resources-to-supabase.js
│   ├── bulk-upload-resources.js
│   └── merged-resource-manifest.json
├── public/
│   ├── sw.js                      # Production service worker
│   ├── manifest.webmanifest       # PWA manifest
│   ├── robots.txt                 # SEO crawler rules
│   ├── sitemap.xml                # Public URL sitemap
│   └── images/
└── .github/workflows/ci.yml       # CI: lint + typecheck + build
```

---

## Role-Based Access Control (RBAC)

| Role | Access |
|---|---|
| `student` | All student features |
| `moderator` | + Community Reports, Moderation Center, Audit Log |
| `content_editor` | + Resources, Questions, Exams, Roadmaps, Mock Tests, Announcements |
| `admin` | + Users, AI Panel, Analytics, System Health |
| `super_admin` | + Settings, Feature Flags, everything |

**Critical**: Role is always fetched from `user_roles` database table. Never trust localStorage or client-supplied roles. The `useAdminRole()` hook enforces this.

---

## Security Architecture

- **RBAC**: Server-verified via `user_roles` table + Supabase RLS policies
- **Edge Functions**: Privileged operations (user management, data export, account deletion) run server-side with service role key
- **API Keys**: `SUPABASE_SERVICE_ROLE_KEY` and `GEMINI_API_KEY` are Edge Function secrets only — never in `VITE_*` vars
- **Content Security**: User-generated content sanitized before rendering
- **URL Validation**: All resource URLs validated for safe protocols
- **Rate Limiting**: Applied to StudyMate AI, auth endpoints
- **Input Validation**: Server-side validation in Edge Functions

---

## Environment Variables

### Client-side (safe to expose)
```
VITE_SUPABASE_URL=https://fmpgcdwmkhpkbpwdhyhm.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### Server-side ONLY (Edge Function secrets)
```
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GEMINI_API_KEY=your_gemini_key
```

Set server-side secrets in: Supabase Dashboard → Project → Edge Functions → Secrets

### Development only (Vite dev plugin)
```
GEMINI_API_KEY=your_gemini_key  # Used by Vite dev plugin only, not bundled
```

---

## Database Migrations

Always apply migrations in order:
1. `20260812_student_core_phase1.sql`
2. `20260812_intelligence_engine_phase2.sql`
3. `20260812_ecosystem_phase3.sql`
4. `20260812_study_ai_chat_history.sql`
5. `20260812_production_phase4.sql`

To apply:
```bash
supabase db push
# or via Supabase Dashboard → SQL Editor
```

---

## Deployment

See [docs/deployment.md](./deployment.md) for full deployment guide.
