-- HEKKA MARKET SQL Implementation Guide
-- Execute these scripts in order in the Supabase SQL Editor

-- 1. Setup Timestamp Function
create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- 2. Create Profiles Table
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

-- 3. Create Products Table
create table products (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text not null,
  price numeric not null check (price >= 0),
  category_id uuid references categories not null,
  seller_id uuid references auth.users not null,
  is_published boolean default false,
  product_type text not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- 4. Enable RLS on Products
alter table products enable row level security;

-- 5. Create Product Policies
create policy "Published products are viewable by everyone."
  on products for select using (is_published = true);

create policy "Sellers can view all their own products."
  on products for select using (seller_id = auth.uid());

create policy "Sellers can insert their own products."
  on products for insert with check (seller_id = auth.uid());

create policy "Sellers can update their own products."
  on products for update using (seller_id = auth.uid());

-- 6. Create Product Images Policies
alter table product_images enable row level security;

create policy "Images of published products are viewable by everyone."
  on product_images for select
  using (
    exists (
      select 1 from products
      where products.id = product_images.product_id
      and products.is_published = true
    )
  );

create policy "Sellers can view images of their own products."
  on product_images for select
  using (
    exists (
      select 1 from products
      where products.id = product_images.product_id
      and products.seller_id = auth.uid()
    )
  );

-- 7. Create Messages Policies
alter table messages enable row level security;

create policy "Users can view messages they've sent or received."
  on messages for select
  using (sender_id = auth.uid() or recipient_id = auth.uid());

create policy "Users can send messages."
  on messages for insert with check (sender_id = auth.uid());

create policy "Users can mark messages as read if they are the recipient."
  on messages for update
  using (recipient_id = auth.uid())
  with check (is_read = true);

-- 8. Create Performance Indexes
create index idx_products_category_id on products(category_id);
create index idx_products_seller_id on products(seller_id);
create index idx_products_is_published on products(is_published);
create index idx_product_images_product_id on product_images(product_id);
create index idx_purchases_product_id on purchases(product_id);
create index idx_purchases_buyer_id on purchases(buyer_id);
create index idx_messages_sender_id on messages(sender_id);
create index idx_messages_recipient_id on messages(recipient_id);
create index idx_messages_created_at on messages(created_at);

-- 9. Create Storage Policies
create policy "Public read access for product images."
on storage.objects for select
using (bucket_id = 'product-images');

create policy "Users can upload product images."
on storage.objects for insert
with check (bucket_id = 'product-images' and auth.role() = 'authenticated');