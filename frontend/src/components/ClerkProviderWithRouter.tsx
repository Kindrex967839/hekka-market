import { ClerkProvider } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { ClerkSupabaseIntegration } from "./ClerkSupabaseIntegration";

const publishableKey = import.meta.env.VITE_NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export function ClerkProviderWithRouter({ children }: { children: React.ReactNode }) {
    const navigate = useNavigate();

    if (!publishableKey) {
        return <>{children}</>;
    }

    return (
        <ClerkProvider
            publishableKey={publishableKey}
            appearance={{
                variables: {
                    colorPrimary: '#ff3b9a'
                }
            }}
            signInUrl="/sign-in"
            signUpUrl="/sign-up"
            afterSignInUrl="/"
            afterSignUpUrl="/"
            routerPush={(to) => {
                // Force hard reload for verification/complete paths to ensure fresh state
                if (window.location.pathname.includes('verify-email') || window.location.pathname.includes('sign-up/complete')) {
                    window.location.href = to;
                    return;
                }
                navigate(to);
            }}
            routerReplace={(to) => navigate(to, { replace: true })}
        >
            <ClerkSupabaseIntegration />
            {children}
        </ClerkProvider>
    );
}
