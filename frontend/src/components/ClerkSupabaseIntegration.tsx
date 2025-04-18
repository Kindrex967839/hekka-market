import { useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { syncUserProfile } from '../utils/userService';

/**
 * This component handles the integration between Clerk and Supabase.
 * It should be mounted high in the component tree, but below the ClerkProvider.
 */
export function ClerkSupabaseIntegration() {
  const { isLoaded, user } = useUser();
  const { isSignedIn } = useAuth();

  // When the user signs in or out with Clerk, sync with Supabase
  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn && user) {
      // Check if the user's email is verified
      const primaryEmail = user.primaryEmailAddress;
      const isEmailVerified = primaryEmail?.verification?.status === 'verified';

      console.log('User email verification status:', isEmailVerified ? 'Verified' : 'Not verified');

      // Only sync with Supabase if the email is verified
      if (isEmailVerified) {
        syncUserProfile(user).then(profile => {
          if (profile) {
            console.log('Successfully synced user profile with Supabase');
          } else {
            console.error('Failed to sync user profile with Supabase');
          }
        });
      } else {
        console.log('Waiting for email verification before syncing with Supabase');
      }
    }
  }, [isLoaded, isSignedIn, user]);

  // This component doesn't render anything
  return null;
}
