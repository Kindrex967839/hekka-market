import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { getUserProfile, syncUserProfile } from '../utils/userService';

export function useUserProfile() {
  const { user, isLoaded, isSignedIn } = useUser();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      if (!isLoaded || !isSignedIn || !user) {
        setProfile(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Try to get the profile
        let userProfile = await getUserProfile(user.id);
        
        // If profile doesn't exist, create it
        if (!userProfile) {
          userProfile = await syncUserProfile(user);
        }
        
        setProfile(userProfile);
      } catch (err) {
        console.error('Error loading user profile:', err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [isLoaded, isSignedIn, user]);

  return { profile, isLoading, error, refetch: () => setIsLoading(true) };
}
