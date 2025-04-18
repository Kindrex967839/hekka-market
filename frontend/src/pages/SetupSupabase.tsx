import React from "react";
import { useNavigate } from "react-router-dom";
import { SupabaseSetupGuide } from "components/SupabaseSetupGuide";
import { useSupabaseStore } from "utils/supabaseStore";

export default function SetupSupabase() {
  const navigate = useNavigate();
  const { setConfigured, isConfigured } = useSupabaseStore();

  const handleSetupComplete = () => {
    // Mark Supabase as configured in our store
    setConfigured(true);
    
    // Navigate back to home page
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold mb-2">
            <span className="bg-yellow-400 text-black px-3 py-1 rounded-md mr-2">HEKKA</span>
            <span className="text-[#ff3b9a]">MARKET</span>
          </h1>
          <p className="text-gray-600 text-lg">
            Setup your Supabase project to power your digital marketplace
          </p>
        </div>

        {isConfigured ? (
          <div className="max-w-2xl mx-auto text-center bg-white p-8 rounded-lg shadow">
            <div className="text-green-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-4">Supabase Already Configured!</h2>
            <p className="mb-6">
              Your Supabase project is already set up and connected. You can now start using HEKKA MARKET.
            </p>
            <button
              onClick={() => navigate("/")}
              className="bg-[#ff3b9a] text-white font-bold py-2 px-6 rounded-lg hover:bg-opacity-90 transition-all"
            >
              Go to Homepage
            </button>
          </div>
        ) : (
          <SupabaseSetupGuide onComplete={handleSetupComplete} />
        )}
      </div>
    </div>
  );
}
