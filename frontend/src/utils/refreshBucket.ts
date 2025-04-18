import { supabase } from './supabaseClient';

/**
 * Force check if the product-images bucket exists and return detailed information
 */
export const checkBucketExists = async (): Promise<{
  exists: boolean;
  buckets: string[];
  error?: any;
}> => {
  try {
    // Check if the bucket exists
    const { data: buckets, error } = await supabase.storage.listBuckets();

    if (error) {
      console.error('Error checking storage buckets:', error);

      // If we get a permission error, check if we can upload to the bucket directly
      if (error.message && (error.message.includes('permission') || error.message.includes('policy'))) {
        console.warn('Permission error checking buckets. Trying to test upload...');

        try {
          // Create a small test file
          const testFile = new File(['test content'], 'test-file.txt', { type: 'text/plain' });

          // Try to upload to the bucket
          const { data, error: uploadError } = await supabase.storage
            .from('product-images')
            .upload('test-upload.txt', testFile, { upsert: true });

          if (!uploadError) {
            console.log('Test upload successful! Bucket exists but is hidden due to RLS.');
            return {
              exists: true,
              buckets: ['product-images (hidden by RLS)'],
              error: undefined
            };
          }
        } catch (uploadError) {
          console.error('Test upload failed:', uploadError);
        }
      }

      return { exists: false, buckets: [], error };
    }

    // Log all bucket names
    const bucketNames = buckets.map(bucket => bucket.name);
    console.log('All bucket names:', bucketNames);

    // Check if the product-images bucket exists (case-insensitive)
    const bucketExists = buckets.some(bucket =>
      bucket.name.toLowerCase() === 'product-images'
    );

    return {
      exists: bucketExists,
      buckets: bucketNames,
      error: undefined
    };
  } catch (error) {
    console.error('Error checking product-images bucket:', error);
    return { exists: false, buckets: [], error };
  }
};

/**
 * Try to create the product-images bucket
 */
export const createProductImagesBucket = async (): Promise<{
  success: boolean;
  error?: any;
}> => {
  try {
    // Try to create the bucket
    const { error } = await supabase.storage.createBucket('product-images', {
      public: true, // Make the bucket public
    });

    if (error) {
      console.error('Error creating product-images bucket:', error);
      return { success: false, error };
    }

    console.log('Successfully created product-images bucket');
    return { success: true };
  } catch (error) {
    console.error('Exception creating product-images bucket:', error);
    return { success: false, error };
  }
};
