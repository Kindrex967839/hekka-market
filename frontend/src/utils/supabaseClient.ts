import { createClient } from '@supabase/supabase-js';
import type { Database } from './supabaseTypes';

// Get Supabase credentials from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Clerk integration state
let currentClerkToken: string | null = null;

/**
 * Sets the Clerk JWT for all future Supabase requests
 */
export const setSupabaseToken = (token: string | null) => {
  currentClerkToken = token;
  console.log('Supabase Client: Token updated', token ? '(Authenticated)' : '(Anonymous)');
};

/**
 * Gets the current token status for diagnostics
 */
export const getSupabaseTokenStatus = () => ({
  hasToken: !!currentClerkToken,
  tokenPreview: currentClerkToken ? currentClerkToken.substring(0, 10) + '...' : null
});

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
      fetch: (url, options: any = {}) => {
        // If we have a Clerk token, inject it into the headers
        // This bypasses Supabase Auth service and talks directly to the DB with the Clerk JWT
        if (currentClerkToken) {
          const headers = new Headers(options.headers);
          headers.set('Authorization', `Bearer ${currentClerkToken}`);
          options.headers = headers;
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
