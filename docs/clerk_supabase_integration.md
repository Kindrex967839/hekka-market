# Clerk-Supabase Integration Guide

This guide explains how to set up the integration between Clerk (for authentication) and Supabase (for database) in HEKKA MARKET.

## Overview

The integration uses:
- **Clerk** for authentication (sign-up, sign-in, user management)
- **Supabase** as a database (without using Supabase Auth)

## Setup Steps

### 1. Create Supabase Project

1. Go to https://app.supabase.com/
2. Sign in with your account
3. Create a new project
4. Note your project URL and anon key

### 2. Configure Environment Variables

Add your Supabase credentials to `frontend/.env.local`:

```
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
```

### 3. Set Up Supabase Database Schema

Run the following SQL in the Supabase SQL Editor:

```sql
-- Create function to handle updated_at timestamps
create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

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
```

### 4. Create Storage Bucket

1. In Supabase Dashboard, go to Storage
2. Create a new bucket named 'product-images'
3. Set bucket public/private access as needed

### 5. How It Works

1. **User Authentication Flow**:
   - User signs up or signs in using Clerk
   - After successful authentication, the user's profile is synced with Supabase
   - The profile contains the Clerk user ID, which is used to link data in Supabase

2. **Data Access**:
   - The application uses the Supabase client to access data
   - Row-level security policies in Supabase control data access
   - The application logic ensures that only authenticated users can perform certain actions

3. **Components**:
   - `ClerkSupabaseIntegration`: Syncs user data between Clerk and Supabase
   - `userService.ts`: Contains functions for user profile management
   - `useUserProfile`: Custom hook for accessing the current user's profile

## Troubleshooting

- **Profile Not Syncing**: Check if the user's email is verified in Clerk
- **Database Access Issues**: Verify Supabase credentials and RLS policies
- **Authentication Problems**: Ensure Clerk is properly configured

## Additional Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
