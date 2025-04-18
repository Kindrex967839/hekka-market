import { supabase } from './supabaseClient';
import { User } from '@clerk/clerk-react';

/**
 * Gets a Supabase token for the current Clerk user
 * This function should be called after a user signs in with Clerk
 */
export const getSupabaseToken = async (user: User) => {
  if (!user) {
    console.warn('No user provided to getSupabaseToken');
    return null;
  }

  try {
    // Get the JWT token from Clerk with the 'supabase' template
    // This requires setting up a JWT template in Clerk dashboard with the name 'supabase'
    const token = await user.getToken({ template: 'supabase' });

    if (!token) {
      console.warn('No token returned from Clerk');
      return null;
    }

    // Set the auth token in Supabase
    const { data, error } = await supabase.auth.setSession({
      access_token: token as string,
      refresh_token: '',
    });

    if (error) {
      console.error('Error setting Supabase session:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error getting Supabase token:', error);
    return null;
  }
};

/**
 * Creates a user in Supabase Auth using Admin API
 * This is a workaround for direct user creation in Supabase
 * In a production environment, this should be done via a secure backend API
 */
export const createSupabaseUser = async (user: User) => {
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

    // First check if the user already exists in Supabase
    const { data: sessionData } = await getSupabaseToken(user);
    if (sessionData?.user) {
      console.log('User already exists in Supabase');
      return sessionData.user;
    }

    // In a real application, you would call a secure backend endpoint here
    // that would use the Supabase admin API to create the user
    // For now, we'll just try to sign in with the token and let Supabase handle it
    return sessionData?.user;
  } catch (error) {
    console.error('Error creating Supabase user:', error);
    return null;
  }
};

/**
 * Syncs a Clerk user with the Supabase profiles table
 * This should be called when a user signs up or updates their profile
 */
export const syncUserWithSupabase = async (user: User) => {
  if (!user) {
    console.warn('No user provided to syncUserWithSupabase');
    return;
  }

  try {
    // First ensure we have a valid Supabase session and user
    const supabaseUser = await createSupabaseUser(user);

    if (!supabaseUser) {
      console.error('Failed to create or get Supabase user');
      return;
    }

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
    // Check if we already have a session
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
