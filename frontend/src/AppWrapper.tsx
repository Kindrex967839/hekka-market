import { RouterProvider } from "react-router-dom";
import { DEFAULT_THEME } from "./constants/default-theme";
import { ThemeProvider } from "./internal-components/ThemeProvider";
import { OuterErrorBoundary } from "./prod-components/OuterErrorBoundary";
import { router } from "./router";
import { ClerkProvider } from "@clerk/clerk-react";
import { Head } from "./internal-components/Head";
import { ClerkSupabaseIntegration } from "./components/ClerkSupabaseIntegration";
import { SupabaseInitializer } from "./components/SupabaseInitializer";

// Get the publishable key from environment variables
const publishableKey = import.meta.env.VITE_NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export const AppWrapper = () => {
  // If publishableKey is missing, render without ClerkProvider during development
  if (!publishableKey) {
    console.warn("Missing Clerk publishable key. Using fallback without authentication.");
    return (
      <OuterErrorBoundary>
        <ThemeProvider defaultTheme={DEFAULT_THEME}>
          <SupabaseInitializer />
          <RouterProvider router={router} />
          <Head />
        </ThemeProvider>
      </OuterErrorBoundary>
    );
  }

  // With Clerk authentication
  return (
    <ClerkProvider
      publishableKey={publishableKey}
      appearance={{
        variables: {
          colorPrimary: '#ff3b9a'
        }
      }}
      // Force email link verification
      emailLinkVerificationUrl={`${window.location.origin}/verify-email`}
      // Authentication routes
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      // Redirect configuration
      redirectUrl="/"
      // Disable multi-factor authentication
      allowedRedirectOrigins={[window.location.origin]}
      // Handle redirects manually
      navigate={(to) => {
        console.log('Clerk navigate called with:', to);

        // If the URL contains 'factor-one', redirect to sign-in instead
        if (to.includes('factor-one')) {
          console.log('Intercepted factor-one redirect, redirecting to sign-in...');
          window.location.href = '/sign-in';
          return;
        }

        // If coming from verification, force a hard refresh to ensure auth state is updated
        if (to === '/' && window.location.pathname.includes('verify-email')) {
          console.log('Coming from verification, forcing a hard refresh...');
          window.location.href = to;
          return;
        }

        // Special handling for sign-in flow
        if (to.startsWith('/sign-in')) {
          // Check if we're already on the sign-in page
          if (window.location.pathname.startsWith('/sign-in')) {
            // If we're already on the sign-in page, let Clerk handle the navigation
            // This allows the multi-step login flow to work properly
            console.log('Already on sign-in page, letting Clerk handle navigation internally');
            return;
          }
        }

        // Otherwise, perform the normal navigation
        window.location.href = to;
      }}
    >
      <ClerkSupabaseIntegration />
      <OuterErrorBoundary>
        <ThemeProvider defaultTheme={DEFAULT_THEME}>
          <SupabaseInitializer />
          <RouterProvider router={router} />
          <Head />
        </ThemeProvider>
      </OuterErrorBoundary>
    </ClerkProvider>
  );
};
