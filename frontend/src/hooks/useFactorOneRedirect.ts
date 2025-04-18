import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useClerk, useSession } from '@clerk/clerk-react';

/**
 * Custom hook to handle factor-one redirects and general Clerk authentication issues
 * This hook will detect problematic paths and authentication states and handle them appropriately
 */
export function useFactorOneRedirect() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useClerk();
  const { isLoaded, session } = useSession();

  useEffect(() => {
    // Only run this effect when session data is loaded
    if (!isLoaded) return;

    // Check if we're on a factor-one path
    if (location.pathname.includes('factor-one')) {
      console.log('Detected factor-one path, redirecting to sign-in...');

      const handleFactorOne = async () => {
        try {
          // Sign out to clear any problematic session state
          await signOut();
          // Redirect to the main sign-in page with a hard refresh
          window.location.href = '/sign-in';
        } catch (error) {
          console.error('Error handling factor-one redirect:', error);
          // Fallback to direct navigation if sign out fails
          window.location.href = '/sign-in';
        }
      };

      handleFactorOne();
    }

    // Handle other potential authentication issues
    // If we're on a protected path but don't have a session, redirect to sign-in
    const isProtectedPath = !location.pathname.includes('sign-in') &&
                           !location.pathname.includes('sign-up') &&
                           !location.pathname.includes('verify-email');

    if (isProtectedPath && !session) {
      console.log('No active session on protected path, redirecting to sign-in...');
      navigate('/sign-in', { replace: true });
    }
  }, [location.pathname, navigate, signOut, isLoaded, session]);
}
