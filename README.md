# Study Hub

**Your personal Student Operating System** — Personalized Learning, AI Coach, Practice & Community for GATE, JEE, NEET & more.

---

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env
# Edit .env with your Supabase credentials

# Start development server
npm run dev

# Production build
npm run build
```

## Tech Stack

- **Frontend**: Vite + React 19 + TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- **AI**: Google Gemini Flash
- **PWA**: Service Worker + Web App Manifest

## Features

### Student Features (Phases 1-3)
- 📊 **Dashboard** — Personalized study overview
- 🗺️ **Roadmap** — Exam-specific learning path
- 📝 **PYQ Practice** — Previous year questions with adaptive difficulty
- 🧪 **Mock Tests** — Full-syllabus and subject-wise mock exams
- 📈 **Performance** — Detailed analytics and insights
- 📓 **Mistake Notebook** — Track and review mistakes
- 🔁 **Spaced Revision** — SM-2 algorithm based review
- 🃏 **Flashcards** — Active recall with spaced repetition
- 🎯 **Adaptive Practice** — Questions that adapt to your level
- 🤖 **StudyMate AI** — Personalized AI study coach (Gemini)
- 💡 **Learning Insights** — Performance pattern analysis
- 📅 **Exam Readiness** — Holistic readiness score
- 🔥 **Streaks & XP** — Gamification for consistency
- 🏆 **Achievements** — Milestone rewards
- 👥 **Community** — Study circles and discussions
- 🏠 **Study Rooms** — Timed collaborative study sessions
- 🔔 **Notifications** — Smart study reminders

### Admin Features (Phase 4)
- 🛡️ **Admin CMS** — Full content operations center
- 👤 **User Management** — RBAC with 5 role levels
- 📚 **Resource CMS** — Full resource lifecycle management
- ❓ **Question Bank** — Question creation and review workflow
- 🎓 **Exam Config** — JSON-driven exam configuration
- 🗺️ **Roadmap CMS** — Hierarchical content editor
- 🧪 **Mock Test Builder** — Validated mock test creation
- 🚨 **Moderation Center** — Community report management
- 📋 **Audit Log** — Immutable admin action tracking
- 🤖 **AI Management** — Prompt versioning, metrics, feedback
- ❤️ **System Health** — Real-time service monitoring
- 📣 **Announcements** — Targeted audience announcements
- 📊 **Analytics** — Platform usage analytics

### Production Features
- ⚙️ **Settings** — Full user settings center with data export and account deletion
- 🌐 **Public Resource Pages** — SEO-optimized individual resource pages
- 📱 **PWA** — Installable app with offline shell
- 🔍 **SEO** — Structured data, OG tags, sitemap, robots.txt
- 🔒 **Security** — Content sanitization, input validation, XSS prevention
- 🚀 **Performance** — TTL cache, full-text search, optimized indexes
- 💳 **Billing Ready** — Razorpay integration architecture

## Documentation

- [Architecture](./docs/architecture.md)
- [Admin Panel Guide](./docs/admin.md)
- [Deployment Guide](./docs/deployment.md)

## Environment Variables

```bash
# Required (public)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key

# Development only (never bundled)
GEMINI_API_KEY=your_gemini_key

# Server-side only (Supabase Edge Function secrets)
# Never put these in VITE_* variables
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Database Migrations

```bash
# Apply all migrations (run in order)
supabase db push

# Or paste individually in Supabase SQL Editor
```

## Admin Access

```sql
-- Promote a user to super_admin
insert into user_roles (user_id, role)
values ('your-user-uuid', 'super_admin')
on conflict (user_id) do update set role = 'super_admin';
```

## Scripts

```bash
npm run dev              # Start development server
npm run build            # Production build (TypeScript + Vite)
npm run lint             # Lint with oxlint
npm run import-resources # Import resources from JSON manifest
```

## License

Private — All rights reserved.
