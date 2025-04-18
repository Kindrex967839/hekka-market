import { useEffect, useState } from 'react';
import { ensureProductImagesBucket } from 'utils/storageUtils';
import { testSupabaseConnection } from 'utils/supabaseClient';
import { SupabaseBucketGuide } from './SupabaseBucketGuide';

/**
 * Component that initializes Supabase when the app loads
 * This checks if necessary buckets exist
 */
export function SupabaseInitializer() {
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bucketMissing, setBucketMissing] = useState(false);
  const [connectionFailed, setConnectionFailed] = useState(false);

  useEffect(() => {
    async function initializeSupabase() {
      try {
        // First test the connection
        const connectionSuccessful = await testSupabaseConnection();

        if (!connectionSuccessful) {
          setConnectionFailed(true);
          setError('Failed to connect to Supabase. Please check your credentials.');
          return;
        }

        // Check if the bucket exists in localStorage (for cases where RLS prevents listing buckets)
        const forceBucketExists = localStorage.getItem('bucket-exists') === 'true';
        if (forceBucketExists) {
          console.log('Using cached bucket existence from localStorage');
          setInitialized(true);
          return;
        }

        // Check if the product-images bucket exists
        const bucketExists = await ensureProductImagesBucket();

        if (!bucketExists) {
          setBucketMissing(true);
          console.warn('The product-images bucket does not exist in Supabase. Image upload features will not work.');
        } else {
          setInitialized(true);
          // Cache the bucket existence in localStorage
          localStorage.setItem('bucket-exists', 'true');
        }
      } catch (err) {
        console.error('Error initializing Supabase:', err);
        setError('Failed to initialize Supabase. Some features may not work correctly.');
      }
    }

    initializeSupabase();
  }, []);

  if (bucketMissing) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="max-w-2xl w-full">
          <SupabaseBucketGuide />
        </div>
      </div>
    );
  }

  if (connectionFailed) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4 text-red-600">Connection Error</h2>
          <p className="mb-4">
            Failed to connect to Supabase. Please check your credentials in the <code className="bg-gray-100 px-2 py-1 rounded">.env.local</code> file.
          </p>
          <div className="bg-red-50 p-4 rounded-lg border border-red-200 mb-4">
            <p className="font-medium text-red-800">{error}</p>
          </div>
          <p className="text-sm text-gray-600">
            Make sure your Supabase URL and anon key are correct and that your Supabase project is running.
          </p>
        </div>
      </div>
    );
  }

  if (error && !connectionFailed && !bucketMissing) {
    return (
      <div className="fixed bottom-4 right-4 z-50 max-w-md bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-md">
        <div className="flex">
          <div className="py-1">
            <svg className="fill-current h-6 w-6 text-red-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
            </svg>
          </div>
          <div>
            <p className="font-bold">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // If no errors, don't render anything
  return null;
}
