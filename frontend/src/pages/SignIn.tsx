import React, { useEffect } from "react";
import { useClerk } from "@clerk/clerk-react";
import { CustomSignInForm } from "../components/CustomSignInForm";
import { Nav } from "components/Nav";
import { Footer } from "components/Footer";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthBackground } from "components/AuthBackground";

export default function SignIn() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useClerk();

  // Log the current path to help with debugging
  console.log('SignIn component rendered with path:', location.pathname);

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
              <p className="text-gray-500 text-sm mb-1">Welcome back</p>
              <h2 className="text-3xl font-bold text-gray-900">
                Sign In to Hekka Market
              </h2>
            </div>

            <div className="w-full">
              <CustomSignInForm />

              <div className="mt-6 text-center">
                <p className="text-gray-600 text-sm">
                  Don't have an account?{" "}
                  <Link to="/sign-up" className="text-[#ff3b9a] hover:text-[#ff3b9a]/80 font-medium">
                    Sign up
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
              <h3 className="text-3xl font-bold mb-4">Welcome Back!</h3>
              <p className="text-lg opacity-90">
                Sign in to access your account and continue exploring our marketplace of digital products.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
