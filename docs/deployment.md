# Study Hub — Deployment Guide

## Prerequisites

- Node.js 20+
- Supabase CLI installed (`npm install -g supabase`)
- Supabase account with project at `fmpgcdwmkhpkbpwdhyhm.supabase.co`
- Gemini API key

## Environment Setup

### Development
```bash
# .env (never commit!)
VITE_SUPABASE_URL=https://fmpgcdwmkhpkbpwdhyhm.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
GEMINI_API_KEY=your_gemini_key  # Dev-only, handled by Vite plugin
```

### Production (Hosting Platform)
Set only public variables:
```
VITE_SUPABASE_URL=https://fmpgcdwmkhpkbpwdhyhm.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

**Never set `SUPABASE_SERVICE_ROLE_KEY` or `GEMINI_API_KEY` in the hosting platform's public env vars.**

## Database Migrations

Apply all migrations to Supabase in order:

```bash
# Option 1: Supabase CLI
supabase db push

# Option 2: Supabase Dashboard → SQL Editor
# Paste and run each migration file in order:
# 1. supabase/migrations/20260812_student_core_phase1.sql
# 2. supabase/migrations/20260812_intelligence_engine_phase2.sql
# 3. supabase/migrations/20260812_ecosystem_phase3.sql
# 4. supabase/migrations/20260812_study_ai_chat_history.sql
# 5. supabase/migrations/20260812_production_phase4.sql
# 6. supabase/migrations/20260812_admin_seed.sql (edit to set your user as super_admin)
```

## Edge Functions Deployment

### Set Edge Function Secrets (server-side only)
```bash
supabase secrets set GEMINI_API_KEY=your_gemini_api_key
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Deploy Functions
```bash
# Deploy all functions
supabase functions deploy study-ai
supabase functions deploy admin-stats
supabase functions deploy admin-users
supabase functions deploy data-export
supabase functions deploy account-delete
```

### Verify Deployment
```bash
# Check function status
supabase functions list
```

## Grant Admin Access

After applying migrations, promote your user to super_admin:

```sql
-- Run in Supabase SQL Editor
-- Replace with your actual user UUID (find in Authentication → Users)
insert into user_roles (user_id, role)
values ('YOUR_USER_UUID', 'super_admin')
on conflict (user_id) do update set role = 'super_admin';
```

## Production Build

```bash
# Install dependencies
npm install

# Typecheck
npx tsc --noEmit

# Build
npm run build

# Preview production build locally
npm run preview
```

The build outputs to `dist/`. Deploy this directory to your hosting platform.

## Hosting Options

### Vercel (Recommended)
```bash
npm install -g vercel
vercel --prod
```

Set env vars in Vercel Dashboard → Project → Settings → Environment Variables.

Add `vercel.json` for SPA routing:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### Netlify
Deploy `dist/` directory.

Add `public/_redirects`:
```
/*  /index.html  200
```

Set env vars in Netlify Dashboard → Site → Site Configuration → Environment Variables.

## Security Headers

Add these headers in your hosting platform:

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://apis.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co https://generativelanguage.googleapis.com wss://*.supabase.co; font-src 'self' https://fonts.gstatic.com; frame-src https://cal.com https://calendar.google.com;
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

**Test each header**: Use [securityheaders.com](https://securityheaders.com) to verify.

## Resource Import

After deployment, import resources:
```bash
# First time
node scripts/import-resources-to-supabase.js

# Second run — duplicates are skipped automatically
node scripts/import-resources-to-supabase.js
```

## Post-Deployment Checklist

- [ ] All migrations applied successfully
- [ ] Edge Functions deployed with secrets set
- [ ] First super_admin user promoted
- [ ] Admin console accessible at /admin
- [ ] Student role correctly denied at /admin
- [ ] Resources visible in Studio (status='published')
- [ ] StudyMate AI responding correctly
- [ ] PWA installable
- [ ] robots.txt accessible
- [ ] sitemap.xml accessible
- [ ] OG tags working (test with [opengraph.xyz](https://opengraph.xyz))

## Rollback

If a migration breaks something:
1. Find the breaking migration
2. Write a rollback SQL script (drop new tables/columns)
3. Apply rollback in Supabase SQL Editor
4. Fix the migration and re-apply

## Support

- Supabase docs: https://supabase.com/docs
- Gemini API docs: https://ai.google.dev/gemini-api/docs
