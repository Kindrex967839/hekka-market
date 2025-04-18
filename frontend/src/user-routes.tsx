// THIS FILE IS MANUALLY UPDATED
import { lazy, Suspense } from "react";
import { RouteObject } from "react-router";
import { EmailVerificationHandler } from "./components/EmailVerificationHandler";

// Loading component
const Loading = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff3b9a]"></div>
  </div>
);

const App = lazy(() => import("./pages/App.tsx"));
const SignIn = lazy(() => import("./pages/SignIn.tsx"));
// Use our custom sign-up page instead of the default one
const SignUp = lazy(() => import("./pages/CustomSignUp.tsx"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail.tsx"));
const VerifyEmailLink = lazy(() => import("./pages/VerifyEmailLink.tsx"));
const SignUpComplete = lazy(() => import("./pages/SignUpComplete.tsx"));
const FactorOnePage = lazy(() => import("./pages/FactorOnePage.tsx"));

export const userRoutes: RouteObject[] = [
	// Main routes
	{
		path: "/",
		element: (
			<Suspense fallback={<Loading />}>
				<App />
			</Suspense>
		)
	},
	{
		path: "/sign-in",
		element: (
			<Suspense fallback={<Loading />}>
				<SignIn />
			</Suspense>
		)
	},
	{
		path: "/sign-in/factor-one",
		element: (
			<Suspense fallback={<Loading />}>
				<FactorOnePage />
			</Suspense>
		)
	},
	{
		path: "/sign-up",
		element: (
			<Suspense fallback={<Loading />}>
				<SignUp />
			</Suspense>
		)
	},
	{
		path: "/sign-up/verify-email-address",
		element: (
			<Suspense fallback={<Loading />}>
				<VerifyEmail />
				<EmailVerificationHandler />
			</Suspense>
		)
	},
	{
		path: "/verify-email",
		element: (
			<Suspense fallback={<Loading />}>
				<VerifyEmailLink />
			</Suspense>
		)
	},
	{
		path: "/sign-up/complete",
		element: (
			<Suspense fallback={<Loading />}>
				<SignUpComplete />
			</Suspense>
		)
	},
];
