import React, { createContext, useContext } from 'react';
import { useClerkSession } from '../hooks/useClerkSession';

// Create a context for the session
interface SessionContextType {
  isSignedIn: boolean;
  isLoaded: boolean;
}

const SessionContext = createContext<SessionContextType>({
  isSignedIn: false,
  isLoaded: false
});

// Hook to use the session context
export const useSessionContext = () => useContext(SessionContext);

interface SessionProviderProps {
  children: React.ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
  // Use our custom hook to handle the Clerk session
  const { isSignedIn, isLoaded } = useClerkSession();

  return (
    <SessionContext.Provider value={{ isSignedIn, isLoaded }}>
      {children}
    </SessionContext.Provider>
  );
}
