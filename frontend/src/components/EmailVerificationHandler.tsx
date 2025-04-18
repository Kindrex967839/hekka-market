import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { syncUserProfile } from '../utils/userService';

export function EmailVerificationHandler() {
  const navigate = useNavigate();
  const { isLoaded, user } = useUser();

  useEffect(() => {
    if (!isLoaded || !user) return;

    const handleVerification = async () => {
      // Check if the email is verified
      const isVerified = user.primaryEmailAddress?.verification?.status === 'verified';
      
      if (isVerified) {
        // Sync the user profile with Supabase
        await syncUserProfile(user);
        
        // Redirect to home page
        navigate('/');
      }
    };

    handleVerification();
  }, [isLoaded, user, navigate]);

  return null;
}
