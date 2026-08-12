# Admin Panel — Study Hub

## Overview

The Study Hub Admin Console (`/admin`) is a protected content operations center for managing all platform content, users, and system health. It is NOT accessible to students.

## Access Levels

| Role | What They Can Do |
|---|---|
| `moderator` | View Reports, Moderation Center, Audit Log, Community Management |
| `content_editor` | + Resources CMS, Question Bank, Exam Config, Roadmaps, Mock Tests, Announcements |
| `admin` | + User Management, AI Panel, Analytics, System Health |
| `super_admin` | + Settings, Feature Flags, All of the above |

## Granting Admin Access

**Step 1**: Get the user's UUID from Supabase Dashboard → Authentication → Users

**Step 2**: Run this SQL in Supabase SQL Editor:
```sql
insert into user_roles (user_id, role)
values ('USER_UUID_HERE', 'admin')
on conflict (user_id) do update set role = 'admin';
```

Valid roles: `student`, `moderator`, `content_editor`, `admin`, `super_admin`

**Step 3**: The user must refresh their browser. Role changes take effect immediately.

## Admin Navigation

| Section | URL | Min Role |
|---|---|---|
| Dashboard | /admin | moderator |
| Users | /admin/users | admin |
| Resources | /admin/resources | content_editor |
| Resource Health | /admin/resources/health | content_editor |
| Question Bank | /admin/questions | content_editor |
| Exam Config | /admin/exams | content_editor |
| Roadmaps | /admin/roadmaps | content_editor |
| Mock Tests | /admin/mock-tests | content_editor |
| Community | /admin/community | moderator |
| Reports | /admin/reports | moderator |
| StudyMate AI | /admin/study-ai | admin |
| Announcements | /admin/announcements | content_editor |
| Analytics | /admin/analytics | admin |
| System Health | /admin/system | admin |
| Audit Log | /admin/audit-log | moderator |
| Settings | /admin/settings | super_admin |

## Content Workflows

### Adding a Resource
1. Go to /admin/resources
2. Click "Add Resource"
3. Fill in all required fields
4. Set Status to "draft" while preparing
5. Set Status to "review" when ready for review
6. Set Status to "published" to make it visible in Studio
7. Students only see `published` resources

### Resource Status Flow
```
draft → review → published → archived
                           → rejected
```

### Adding a Question
1. Go to /admin/questions
2. Click "Add Question"
3. Fill in question details
4. Set Review Status to "pending_review"
5. Review and set to "approved" to make it available in practice
6. Students only see `review_status = 'approved'` questions

### AI-Generated Questions
- Always set `source_type = 'ai_generated'`
- Always set `review_status = 'pending_review'`
- Must be manually reviewed and approved
- Will always display "AI-generated practice" label to students

### Publishing a Mock Test
1. Create test in /admin/mock-tests
2. Add questions (fixed set or random selection)
3. Click "Validate" — checks for missing answers, correct counts, scoring rules
4. Set status to "published" only after validation passes

## Moderation Flow

1. Student reports content → appears in /admin/reports with status "pending"
2. Moderator reviews report and content
3. Takes action: Dismiss / Remove Content / Warn User / Suspend User / Block / Escalate
4. Every action creates an audit log entry automatically
5. Report status changes to: investigating → resolved / dismissed

## Audit Log

- All admin actions are recorded automatically
- Cannot be edited or deleted
- View at /admin/audit-log
- Fields: Actor, Role, Action, Target, Before State, After State, Reason, Timestamp

## Feature Flags

Control feature availability from /admin/system:

| Flag | Default | Description |
|---|---|---|
| `study_ai` | true | StudyMate AI enabled |
| `community` | true | Community & Circles enabled |
| `mock_tests` | true | Mock tests visible |
| `premium_features` | false | Premium/paid features |
| `maintenance_mode` | false | Global maintenance mode |

**Warning**: Setting `maintenance_mode = true` will block ALL student access. Admin users are not blocked.

## Announcements

Create targeted announcements at /admin/announcements:
- **Audience**: All | GATE | JEE | NEET | CUET | Circle
- **Priority**: Low | Normal | High | Critical
- **Scheduling**: Set start_time and end_time for time-limited announcements
- **CTA**: Optional call-to-action button with text and URL
