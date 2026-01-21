// THIS FILE IS MANUALLY UPDATED
import { lazy, Suspense } from "react";
import { RouteObject } from "react-router-dom";
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
const Explore = lazy(() => import("./pages/Explore.tsx"));
const Categories = lazy(() => import("./pages/Categories.tsx"));
const Selling = lazy(() => import("./pages/Selling.tsx"));
const NewProduct = lazy(() => import("./pages/NewProduct.tsx"));
const EditProduct = lazy(() => import("./pages/EditProduct.tsx"));
const ProductDetails = lazy(() => import("./pages/ProductDetails.tsx"));

import { Outlet } from "react-router-dom";
import { ClerkProviderWithRouter } from "./components/ClerkProviderWithRouter";

// Layout component to wrap all routes with ClerkProvider
const MainLayout = () => (
	<ClerkProviderWithRouter>
		<Outlet />
	</ClerkProviderWithRouter>
);

export const userRoutes: RouteObject[] = [
	{
		path: "/",
		element: <MainLayout />,
		children: [
			{
				index: true,
				element: (
					<Suspense fallback={<Loading />}>
						<App />
					</Suspense>
				)
			},
			{
				path: "explore",
				element: (
					<Suspense fallback={<Loading />}>
						<Explore />
					</Suspense>
				)
			},
			{
				path: "categories",
				element: (
					<Suspense fallback={<Loading />}>
						<Categories />
					</Suspense>
				)
			},
			{
				path: "selling",
				element: (
					<Suspense fallback={<Loading />}>
						<Selling />
					</Suspense>
				)
			},
			{
				path: "selling/new",
				element: (
					<Suspense fallback={<Loading />}>
						<NewProduct />
					</Suspense>
				)
			},
			{
				path: "selling/edit/:productId",
				element: (
					<Suspense fallback={<Loading />}>
						<EditProduct />
					</Suspense>
				)
			},
			{
				path: "product/:productId",
				element: (
					<Suspense fallback={<Loading />}>
						<ProductDetails />
					</Suspense>
				)
			},
			{
				path: "sign-in",
				element: (
					<Suspense fallback={<Loading />}>
						<SignIn />
					</Suspense>
				)
			},
			{
				path: "sign-up",
				element: (
					<Suspense fallback={<Loading />}>
						<SignUp />
					</Suspense>
				)
			},
			{
				path: "sign-up/verify-email-address",
				element: (
					<Suspense fallback={<Loading />}>
						<VerifyEmail />
						<EmailVerificationHandler />
					</Suspense>
				)
			},
			{
				path: "verify-email",
				element: (
					<Suspense fallback={<Loading />}>
						<VerifyEmailLink />
					</Suspense>
				)
			},
		]
	}
];
