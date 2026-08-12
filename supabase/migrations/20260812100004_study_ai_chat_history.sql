-- Migration: 20260812_study_ai_chat_history.sql
-- Description: Create study_ai_chats and study_ai_messages tables with RLS policies and performance indexes

-- 1. Table: study_ai_chats
create table if not exists study_ai_chats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'New study session',
  exam text,
  subject text,
  mode text default 'Explain',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes for study_ai_chats
create index if not exists idx_study_ai_chats_user_id
on study_ai_chats(user_id);

create index if not exists idx_study_ai_chats_updated_at
on study_ai_chats(updated_at desc);

-- 2. Table: study_ai_messages
create table if not exists study_ai_messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references study_ai_chats(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  status text not null default 'complete',
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Indexes for study_ai_messages
create index if not exists idx_study_ai_messages_chat_id
on study_ai_messages(chat_id);

create index if not exists idx_study_ai_messages_created_at
on study_ai_messages(created_at);

-- 3. Row Level Security (RLS)
alter table study_ai_chats enable row level security;
alter table study_ai_messages enable row level security;

-- Policies for study_ai_chats
drop policy if exists "Users can view their own Study AI chats" on study_ai_chats;
create policy "Users can view their own Study AI chats"
on study_ai_chats
for select
using (auth.uid() = user_id);

drop policy if exists "Users can create their own Study AI chats" on study_ai_chats;
create policy "Users can create their own Study AI chats"
on study_ai_chats
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own Study AI chats" on study_ai_chats;
create policy "Users can update their own Study AI chats"
on study_ai_chats
for update
using (auth.uid() = user_id);

drop policy if exists "Users can delete their own Study AI chats" on study_ai_chats;
create policy "Users can delete their own Study AI chats"
on study_ai_chats
for delete
using (auth.uid() = user_id);

-- Policies for study_ai_messages
drop policy if exists "Users can view their own Study AI messages" on study_ai_messages;
create policy "Users can view their own Study AI messages"
on study_ai_messages
for select
using (auth.uid() = user_id);

drop policy if exists "Users can create their own Study AI messages" on study_ai_messages;
create policy "Users can create their own Study AI messages"
on study_ai_messages
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own Study AI messages" on study_ai_messages;
create policy "Users can delete their own Study AI messages"
on study_ai_messages
for delete
using (auth.uid() = user_id);
