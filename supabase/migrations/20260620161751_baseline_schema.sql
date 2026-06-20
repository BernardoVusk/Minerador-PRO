-- Baseline migration capturing the schema already present in the linked
-- Supabase project (dryfjdfuxvsdgysezjxp) at the time the CLI was linked.
-- Registered via `supabase migration repair --status applied`, not executed,
-- since these objects already exist remotely.

create table public.agents (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  avatar_url text,
  system_prompt_url text,
  system_prompt text,
  created_at timestamptz not null default timezone('utc'::text, now())
);

alter table public.agents enable row level security;

create policy "Allow public read for agents" on public.agents
  for select to public using (true);
create policy "Allow public insert for agents" on public.agents
  for insert to public with check (true);
create policy "Allow public update for agents" on public.agents
  for update to public using (true);
create policy "Allow public delete for agents" on public.agents
  for delete to public using (true);

create table public.chat_sessions (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid references public.agents(id) on delete cascade,
  title text not null,
  created_at timestamptz not null default timezone('utc'::text, now())
);

alter table public.chat_sessions enable row level security;

create policy "Allow public read for chat_sessions" on public.chat_sessions
  for select to public using (true);
create policy "Allow public insert for chat_sessions" on public.chat_sessions
  for insert to public with check (true);
create policy "Allow public update for chat_sessions" on public.chat_sessions
  for update to public using (true);
create policy "Allow public delete for chat_sessions" on public.chat_sessions
  for delete to public using (true);

create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.chat_sessions(id) on delete cascade,
  role text not null check (role = any (array['user'::text, 'assistant'::text])),
  content text not null,
  created_at timestamptz not null default timezone('utc'::text, now())
);

alter table public.chat_messages enable row level security;

create policy "Allow public read for chat_messages" on public.chat_messages
  for select to public using (true);
create policy "Allow public insert for chat_messages" on public.chat_messages
  for insert to public with check (true);
create policy "Allow public update for chat_messages" on public.chat_messages
  for update to public using (true);
create policy "Allow public delete for chat_messages" on public.chat_messages
  for delete to public using (true);

create table public.creatives (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  name text not null,
  size_kb double precision not null,
  original_size_kb double precision,
  tags text[] default array[]::text[],
  nicho text default 'outros'::text,
  created_at timestamptz not null default timezone('utc'::text, now())
);

alter table public.creatives enable row level security;

create policy "Permitir leitura geral" on public.creatives
  for select to public using (true);
create policy "Permitir inserção geral" on public.creatives
  for insert to public with check (true);
create policy "Permitir deleção geral" on public.creatives
  for delete to public using (true);

create table public.offer_hits (
  id text primary key,
  url text not null,
  domain text not null,
  title text,
  tracker text,
  platform_name text,
  market text,
  nicho text,
  type text,
  score integer,
  rank text,
  scanned_at timestamptz,
  uuid text,
  screenshot_url text,
  created_at timestamptz not null default timezone('utc'::text, now())
);

alter table public.offer_hits enable row level security;

create policy "Public access and modifications" on public.offer_hits
  for all to public using (true) with check (true);

create table public.playbooks (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  passos jsonb not null default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.playbooks enable row level security;

create policy "Permitir controle total para conexões vinculadas" on public.playbooks
  for all to public using (true) with check (true);

create table public.radar_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  created_at timestamptz not null default timezone('utc'::text, now())
);

alter table public.radar_categories enable row level security;

create policy "Allow public read radar_categories" on public.radar_categories
  for select to public using (true);
create policy "Allow public insert radar_categories" on public.radar_categories
  for insert to public with check (true);
create policy "Allow public delete radar_categories" on public.radar_categories
  for delete to public using (true);

create table public.radar_keywords (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.radar_categories(id) on delete cascade,
  word text not null,
  created_at timestamptz not null default timezone('utc'::text, now())
);

alter table public.radar_keywords enable row level security;

create policy "Allow public read radar_keywords" on public.radar_keywords
  for select to public using (true);
create policy "Allow public insert radar_keywords" on public.radar_keywords
  for insert to public with check (true);
create policy "Allow public delete radar_keywords" on public.radar_keywords
  for delete to public using (true);
