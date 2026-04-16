-- SetDrop schema
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- Sessions
create table if not exists sessions (
  id         uuid primary key default gen_random_uuid(),
  artist_id  uuid references auth.users(id) not null,
  code       char(6) unique not null,
  is_active  boolean default true,
  created_at timestamptz default now()
);

-- Song requests queue
create table if not exists requests (
  id             uuid primary key default gen_random_uuid(),
  session_id     uuid references sessions(id) on delete cascade not null,
  song_title     text not null check (char_length(song_title) <= 140),
  requester_name text default 'Anonymous',
  upvotes        int default 0,
  played_at      timestamptz,
  created_at     timestamptz default now(),
  fingerprint    text
);

-- Votes (1 per fingerprint per request — deduped by unique constraint)
create table if not exists votes (
  id          uuid primary key default gen_random_uuid(),
  request_id  uuid references requests(id) on delete cascade not null,
  fingerprint text not null,
  created_at  timestamptz default now(),
  unique(request_id, fingerprint)
);

-- Reactions (ephemeral bursts for overlay)
create table if not exists reactions (
  id         uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade not null,
  type       text not null check (type in ('fire', 'heart', 'music')),
  created_at timestamptz default now()
);

-- Indexes for common query patterns
create index if not exists idx_requests_session
  on requests(session_id) where played_at is null;

create index if not exists idx_votes_request
  on votes(request_id);

create index if not exists idx_reactions_session_recent
  on reactions(session_id, created_at desc);

create index if not exists idx_sessions_code
  on sessions(code) where is_active = true;

-- RPC: atomically increment upvote count
-- Uses security definer so unauthenticated fans can call it via API route
create or replace function increment_upvote(request_id uuid)
returns void
language sql
security definer
as $$
  update requests
  set upvotes = upvotes + 1
  where id = request_id;
$$;

-- ============================================================
-- Row Level Security
-- ============================================================

alter table sessions  enable row level security;
alter table requests  enable row level security;
alter table votes     enable row level security;
alter table reactions enable row level security;

-- Sessions: artist manages own; public can read active ones (for /join/[code])
drop policy if exists "artist_manage_sessions" on sessions;
create policy "artist_manage_sessions"
  on sessions for all
  using (artist_id = auth.uid())
  with check (artist_id = auth.uid());

drop policy if exists "public_read_active_sessions" on sessions;
create policy "public_read_active_sessions"
  on sessions for select
  using (is_active = true);

-- Requests: anyone inserts (fans); artist updates (mark played); everyone reads
drop policy if exists "anyone_insert_requests" on requests;
create policy "anyone_insert_requests"
  on requests for insert
  with check (true);

drop policy if exists "artist_update_requests" on requests;
create policy "artist_update_requests"
  on requests for update
  using (
    exists (
      select 1 from sessions s
      where s.id = session_id and s.artist_id = auth.uid()
    )
  );

drop policy if exists "public_read_requests" on requests;
create policy "public_read_requests"
  on requests for select
  using (true);

-- Votes: anyone inserts; unique constraint handles dedup; everyone reads
drop policy if exists "anyone_insert_votes" on votes;
create policy "anyone_insert_votes"
  on votes for insert
  with check (true);

drop policy if exists "public_read_votes" on votes;
create policy "public_read_votes"
  on votes for select
  using (true);

-- Reactions: anyone inserts; everyone reads
drop policy if exists "anyone_insert_reactions" on reactions;
create policy "anyone_insert_reactions"
  on reactions for insert
  with check (true);

drop policy if exists "public_read_reactions" on reactions;
create policy "public_read_reactions"
  on reactions for select
  using (true);

-- ============================================================
-- Realtime
-- Enable Supabase Realtime on these tables so clients can subscribe.
-- Run this AFTER the tables are created.
-- ============================================================

-- Note: supabase_realtime publication may already exist.
-- Run each line separately if needed.
alter publication supabase_realtime add table requests;
alter publication supabase_realtime add table votes;
alter publication supabase_realtime add table reactions;
alter publication supabase_realtime add table sessions;
