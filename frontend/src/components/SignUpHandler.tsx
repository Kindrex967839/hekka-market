import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClerk, useSignUp } from '@clerk/clerk-react';

export function SignUpHandler() {
  const navigate = useNavigate();
  const { isLoaded, signUp } = useSignUp();
  
  useEffect(() => {
    if (!isLoaded) return;
    
    // Check if the user has completed the sign-up process
    const checkSignUpStatus = () => {
      const status = signUp.status;
      
      // If the user has completed the sign-up process but needs to verify their email
      if (status === 'complete' && !signUp.verifications.emailAddress.status) {
        // Redirect to the verification page
        navigate('/sign-up/verify-email-address');
      }
    };
    
    // Check immediately and then set up an interval
    checkSignUpStatus();
    const interval = setInterval(checkSignUpStatus, 1000);
    
    return () => clearInterval(interval);
  }, [isLoaded, signUp, navigate]);
  
  return null;
}
