import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useClerk } from "@clerk/clerk-react";
import { Nav } from "components/Nav";
import { Footer } from "components/Footer";
import { AuthBackground } from "components/AuthBackground";

export default function VerifyEmailLink() {
  const navigate = useNavigate();
  const location = useLocation();
  const { handleEmailLinkVerification, isLoaded } = useClerk();
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error' | 'client_mismatch'>('loading');
  const [errorMessage, setErrorMessage] = useState("");

  // Check for status in URL parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const clerkStatus = searchParams.get('__clerk_status');

    if (clerkStatus === 'client_mismatch') {
      setVerificationStatus('client_mismatch');
    } else if (clerkStatus === 'verified') {
      // If already verified from the URL parameter, set success and redirect to login
      setVerificationStatus('success');
      setTimeout(() => {
        navigate('/sign-in');
      }, 2000);
    }
  }, [location, navigate]);

  useEffect(() => {
    if (!isLoaded) return;

    const verifyEmailLink = async () => {
      try {
        // Handle the email link verification
        await handleEmailLinkVerification({
          redirectUrl: `${window.location.origin}/sign-in`,
          redirectUrlComplete: `${window.location.origin}/sign-in`
        });

        // If we get here, verification was successful
        setVerificationStatus('success');

        // Redirect to sign-in after a short delay
        setTimeout(() => {
          navigate('/sign-in');
        }, 2000);
      } catch (err: any) {
        console.error("Email link verification error:", err);
        setVerificationStatus('error');
        setErrorMessage(err.message || "An error occurred during email verification");
      }
    };

    verifyEmailLink();
  }, [isLoaded, handleEmailLinkVerification, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <div className="flex-grow flex flex-col md:flex-row">
        {/* Left side - Content */}
        <div className="w-full md:w-1/2 bg-white flex items-center justify-center p-6 md:p-12">
          <div className="max-w-md w-full">
            <div className="flex items-center mb-6">
              <div className="flex items-center">
                <span className="bg-yellow-400 text-black px-2 py-1 rounded-md mr-2 text-xl font-bold">HEKKA</span>
                <span className="text-[#ff3b9a] text-xl font-bold">MARKET</span>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900">
                {verificationStatus === 'loading' && "Verifying Your Email..."}
                {verificationStatus === 'success' && "Email Verified!"}
                {verificationStatus === 'error' && "Verification Failed"}
              </h2>
              <p className="mt-2 text-gray-600">
                {verificationStatus === 'loading' && "Please wait while we verify your email address..."}
                {verificationStatus === 'success' && "Thank you for verifying your email. You'll be redirected to the login page shortly."}
                {verificationStatus === 'error' && errorMessage}
              </p>
            </div>

            {verificationStatus === 'error' && (
              <button
                onClick={() => navigate('/sign-up')}
                className="w-full bg-[#ff3b9a] hover:bg-[#ff3b9a]/80 text-white py-3 rounded-lg font-medium"
              >
                Return to Sign Up
              </button>
            )}

            {verificationStatus === 'success' && (
              <div className="mt-6 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-green-600 font-medium">
                  Your email has been successfully verified!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right side - Image */}
        <div className="hidden md:flex md:w-1/2 bg-[#ff3b9a] relative overflow-hidden">
          <AuthBackground />
          <div className="absolute inset-0 flex items-center justify-center p-12 z-10">
            <div className="text-white max-w-md text-center">
              <h3 className="text-3xl font-bold mb-4">
                {verificationStatus === 'success' ? "Welcome to Hekka Market!" : "Almost There!"}
              </h3>
              <p className="text-lg opacity-90">
                {verificationStatus === 'success'
                  ? "Your account is now verified. Please log in to start exploring digital products."
                  : "Verifying your email to unlock all features of Hekka Market."}
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
