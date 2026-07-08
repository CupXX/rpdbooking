create extension if not exists pgcrypto;

create table if not exists programs (
  id uuid primary key default gen_random_uuid(),
  order_no int not null,
  title text not null,
  song_name text,
  group_name text,
  note text,
  created_at timestamptz default now()
);

create table if not exists dancers (
  id uuid primary key default gen_random_uuid(),
  nickname text unique not null,
  display_name text,
  created_at timestamptz default now()
);

create table if not exists program_dancers (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references programs(id) on delete cascade,
  dancer_id uuid not null references dancers(id) on delete cascade,
  unique (program_id, dancer_id)
);

create table if not exists photographers (
  id uuid primary key default gen_random_uuid(),
  photographer_code text unique not null,
  display_name text not null,
  password_hash text,
  wechat text,
  sample_url text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists photographer_program_status (
  id uuid primary key default gen_random_uuid(),
  photographer_id uuid not null references photographers(id) on delete cascade,
  program_id uuid not null references programs(id) on delete cascade,
  available boolean not null default false,
  updated_at timestamptz default now(),
  unique (photographer_id, program_id)
);

create index if not exists idx_program_dancers_dancer_id on program_dancers(dancer_id);
create index if not exists idx_program_dancers_program_id on program_dancers(program_id);
create index if not exists idx_photographer_program_status_program_id on photographer_program_status(program_id);
create index if not exists idx_photographer_program_status_photographer_id on photographer_program_status(photographer_id);

alter table programs enable row level security;
alter table dancers enable row level security;
alter table program_dancers enable row level security;
alter table photographers enable row level security;
alter table photographer_program_status enable row level security;

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql
set search_path = public;

drop trigger if exists photographers_set_updated_at on photographers;
create trigger photographers_set_updated_at
before update on photographers
for each row execute function set_updated_at();

drop trigger if exists photographer_program_status_set_updated_at on photographer_program_status;
create trigger photographer_program_status_set_updated_at
before update on photographer_program_status
for each row execute function set_updated_at();
