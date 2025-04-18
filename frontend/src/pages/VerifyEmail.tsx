import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser, useClerk, useSignUp } from "@clerk/clerk-react";
import { Nav } from "components/Nav";
import { Footer } from "components/Footer";
import { AuthBackground } from "components/AuthBackground";

export default function VerifyEmail() {
  const navigate = useNavigate();
  const { isLoaded, user } = useUser();
  const { client } = useClerk();
  const { signUp, isLoaded: isSignUpLoaded } = useSignUp();
  const [isVerified, setIsVerified] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');


  useEffect(() => {
    if (!isLoaded) return;

    // If no user, redirect to sign-in
    if (!user) {
      navigate("/sign-in");
      return;
    }

    // Check if the email is already verified
    const checkVerification = async () => {
      setIsChecking(true);
      try {
        // Reload user to get the latest verification status
        await user.reload();

        const primaryEmail = user.primaryEmailAddress;
        const isEmailVerified = primaryEmail?.verification?.status === 'verified';

        setIsVerified(isEmailVerified);

        // If verified, redirect to home after a short delay
        if (isEmailVerified) {
          setTimeout(() => {
            navigate("/");
          }, 2000);
        }
      } catch (error) {
        console.error("Error checking verification status:", error);
      } finally {
        setIsChecking(false);
      }
    };

    // Check immediately and then every 5 seconds
    checkVerification();
    const interval = setInterval(checkVerification, 5000);

    return () => clearInterval(interval);
  }, [isLoaded, user, navigate]);

  const handleResendEmail = async () => {
    setIsSending(true);
    setError('');

    try {
      if (user && user.primaryEmailAddress) {
        // If we have a user, use their primaryEmailAddress
        await user.primaryEmailAddress.prepareVerification({
          strategy: "email_link",
          redirectUrl: `${window.location.origin}/verify-email`
        });
      } else if (isSignUpLoaded && signUp.status === 'complete') {
        // If we're in the sign-up flow, use signUp
        await signUp.prepareEmailAddressVerification({
          strategy: "email_link",
          redirectUrl: `${window.location.origin}/verify-email`
        });
      } else {
        throw new Error('No active user or sign-up session found');
      }

      // Show success message
      alert('Verification email sent! Please check your inbox to verify your account.');
    } catch (error) {
      console.error("Error sending verification email:", error);
      setError('Failed to send verification email. Please try again.');
    } finally {
      setIsSending(false);
    }
  };



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
                {isVerified ? "Email Verified!" : "Verify Your Email"}
              </h2>
              <p className="mt-2 text-gray-600">
                {isVerified
                  ? "Thank you for verifying your email. You'll be redirected to the homepage shortly."
                  : "We've sent a verification link to your email address. Please check your inbox and click the link to verify your account."}
              </p>
            </div>

            {!isVerified && (
              <div className="mt-6">
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                    {error}
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-700">
                        Please check your email inbox for a verification link to verify your account. Click the link in the email to complete your registration.
                      </p>
                    </div>
                  </div>
                </div>



                <button
                  onClick={handleResendEmail}
                  disabled={isSending}
                  className="w-full bg-[#ff3b9a] hover:bg-[#ff3b9a]/80 text-white py-3 rounded-lg font-medium disabled:opacity-50"
                >
                  {isSending ? 'Sending...' : 'Resend Verification Email'}
                </button>
                <p className="mt-4 text-sm text-gray-500 text-center">
                  Didn't receive an email? Check your spam folder or click the button above to resend.
                </p>
              </div>
            )}

            {isVerified && (
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
              <h3 className="text-3xl font-bold mb-4">Almost There!</h3>
              <p className="text-lg opacity-90">
                Verify your email to unlock all features of Hekka Market and start exploring digital products.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
