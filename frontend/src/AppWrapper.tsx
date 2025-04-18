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
