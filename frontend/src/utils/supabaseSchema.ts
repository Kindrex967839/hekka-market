/**
 * Supabase SQL Schema for HEKKA MARKET
 *
 * This file contains SQL scripts that can be copied and pasted into the Supabase SQL Editor
 * to set up the database schema for the HEKKA MARKET digital marketplace.
 *
 * How to use:
 * 1. Create a new Supabase project at https://app.supabase.com/
 * 2. Go to the SQL Editor in your Supabase project
 * 3. Copy each SQL script below and run it in the SQL Editor
 * 4. Update the supabaseClient.ts file with your Supabase URL and anon key
 */

// SQL script to set up the handle_updated_at function for timestamps
export const setupTimestampFunction = `
-- Create function to handle updated_at timestamps
create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;
`;

// SQL script to create the profiles table
export const createProfilesTable = `
-- Create profiles table that extends the default Supabase auth.users
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  full_name text,
  avatar_url text,
  bio text,
  website text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;

-- Create policies
-- Public profiles are viewable by everyone
create policy "Public profiles are viewable by everyone."
  on profiles for select using (true);

-- Users can insert their own profile
create policy "Users can insert their own profile."
  on profiles for insert with check (auth.uid() = id);

-- Users can update own profile
create policy "Users can update own profile."
  on profiles for update using (auth.uid() = id);

-- Add trigger to profiles table
create trigger set_profiles_updated_at
before update on profiles
for each row
execute function handle_updated_at();
`;

// SQL script to create the categories table
export const createCategoriesTable = `
-- Create categories table
create table categories (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  description text,
  created_at timestamp with time zone default now() not null
);

-- Set up Row Level Security (RLS)
alter table categories enable row level security;

-- Create policies
-- Categories are viewable by everyone
create policy "Categories are viewable by everyone."
  on categories for select using (true);

-- Note: You may want to add admin-only policies for insert/update/delete later
`;

// SQL script to create the products table
export const createProductsTable = `
-- Create products table
create table products (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text not null,
  price numeric not null check (price >= 0),
  category_id uuid references categories not null,
  seller_id uuid references auth.users not null,
  is_published boolean default false,
  product_type text not null, -- 'digital_download', 'subscription', etc.
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Set up Row Level Security (RLS)
alter table products enable row level security;

-- Create policies
-- Published products are viewable by everyone
create policy "Published products are viewable by everyone."
  on products for select using (is_published = true);

-- Sellers can view all their own products (published or not)
create policy "Sellers can view all their own products."
  on products for select using (seller_id = auth.uid());

-- Sellers can insert their own products
create policy "Sellers can insert their own products."
  on products for insert with check (seller_id = auth.uid());

-- Sellers can update their own products
create policy "Sellers can update their own products."
  on products for update using (seller_id = auth.uid());

-- Sellers can delete their own products
create policy "Sellers can delete their own products."
  on products for delete using (seller_id = auth.uid());

-- Add trigger to products table
create trigger set_products_updated_at
before update on products
for each row
execute function handle_updated_at();
`;

// SQL script to create the product_images table
export const createProductImagesTable = `
-- Create product_images table
create table product_images (
  id uuid default gen_random_uuid() primary key,
  product_id uuid references products on delete cascade not null,
  storage_path text not null,
  display_order int not null default 0,
  created_at timestamp with time zone default now() not null
);

-- Set up Row Level Security (RLS)
alter table product_images enable row level security;

-- Create policies
-- Images of published products are viewable by everyone
create policy "Images of published products are viewable by everyone."
  on product_images for select
  using (
    exists (
      select 1 from products
      where products.id = product_images.product_id
      and products.is_published = true
    )
  );

-- Sellers can view images of their own products
create policy "Sellers can view images of their own products."
  on product_images for select
  using (
    exists (
      select 1 from products
      where products.id = product_images.product_id
      and products.seller_id = auth.uid()
    )
  );

-- Sellers can insert images for their own products
create policy "Sellers can insert images for their own products."
  on product_images for insert
  with check (
    exists (
      select 1 from products
      where products.id = product_images.product_id
      and products.seller_id = auth.uid()
    )
  );

-- Sellers can update images for their own products
create policy "Sellers can update images for their own products."
  on product_images for update
  using (
    exists (
      select 1 from products
      where products.id = product_images.product_id
      and products.seller_id = auth.uid()
    )
  );

-- Sellers can delete images for their own products
create policy "Sellers can delete images for their own products."
  on product_images for delete
  using (
    exists (
      select 1 from products
      where products.id = product_images.product_id
      and products.seller_id = auth.uid()
    )
  );
`;

