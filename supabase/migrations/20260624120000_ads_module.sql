-- Ads Module Migration
-- Adds 13 tables for the Ads module: account management, insights, products,
-- sales tracking, funnels, pixels, CAPI configs, and webhook handling.

-- 1. ad_accounts
create table public.ad_accounts (
  id uuid primary key default gen_random_uuid(),
  operator text not null,
  fb_account_id text not null,
  name text,
  currency text,
  business_id text,
  status text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  unique (operator, fb_account_id)
);

alter table public.ad_accounts enable row level security;

create policy "ads public all" on public.ad_accounts
  for all to public using (true) with check (true);

-- 2. ad_insights_daily
create table public.ad_insights_daily (
  id uuid primary key default gen_random_uuid(),
  operator text not null,
  level text not null check (level in ('account','campaign','adset','ad')),
  fb_account_id text not null,
  fb_entity_id text not null,
  entity_name text,
  date date not null,
  spend numeric(14,2) default 0,
  impressions bigint default 0,
  reach bigint default 0,
  clicks bigint default 0,
  ctr numeric(8,4),
  cpc numeric(12,4),
  cpm numeric(12,4),
  results integer default 0,
  fb_purchase_value numeric(14,2),
  created_at timestamptz not null default now(),
  unique (operator, level, fb_entity_id, date)
);

create index on ad_insights_daily (operator, date);
create index on ad_insights_daily (operator, fb_entity_id, date);

alter table public.ad_insights_daily enable row level security;

create policy "ads public all" on public.ad_insights_daily
  for all to public using (true) with check (true);

-- 3. products
create table public.products (
  id uuid primary key default gen_random_uuid(),
  operator text not null,
  name text not null,
  ticket_type text check (ticket_type in ('low','high')),
  price numeric(14,2),
  currency text default 'BRL',
  platform text,
  external_product_id text,
  fb_pixel_id text,
  status text default 'active',
  created_at timestamptz not null default now()
);

create index on products (operator);
create index on products (operator, external_product_id);

alter table public.products enable row level security;

create policy "ads public all" on public.products
  for all to public using (true) with check (true);

-- 4. sales
create table public.sales (
  id uuid primary key default gen_random_uuid(),
  operator text not null,
  platform text not null,
  external_order_id text not null,
  product_id uuid references public.products(id) on delete set null,
  external_product_id text,
  status text not null,
  gross_amount numeric(14,2),
  net_amount numeric(14,2),
  fee_amount numeric(14,2),
  currency text default 'BRL',
  buyer_email text,
  buyer_name text,
  buyer_phone text,
  utm_source text, utm_medium text, utm_campaign text, utm_content text, utm_term text,
  fbclid text,
  src text,
  attributed_campaign_id text,
  attributed_adset_id text,
  attributed_ad_id text,
  attribution_model text,
  occurred_at timestamptz not null,
  raw_payload jsonb,
  created_at timestamptz not null default now(),
  unique (operator, platform, external_order_id)
);

create index on sales (operator, occurred_at);
create index on sales (operator, status, occurred_at);
create index on sales (operator, attributed_campaign_id);
create index on sales (operator, product_id);

alter table public.sales enable row level security;

create policy "ads public all" on public.sales
  for all to public using (true) with check (true);

-- 5. sale_items
create table public.sale_items (
  id uuid primary key default gen_random_uuid(),
  operator text not null,
  sale_id uuid not null references public.sales(id) on delete cascade,
  external_product_id text,
  product_id uuid references public.products(id) on delete set null,
  name text,
  amount numeric(14,2),
  quantity integer default 1,
  created_at timestamptz not null default now()
);

create index on sale_items (operator, sale_id);

alter table public.sale_items enable row level security;

create policy "ads public all" on public.sale_items
  for all to public using (true) with check (true);

-- 6. funnels
create table public.funnels (
  id uuid primary key default gen_random_uuid(),
  operator text not null,
  name text not null,
  product_id uuid references public.products(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.funnels enable row level security;

create policy "ads public all" on public.funnels
  for all to public using (true) with check (true);

-- 7. funnel_steps
create table public.funnel_steps (
  id uuid primary key default gen_random_uuid(),
  operator text not null,
  funnel_id uuid not null references public.funnels(id) on delete cascade,
  name text not null,
  event_name text,
  step_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index on funnel_steps (operator, funnel_id, step_order);

alter table public.funnel_steps enable row level security;

create policy "ads public all" on public.funnel_steps
  for all to public using (true) with check (true);

-- 8. pixels
create table public.pixels (
  id uuid primary key default gen_random_uuid(),
  operator text not null,
  name text,
  fb_pixel_id text not null,
  fb_account_id text,
  status text default 'unknown',
  last_event_at timestamptz,
  created_at timestamptz not null default now(),
  unique (operator, fb_pixel_id)
);

alter table public.pixels enable row level security;

create policy "ads public all" on public.pixels
  for all to public using (true) with check (true);

-- 9. capi_configs
create table public.capi_configs (
  id uuid primary key default gen_random_uuid(),
  operator text not null,
  pixel_id uuid references public.pixels(id) on delete cascade,
  fb_pixel_id text not null,
  capi_access_token text not null,
  test_event_code text,
  event_map jsonb default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.capi_configs enable row level security;

create policy "ads public all" on public.capi_configs
  for all to public using (true) with check (true);

-- 10. tracking_events
create table public.tracking_events (
  id uuid primary key default gen_random_uuid(),
  operator text not null,
  event_id text,
  event_name text not null,
  source text not null,
  fb_pixel_id text,
  url text,
  utm_source text, utm_medium text, utm_campaign text, utm_content text, utm_term text,
  fbclid text, fbp text, fbc text,
  client_ip text, user_agent text,
  email_hash text,
  value numeric(14,2), currency text,
  sale_id uuid references public.sales(id) on delete set null,
  capi_sent boolean default false,
  capi_response jsonb,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index on tracking_events (operator, occurred_at);
create index on tracking_events (operator, event_name, occurred_at);
create index on tracking_events (operator, event_id);

alter table public.tracking_events enable row level security;

create policy "ads public all" on public.tracking_events
  for all to public using (true) with check (true);

-- 11. operator_webhook_tokens
create table public.operator_webhook_tokens (
  id uuid primary key default gen_random_uuid(),
  operator text not null,
  token text not null unique,
  created_at timestamptz not null default now()
);

alter table public.operator_webhook_tokens enable row level security;

create policy "ads public all" on public.operator_webhook_tokens
  for all to public using (true) with check (true);

-- 12. webhook_secrets
create table public.webhook_secrets (
  id uuid primary key default gen_random_uuid(),
  operator text not null,
  platform text not null,
  secret text not null,
  created_at timestamptz not null default now(),
  unique (operator, platform)
);

alter table public.webhook_secrets enable row level security;

create policy "ads public all" on public.webhook_secrets
  for all to public using (true) with check (true);

-- 13. webhook_events_raw
create table public.webhook_events_raw (
  id uuid primary key default gen_random_uuid(),
  operator text,
  platform text,
  headers jsonb,
  body jsonb,
  signature_valid boolean,
  processed boolean default false,
  error text,
  created_at timestamptz not null default now()
);

create index on webhook_events_raw (platform, created_at);

alter table public.webhook_events_raw enable row level security;

create policy "ads public all" on public.webhook_events_raw
  for all to public using (true) with check (true);
