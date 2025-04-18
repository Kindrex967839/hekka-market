import React from 'react';

interface RedirectMiddlewareProps {
  children: React.ReactNode;
}

/**
 * A simple wrapper component that just renders its children
 * We'll handle the redirect logic elsewhere
 */
export function RedirectMiddleware({ children }: RedirectMiddlewareProps) {
  return <>{children}</>;
}
