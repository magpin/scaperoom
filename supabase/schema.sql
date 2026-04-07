create extension if not exists pgcrypto;

create table if not exists rooms (
  room_id uuid primary key default gen_random_uuid(),
  room_code text not null unique,
  host_name text not null,
  status text not null default 'waiting',
  created_at timestamptz not null default now(),
  started_at timestamptz,
  finished_at timestamptz,
  final_code text
);

create table if not exists players (
  player_id uuid primary key default gen_random_uuid(),
  room_id uuid not null references rooms(room_id) on delete cascade,
  player_name text not null,
  is_host boolean not null default false,
  joined_at timestamptz not null default now(),
  last_active_at timestamptz,
  current_level int not null default 0,
  score int not null default 0,
  completed boolean not null default false
);

create table if not exists player_progress (
  progress_id uuid primary key default gen_random_uuid(),
  player_id uuid not null references players(player_id) on delete cascade,
  room_id uuid not null references rooms(room_id) on delete cascade,
  story_seen boolean not null default false,
  reading_seen boolean not null default false,
  level_1_status text not null default 'pending',
  level_2_status text not null default 'pending',
  level_3_status text not null default 'pending',
  level_4_status text not null default 'pending',
  key_fragments text[] not null default '{}',
  final_code text,
  score int not null default 0,
  elapsed_seconds int not null default 0,
  updated_at timestamptz not null default now(),
  unique (player_id, room_id)
);

create table if not exists attempts (
  attempt_id uuid primary key default gen_random_uuid(),
  player_id uuid not null references players(player_id) on delete cascade,
  room_id uuid not null references rooms(room_id) on delete cascade,
  level int not null,
  selected_option text not null,
  is_correct boolean not null,
  response_time_ms int,
  created_at timestamptz not null default now()
);
