import { createClient } from '@supabase/supabase-js';
import type { Database } from './supabaseTypes';

// Get Supabase credentials from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Clerk integration state
let tokenFetcher: (() => Promise<string | null>) | null = null;

/**
 * Registers a function that can fetch a fresh Clerk JWT
 */
export const registerTokenFetcher = (fetcher: () => Promise<string | null>) => {
  tokenFetcher = fetcher;
  console.log('Supabase Client: Dynamic token fetcher registered');
};

/**
 * Gets the current token status for diagnostics
 */
export const getSupabaseTokenStatus = async () => {
  if (!tokenFetcher) return { hasFetcher: false, hasToken: false };
  const token = await tokenFetcher();
  return {
    hasFetcher: true,
    hasToken: !!token,
    tokenPreview: token ? token.substring(0, 10) + '...' : null
  };
};

/**
 * Returns true if the client is currently configured with a token fetcher
 */
export const isSupabaseAuthenticated = () => !!tokenFetcher;

// Check if credentials are available
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase credentials are missing. Please check your .env.local file.');
}

// Create the Supabase client with a custom fetch wrapper for Clerk tokens
export const supabase = createClient<Database>(
  supabaseUrl as string,
  supabaseAnonKey as string,
  {
    global: {
      fetch: async (url, options: any = {}) => {
        // If we have a token fetcher, get a fresh token before every request
        if (tokenFetcher) {
          try {
            const token = await tokenFetcher();
            if (token) {
              const headers = new Headers(options.headers);
              headers.set('Authorization', `Bearer ${token}`);
              options.headers = headers;
            }
          } catch (error) {
            console.error('Supabase Client: Failed to fetch fresh token', error);
          }
        }
        return fetch(url, options);
      }
    }
  }
);

// Test the Supabase connection
export const testSupabaseConnection = async () => {
  try {
    console.log('Testing Supabase connection...');
    const { data, error } = await supabase.from('categories').select('count').limit(1);

    if (error) {
      console.error('Supabase connection test failed:', error);
      return false;
    }

    console.log('Supabase connection test successful:', data);
    return true;
  } catch (error) {
    console.error('Exception testing Supabase connection:', error);
    return false;
  }
};
