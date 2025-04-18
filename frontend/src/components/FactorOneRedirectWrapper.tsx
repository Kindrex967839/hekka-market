import React from 'react';
import { useFactorOneRedirect } from '../hooks/useFactorOneRedirect';

interface FactorOneRedirectWrapperProps {
  children: React.ReactNode;
}

export function FactorOneRedirectWrapper({ children }: FactorOneRedirectWrapperProps) {
  // Use the custom hook to handle factor-one redirects
  useFactorOneRedirect();
  
  // Render the children
  return <>{children}</>;
}
