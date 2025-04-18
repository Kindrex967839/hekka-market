-- Create profiles table without auth.users reference
create table profiles (
  id text primary key,
  username text unique not null,
  full_name text,
  avatar_url text,
  email text,
  bio text,
  website text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;

-- Create policy for public read access
create policy "Profiles are viewable by everyone."
  on profiles for select using (true);

-- Create policy for insert/update with Clerk authentication
create policy "Anyone can insert profiles."
  on profiles for insert with check (true);

create policy "Anyone can update profiles."
  on profiles for update using (true);

-- Add trigger for updated_at timestamp
create trigger set_profiles_updated_at
before update on profiles
for each row
execute function handle_updated_at();
