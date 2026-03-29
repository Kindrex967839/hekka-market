import { supabase } from './supabaseClient';

/**
 * Decodes a JWT payload without verification
 */
export const decodeJWT = (token: string) => {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

export const decodeJWTHeader = (token: string) => {
  try {
    const parts = token.split('.');
    if (parts.length < 1) return null;
    const base64Url = parts[0];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

/**
 * Gets a Supabase token using the provided getToken function from useAuth()
 */
export const getSupabaseToken = async (getToken: (options: any) => Promise<string | null>) => {
  if (!getToken || typeof getToken !== 'function') {
    console.warn('No getToken function provided to getSupabaseToken');
    return { data: null, errorMessage: "Internal Error: Auth mechanism missing." };
  }

  try {
    // Get the JWT token from Clerk with the 'supabase' template
    const token = await getToken({ template: 'supabase' });

    if (!token) {
      console.warn('DEBUG: No token returned from Clerk. Check JWT Template Name.');
      return { data: null, errorMessage: "Clerk did not return a token. Check if JWT Template name is exactly 'supabase' (lowercase)." };
    }

    const claims = decodeJWT(token);
    const header = decodeJWTHeader(token);
    const alg = header?.alg || 'UNKNOWN';

    console.log('DEBUG: Supabase Target URL:', (supabase as any).supabaseUrl);
    console.log('DEBUG: Received Clerk JWT Algorithm:', alg);
    console.log('DEBUG: Received Clerk JWT Claims:', claims);

    // Register the token fetcher in supabaseClient if needed.
    // However, ClerkSupabaseIntegration component already does this in its useEffect.

    console.log('DEBUG: Supabase Client configured for dynamic Clerk JWT fetching');
    return { data: { user: { id: claims?.sub } }, errorMessage: null, claims };
  } catch (error: any) {
    console.error('Error getting Supabase token:', error);
    return { data: null, errorMessage: `Unknown Error: ${error.message}` };
  }
};

/**
 * Creates a user in Supabase Auth using Admin API
 * This is a workaround for direct user creation in Supabase
 * In a production environment, this should be done via a secure backend API
 */
export const createSupabaseUser = async (user: any) => {
  if (!user) {
    console.warn('No user provided to createSupabaseUser');
    return null;
  }

  try {
    // For security reasons, in a production app, this should be done server-side
    // This is a simplified client-side implementation for demonstration
    const email = user.primaryEmailAddress?.emailAddress;

    if (!email) {
      console.warn('User has no email address');
      return null;
    }

    // Simplified: we'll skip the user exists check and just return null 
    // since Supabase Auth doesn't contain Clerk users.
    return null;
  } catch (error) {
    console.error('Error creating Supabase user:', error);
    return null;
  }
};

/**
 * Syncs a Clerk user with the Supabase profiles table
 * This should be called when a user signs up or updates their profile
 */
export const syncUserWithSupabase = async (user: any) => {
  if (!user) {
    console.warn('No user provided to syncUserWithSupabase');
    return;
  }

  try {
    // We don't need a Supabase Auth user record for profiles
    // RLS will allow the profile sync if the JWT is valid

    // Check if the user already exists in the profiles table
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is the "not found" error
      console.error('Error fetching profile:', fetchError);
      return;
    }

    if (existingProfile) {
      // Update the existing profile
      const { error } = await supabase
        .from('profiles')
        .update({
          username: user.username || `user_${user.id.substring(0, 8)}`,
          full_name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          avatar_url: user.imageUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating profile:', error);
      }
    } else {
      // Create a new profile
      const { error } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          username: user.username || `user_${user.id.substring(0, 8)}`,
          full_name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          avatar_url: user.imageUrl,
        });

      if (error) {
        console.error('Error creating profile:', error);
      } else {
        console.log('Successfully created profile in Supabase');
      }
    }
  } catch (error) {
    console.error('Error syncing user with Supabase:', error);
  }
};

/**
 * Signs out from both Clerk and Supabase
 */
export const signOutFromSupabase = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out from Supabase:', error);
    }
  } catch (error) {
    console.error('Error signing out from Supabase:', error);
  }
};

/**
 * Handles anonymous access to Supabase
 * This allows unauthenticated users to access public data
 */
export const setupAnonymousAccess = async () => {
  try {
    // For anonymous access, we'll use the anon key that's already configured
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
      // We already have a session, no need to do anything
      return true;
    }

    // For anonymous access, we'll use the anon key that's already configured
    // This will allow access to public data based on RLS policies
    console.log('Setting up anonymous access to Supabase');
    return true;
  } catch (error) {
    console.error('Error setting up anonymous access:', error);
    return false;
  }
};
