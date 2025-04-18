import React, { useState } from "react";
import { SignUp as ClerkSignUp } from "@clerk/clerk-react";
import { ForceRedirect } from "../components/ForceRedirect";
import { Nav } from "components/Nav";
import { Footer } from "components/Footer";
import { Link } from "react-router-dom";
import { AuthBackground } from "components/AuthBackground";

export default function SignUp() {
  const [showRedirect, setShowRedirect] = useState(false);

  // Handle the redirect after sign-up
  const handleComplete = () => {
    console.log('Sign-up complete, showing redirect component...');
    setShowRedirect(true);
  };

  // We'll rely on the Clerk Dashboard configuration for email verification
  // The verification method (link vs code) should be set in the Clerk Dashboard
  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <div className="flex-grow flex flex-col md:flex-row">
        {/* Left side - Form */}
        <div className="w-full md:w-1/2 bg-white flex items-center justify-center p-6 md:p-12">
          <div className="max-w-md w-full">
            <div className="flex items-center mb-6">
              <div className="flex items-center">
                <span className="bg-yellow-400 text-black px-2 py-1 rounded-md mr-2 text-xl font-bold">HEKKA</span>
                <span className="text-[#ff3b9a] text-xl font-bold">MARKET</span>
              </div>
            </div>

            <div className="mb-8">
              <p className="text-gray-500 text-sm mb-1">Start your journey</p>
              <h2 className="text-3xl font-bold text-gray-900">
                Sign Up to Hekka Market
              </h2>
            </div>

            <div className="w-full">
              <ClerkSignUp
                routing="path"
                path="/sign-up"
                signInUrl="/sign-in"
                redirectUrl="/sign-up/verify-email-address"
                afterSignUpUrl="/sign-up/verify-email-address"
                signUpCallback={handleComplete}
                appearance={{
                  layout: {
                    socialButtonsVariant: "iconButton",
                    socialButtonsPlacement: "bottom",
                    showOptionalFields: false,
                  },
                  elements: {
                    formButtonPrimary: "bg-[#ff3b9a] hover:bg-[#ff3b9a]/80 text-white w-full py-3 rounded-lg font-medium",
                    formFieldInput: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff3b9a] focus:border-transparent",
                    formFieldLabel: "block text-sm font-medium text-gray-700 mb-1",
                    card: "shadow-none",
                    header: "hidden",
                    footer: "hidden",
                    dividerLine: "bg-gray-200",
                    dividerText: "text-gray-500 text-sm",
                    socialButtonsIconButton: "border border-gray-300 p-2 rounded-lg hover:bg-gray-50",
                    socialButtonsBlockButton: "hidden",
                    formFieldAction: "text-[#ff3b9a] text-sm font-medium",
                    footerActionLink: "text-[#ff3b9a] hover:text-[#ff3b9a]/80 font-medium",
                    identityPreviewEditButton: "text-[#ff3b9a] text-sm font-medium",
                  },
                }}
              />

              <div className="mt-6 text-center">
                <p className="text-gray-600 text-sm">
                  Already have an account?{" "}
                  <Link to="/sign-in" className="text-[#ff3b9a] hover:text-[#ff3b9a]/80 font-medium">
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Image */}
        <div className="hidden md:flex md:w-1/2 bg-[#ff3b9a] relative overflow-hidden">
          <AuthBackground />
          <div className="absolute inset-0 flex items-center justify-center p-12 z-10">
            <div className="text-white max-w-md text-center">
              <h3 className="text-3xl font-bold mb-4">Discover Digital Products</h3>
              <p className="text-lg opacity-90">
                Join our marketplace and start buying or selling digital products today.
                Unlock a world of creative assets, templates, software, and more.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      {showRedirect && <ForceRedirect to="/sign-up/verify-email-address" delay={500} />}
    </div>
  );
}