// SQL script to create the messages table
export const createMessagesTable = `
-- Create messages table
create table messages (
  id uuid default gen_random_uuid() primary key,
  sender_id uuid references auth.users not null,
  recipient_id uuid references auth.users not null,
  content text not null,
  is_read boolean default false,
  created_at timestamp with time zone default now() not null
);

-- Set up Row Level Security (RLS)
alter table messages enable row level security;

-- Create policies
-- Users can view messages they've sent or received
create policy "Users can view messages they've sent or received."
  on messages for select
  using (sender_id = auth.uid() or recipient_id = auth.uid());

-- Users can send messages (insert)
create policy "Users can send messages."
  on messages for insert with check (sender_id = auth.uid());

-- Users can mark messages as read if they are the recipient
create policy "Users can mark messages as read if they are the recipient."
  on messages for update
  using (recipient_id = auth.uid())
  with check (is_read = true);

-- Users can delete messages they've sent or received
create policy "Users can delete messages they've sent or received."
  on messages for delete
  using (sender_id = auth.uid() or recipient_id = auth.uid());
`;

// SQL script to create the purchases table
export const createPurchasesTable = `
-- Create purchases table
create table purchases (
  id uuid default gen_random_uuid() primary key,
  product_id uuid references products not null,
  buyer_id uuid references auth.users not null,
  transaction_id text not null, -- from payment processor (Lemon Squeezy)
  amount numeric not null,
  status text not null, -- 'completed', 'refunded', etc.
  created_at timestamp with time zone default now() not null
);

-- Set up Row Level Security (RLS)
alter table purchases enable row level security;

-- Create policies
-- Buyers can view their own purchases
create policy "Buyers can view their own purchases."
  on purchases for select using (buyer_id = auth.uid());

-- Sellers can view purchases of their products
create policy "Sellers can view purchases of their products."
  on purchases for select
  using (
    exists (
      select 1 from products
      where products.id = purchases.product_id
      and products.seller_id = auth.uid()
    )
  );

-- Only system can insert purchases (implement via server functions later)
`;

// SQL script to create indexes for improved performance
export const createIndexes = `
-- Indexes for faster querying
create index idx_products_category_id on products(category_id);
create index idx_products_seller_id on products(seller_id);
create index idx_products_is_published on products(is_published);
create index idx_product_images_product_id on product_images(product_id);
create index idx_purchases_product_id on purchases(product_id);
create index idx_purchases_buyer_id on purchases(buyer_id);
create index idx_messages_sender_id on messages(sender_id);
create index idx_messages_recipient_id on messages(recipient_id);
create index idx_messages_created_at on messages(created_at);
`;

// SQL script to create storage policies
export const createStoragePolicies = `
-- First create a bucket for product images
-- Note: This should be done through the Supabase dashboard first

-- Then set up policies for the bucket
-- Allow public access to view product images
create policy "Public read access for product images."
on storage.objects for select
using (bucket_id = 'product-images');

-- Allow authenticated users to upload images
create policy "Users can upload product images."
on storage.objects for insert
with check (bucket_id = 'product-images' and auth.role() = 'authenticated');

-- Allow users to update their own images
create policy "Users can update their own product images."
on storage.objects for update
using (bucket_id = 'product-images' and auth.role() = 'authenticated')
with check (bucket_id = 'product-images');

-- Allow users to delete their own images
create policy "Users can delete their own product images."
on storage.objects for delete
using (bucket_id = 'product-images' and auth.role() = 'authenticated');

-- Allow authenticated users to view buckets
create policy "Authenticated users can view buckets."
on storage.buckets for select
using (auth.role() = 'authenticated');
`;

// Initial data for categories to get started
export const seedCategories = `
-- Insert initial categories
insert into categories (name, description) values
('Digital Art', 'Digital artwork, illustrations, and designs'),
('Templates', 'Website templates, document templates, and design templates'),
('E-books', 'Digital books, guides, and educational materials'),
('Software', 'Applications, plugins, and software tools'),
('Music', 'Audio tracks, sound effects, and music files'),
('Courses', 'Online courses, tutorials, and educational content'),
('Photography', 'Stock photos, photo packs, and digital photography'),
('Graphics', 'Icons, UI elements, and graphic design assets');
`;
