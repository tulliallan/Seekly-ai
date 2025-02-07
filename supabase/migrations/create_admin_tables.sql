-- Drop existing trigger and function if they exist
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- Create custom users table if not exists
create table if not exists public.users (
  id uuid references auth.users on delete cascade primary key,
  email text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  is_banned boolean default false,
  ban_reason text,
  strikes integer default 0,
  last_active timestamp with time zone
);

-- Create admins table if not exists
create table if not exists public.admins (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  email text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create admin_logs table if not exists
create table if not exists public.admin_logs (
  id uuid default uuid_generate_v4() primary key,
  admin_id uuid references auth.users(id) on delete cascade,
  action text not null,
  target_user_id uuid references auth.users(id) on delete cascade,
  details text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create a trigger to automatically add new users to the users table
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.users (id, email, created_at)
  values (new.id, new.email, new.created_at);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Set up RLS (Row Level Security) policies
alter table public.users enable row level security;
alter table public.admins enable row level security;
alter table public.admin_logs enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Users can view their own data" on public.users;
drop policy if exists "Admins can view all users" on public.users;
drop policy if exists "Admins can update users" on public.users;
drop policy if exists "Admins can view admin list" on public.admins;
drop policy if exists "Only super admins can create new admins" on public.admins;
drop policy if exists "Admins can view logs" on public.admin_logs;
drop policy if exists "Admins can create logs" on public.admin_logs;

-- Users table policies
create policy "Users can view their own data"
  on public.users for select
  using (auth.uid() = id);

create policy "Admins can view all users"
  on public.users for select
  using (
    exists (
      select 1 from public.admins
      where user_id = auth.uid()
    )
  );

create policy "Admins can update users"
  on public.users for update
  using (
    exists (
      select 1 from public.admins
      where user_id = auth.uid()
    )
  );

-- Admins table policies
create policy "Admins can view admin list"
  on public.admins for select
  using (
    exists (
      select 1 from public.admins
      where user_id = auth.uid()
    )
  );

create policy "Only super admins can create new admins"
  on public.admins for insert
  using (
    exists (
      select 1 from public.admins
      where user_id = auth.uid()
    )
  );

-- Admin logs policies
create policy "Admins can view logs"
  on public.admin_logs for select
  using (
    exists (
      select 1 from public.admins
      where user_id = auth.uid()
    )
  );

create policy "Admins can create logs"
  on public.admin_logs for insert
  using (
    exists (
      select 1 from public.admins
      where user_id = auth.uid()
    )
  ); 