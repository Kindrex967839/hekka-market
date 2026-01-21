import { RouterProvider } from "react-router-dom";
import { DEFAULT_THEME } from "./constants/default-theme";
import { ThemeProvider } from "./internal-components/ThemeProvider";
import { OuterErrorBoundary } from "./prod-components/OuterErrorBoundary";
import { router } from "./router";
import { ClerkProvider } from "@clerk/clerk-react";
import { Head } from "./internal-components/Head";
import { ClerkSupabaseIntegration } from "./components/ClerkSupabaseIntegration";
import { SupabaseInitializer } from "./components/SupabaseInitializer";

const publishableKey = import.meta.env.VITE_NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export const AppWrapper = () => {
  return (
    <OuterErrorBoundary>
      <ThemeProvider defaultTheme={DEFAULT_THEME}>
        <SupabaseInitializer />
        <RouterProvider router={router} />
        <Head />
      </ThemeProvider>
    </OuterErrorBoundary>
  );
};

// We need to update user-routes.tsx or router.tsx to wrap with ClerkProviderWrapper
// OR we can change AppWrapper to put the router inside the ClerkProvider.
// But ClerkProvider needs access to navigate, which comes from the router.
// The solution is to use the 'routing' property of Clerk and standard components.
