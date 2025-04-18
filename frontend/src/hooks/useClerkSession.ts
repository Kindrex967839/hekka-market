import { useEffect } from 'react';
import { useClerk, useSession } from '@clerk/clerk-react';

/**
 * Custom hook to handle Clerk session and redirects
 */
export function useClerkSession() {
  const { session, isLoaded } = useSession();
  const { signOut } = useClerk();

  // Handle factor-one redirects
  useEffect(() => {
    // Check if we're on a factor-one path
    if (window.location.pathname.includes('factor-one')) {
      console.log('Detected factor-one path, redirecting to sign-in...');

      const handleFactorOne = async () => {
        try {
          // Sign out to clear any problematic session state
          await signOut();
          // Redirect to the main sign-in page
          window.location.href = '/sign-in';
        } catch (error) {
          console.error('Error handling factor-one redirect:', error);
          // Fallback to direct navigation if sign out fails
          window.location.href = '/sign-in';
        }
      };

      handleFactorOne();
    }
  }, [signOut]);

  return {
    session,
    isLoaded,
    isSignedIn: isLoaded && !!session
  };
}
