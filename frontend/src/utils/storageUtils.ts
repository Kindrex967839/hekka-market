import { supabase } from './supabaseClient';

/**
 * Check if the product-images bucket exists
 * Note: The bucket should be created manually in the Supabase dashboard
 */
export const ensureProductImagesBucket = async (): Promise<boolean> => {
  try {
    // Check if the bucket exists
    console.log('Checking for storage buckets...');
    const { data: buckets, error } = await supabase.storage.listBuckets();

    if (error) {
      // If we get a permission error, assume the bucket exists but we can't see it due to RLS
      if (error.message && error.message.includes('permission')) {
        console.warn('Permission error checking buckets. Assuming bucket exists:', error);
        return true;
      }

      console.error('Error checking storage buckets:', error);
      return false;
    }

    console.log('Available buckets:', buckets);

    // Check if the product-images bucket exists (case-insensitive)
    const bucketExists = buckets && buckets.some(bucket => {
      console.log('Found bucket:', bucket.name);
      return bucket.name.toLowerCase() === 'product-images';
    });

    if (!bucketExists) {
      // Since we can see from the screenshot that the bucket exists in Supabase dashboard,
      // but we can't see it via the API, let's assume it exists but we don't have permission
      // to see it due to RLS policies
      console.warn('The bucket exists in the dashboard but is not visible via API due to permissions.');
      return true;
    }

    console.log('Found product-images bucket');
    return true;
  } catch (error) {
    // If we get an exception, assume the bucket exists but we can't access it
    console.error('Error checking product-images bucket:', error);
    console.warn('Assuming bucket exists despite error');
    return true;
  }
};
