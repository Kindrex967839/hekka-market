import React, { useState } from "react";
import { useSignUp } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { Nav } from "components/Nav";
import { Footer } from "components/Footer";
import { Link } from "react-router-dom";
import { AuthBackground } from "components/AuthBackground";

export default function CustomSignUp() {
  const { isLoaded, signUp } = useSignUp();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoaded) return;

    try {
      setIsSubmitting(true);
      setError("");

      // Start the sign-up process with Clerk
      await signUp.create({
        emailAddress: email,
        username,
        password
      });

      // Set verification URL to force email link verification
      try {
        await signUp.prepareEmailAddressVerification({
          strategy: "email_link",
          redirectUrl: `${window.location.origin}/verify-email`
        });
      } catch (verificationErr) {
        console.warn("Verification preparation error:", verificationErr);
        // Continue anyway - Clerk will handle verification based on dashboard settings
      }

      console.log("Sign-up successful, redirecting to verification page...");

      // Redirect directly to the verification page
      navigate("/sign-up/verify-email-address");
    } catch (err: any) {
      console.error("Error during sign-up:", err);
      setError(err.message || "An error occurred during sign-up");
    } finally {
      setIsSubmitting(false);
    }
  };

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
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>

                <div className="mb-4">
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff3b9a] focus:border-transparent"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff3b9a] focus:border-transparent"
                    required
                  />
                </div>

                <div className="mb-6">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff3b9a] focus:border-transparent"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#ff3b9a] hover:bg-[#ff3b9a]/80 text-white w-full py-3 rounded-lg font-medium disabled:opacity-50"
                >
                  {isSubmitting ? 'Signing up...' : 'Sign Up'}
                </button>
              </form>

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
    </div>
  );
}
