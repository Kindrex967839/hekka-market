import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClerk } from '@clerk/clerk-react';

export function FactorOneRedirect() {
  const navigate = useNavigate();
  const { signOut } = useClerk();

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        // First sign out to clear any problematic session state
        await signOut();
        // Then redirect to the main sign-in page
        navigate('/sign-in', { replace: true });
      } catch (error) {
        console.error('Error during redirect:', error);
        // Fallback to direct navigation if sign out fails
        navigate('/sign-in', { replace: true });
      }
    };

    handleRedirect();
  }, [navigate, signOut]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff3b9a]"></div>
    </div>
  );
}
