/**
 * This file contains SQL scripts to set up RLS policies for Supabase storage
 * These should be run in the Supabase SQL editor
 */

// SQL script to create storage policies for the product-images bucket
export const createProductImagesPolicies = `
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
`;

// SQL script to create storage policies for the buckets table
export const createBucketsPolicies = `
-- Allow authenticated users to view buckets
create policy "Authenticated users can view buckets."
on storage.buckets for select
using (auth.role() = 'authenticated');
`;
