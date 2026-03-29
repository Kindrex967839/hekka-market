import { useEffect, useState } from 'react';
import { useUser, useAuth, useClerk } from '@clerk/clerk-react';
import { syncUserProfile } from '../utils/userService';
import { setupAnonymousAccess } from '../utils/clerkSupabaseIntegration';
import { registerTokenFetcher } from '../utils/supabaseClient';

/**
 * This component handles the integration between Clerk and Supabase.
 * It should be mounted high in the component tree, but below the ClerkProvider.
 */
export function ClerkSupabaseIntegration() {
  const { isLoaded, user } = useUser();
  const { isSignedIn, getToken } = useAuth();
  const clerk = useClerk();
  const [lastVerificationStatus, setLastVerificationStatus] = useState<string | null>(null);

  // Register the token fetcher once on mount
  useEffect(() => {
    registerTokenFetcher(() => getToken({ template: 'supabase' }));
  }, [getToken]);

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

          // If newly verified, we just proceed; the next getSupabaseToken call will update things
          if (isEmailVerified && lastVerificationStatus !== 'verified') {
            console.log('Email verification status changed to verified');
          }
        }

        // With dynamic token fetcher registered, we don't need to manually call getSupabaseToken anymore.
        // The fetch wrapper will handle it automatically for every request.
        console.log('✅ AUTO-AUTH: Supabase client is ready with dynamic token fetching.');

        // Sync profile if email is verified
        if (isEmailVerified) {
          syncUserProfile(user).then(profile => {
            if (profile) {
              console.log('Successfully synced user profile with Supabase');
            } else {
              console.error('Failed to sync user profile with Supabase');
            }
          });
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
