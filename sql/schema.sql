-- Run this once in Supabase: Project -> SQL Editor -> New query -> paste -> Run

-- One row per signed-up user, mirrors auth.users for convenience
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  created_at timestamptz default now()
);

-- Subscription status, written only by the Stripe webhook (service role)
create table if not exists subscriptions (
  user_id uuid references auth.users on delete cascade primary key,
  stripe_customer_id text,
  stripe_subscription_id text,
  status text default 'none',        -- none | trialing | active | past_due | canceled
  plan text,                          -- monthly | yearly
  current_period_end timestamptz,
  updated_at timestamptz default now()
);

-- The shared workspace: one JSON blob per user holding leads/vendors/projects/proposals/ticker.
-- Simple and fast to ship; can be normalized into real tables later without touching the frontend contract.
create table if not exists workspaces (
  user_id uuid references auth.users on delete cascade primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

alter table profiles enable row level security;
alter table subscriptions enable row level security;
alter table workspaces enable row level security;

-- Profiles: users can read/update their own row
create policy "read own profile" on profiles for select using (auth.uid() = id);
create policy "update own profile" on profiles for update using (auth.uid() = id);

-- Subscriptions: users can only READ their own row. Writes happen only via the
-- Stripe webhook using the service-role key, which bypasses RLS entirely.
create policy "read own subscription" on subscriptions for select using (auth.uid() = user_id);

-- Workspaces: users can fully manage their own row
create policy "manage own workspace" on workspaces for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Auto-create a profile row whenever someone signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email);
  insert into public.workspaces (user_id, data) values (new.id, '{}'::jsonb);
  insert into public.subscriptions (user_id, status) values (new.id, 'none');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
