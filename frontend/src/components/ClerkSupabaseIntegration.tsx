import { useEffect, useState } from 'react';
import { useUser, useAuth, useClerk } from '@clerk/clerk-react';
import { syncUserProfile } from '../utils/userService';
import { getSupabaseToken, setupAnonymousAccess } from '../utils/clerkSupabaseIntegration';

/**
 * This component handles the integration between Clerk and Supabase.
 * It should be mounted high in the component tree, but below the ClerkProvider.
 */
export function ClerkSupabaseIntegration() {
  const { isLoaded, user } = useUser();
  const { isSignedIn } = useAuth();
  const clerk = useClerk();
  const [lastVerificationStatus, setLastVerificationStatus] = useState<string | null>(null);

  // When the user signs in or out with Clerk, sync with Supabase
  useEffect(() => {
    if (!isLoaded) return;

    const handleAuthState = async () => {
      if (isSignedIn && user) {
        // Check if the user's email is verified
        const primaryEmail = user.primaryEmailAddress;
        const isEmailVerified = primaryEmail?.verification?.status === 'verified';
        const currentStatus = primaryEmail?.verification?.status || 'unknown';

        console.log('User email verification status:', isEmailVerified ? 'Verified' : 'Not verified');

        // Check if verification status has changed
        if (lastVerificationStatus !== currentStatus) {
          setLastVerificationStatus(currentStatus);

          // If newly verified, force a session refresh
          if (isEmailVerified && lastVerificationStatus !== 'verified' && clerk && clerk.session) {
            console.log('Email verification status changed to verified, refreshing session...');
            // Force a session refresh to ensure the UI updates
            try {
              await clerk.session.refresh();
              console.log('Session refreshed after email verification');

              // Get a Supabase token and set up the session
              const sessionData = await getSupabaseToken(user);
              if (sessionData) {
                console.log('Successfully set up Supabase session with Clerk token');
              } else {
                console.error('Failed to set up Supabase session with Clerk token');
              }
            } catch (error) {
              console.error('Error accessing clerk.session:', error);
            }
          }
        }

        // Only sync with Supabase if the email is verified
        if (isEmailVerified) {
          // Get a Supabase token and set up the session
          const sessionData = await getSupabaseToken(user);
          if (!sessionData) {
            console.error('Failed to get Supabase token');
          }

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
      } else {
        // User is not signed in, set up anonymous access
        await setupAnonymousAccess();
      }
    };

    handleAuthState();
  }, [isLoaded, isSignedIn, user, clerk, lastVerificationStatus]);

  // This component doesn't render anything
  return null;
}
