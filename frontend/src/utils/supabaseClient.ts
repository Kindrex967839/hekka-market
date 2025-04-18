import { createClient } from '@supabase/supabase-js';
import type { Database } from './supabaseTypes';

// Get Supabase credentials from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Log the environment variables for debugging
console.log('Supabase environment variables:', {
  url: supabaseUrl,
  key: supabaseAnonKey ? '***' + supabaseAnonKey.substring(supabaseAnonKey.length - 5) : null
});

// Check if credentials are available
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase credentials are missing. Please check your .env.local file.');
}

// Create the Supabase client
export const supabase = createClient<Database>(
  supabaseUrl as string,
  supabaseAnonKey as string
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
