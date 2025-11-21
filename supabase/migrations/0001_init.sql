-- ER Diagram (ASCII)
--
--  auth.users (managed by Supabase)
--      | 1
--      |——< profiles (public)
--      |      - user_id (PK/FK → auth.users.id)
--      |
--      |——< generations (public)
--      |      - id (PK)
--      |      - user_id (FK → auth.users.id)
--      |      - language_id (FK → languages.id, nullable)
--      |      - language (cached label)
--      |      - prompt, code, created_at
--      |
-- languages (public)
--   - id (PK)
--   - name (unique)

-- Schema: public
create table if not exists public.languages (
  id bigserial primary key,
  name text not null unique
);

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.generations (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  language text not null,
  language_id bigint references public.languages(id) on delete set null,
  prompt text not null,
  code text not null,
  created_at timestamptz not null default now()
);

-- Indexes for pagination and filtering
create index if not exists generations_user_created_idx on public.generations(user_id, created_at desc);
create index if not exists generations_language_idx on public.generations(language_id);

-- Enable RLS and add policies so users can only see their own rows
alter table public.generations enable row level security;
alter table public.profiles enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'generations' and policyname = 'Allow read own generations'
  ) then
    create policy "Allow read own generations" on public.generations for select using (auth.uid() = user_id);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'generations' and policyname = 'Allow insert own generations'
  ) then
    create policy "Allow insert own generations" on public.generations for insert with check (auth.uid() = user_id);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'profiles' and policyname = 'Allow read own profile'
  ) then
    create policy "Allow read own profile" on public.profiles for select using (auth.uid() = user_id);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'profiles' and policyname = 'Allow upsert own profile'
  ) then
    create policy "Allow upsert own profile" on public.profiles for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
end $$;

-- Seed languages
insert into public.languages(name)
  values ('Python'), ('JavaScript'), ('TypeScript'), ('C++'), ('Java')
on conflict (name) do nothing;
