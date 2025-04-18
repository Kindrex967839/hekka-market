import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface ForceRedirectProps {
  to: string;
  delay?: number;
}

export function ForceRedirect({ to, delay = 0 }: ForceRedirectProps) {
  const navigate = useNavigate();
  
  useEffect(() => {
    console.log(`Forcing redirect to ${to} in ${delay}ms...`);
    
    const timer = setTimeout(() => {
      console.log(`Redirecting now to ${to}...`);
      navigate(to, { replace: true });
    }, delay);
    
    return () => clearTimeout(timer);
  }, [navigate, to, delay]);
  
  return null;
}
