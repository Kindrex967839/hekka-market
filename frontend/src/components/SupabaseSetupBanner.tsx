import React from "react";
import { useNavigate } from "react-router-dom";
import { useSupabaseStore } from "../utils/supabaseStore";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function SupabaseSetupBanner() {
  const navigate = useNavigate();
  const { isConfigured } = useSupabaseStore();

  if (isConfigured) {
    return null;
  }

  return (
    <Alert className="bg-yellow-50 border-yellow-100 mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <AlertTitle className="text-yellow-800 text-lg flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            Supabase Setup Required
          </AlertTitle>
          <AlertDescription className="text-yellow-700 mt-1">
            To use HEKKA MARKET, you need to set up your own Supabase project. This
            will provide the database and authentication for your marketplace.
          </AlertDescription>
        </div>
        <Button
          onClick={() => navigate("/SetupSupabase")}
          className="bg-yellow-500 hover:bg-yellow-600 text-white whitespace-nowrap"
        >
          Setup Supabase
        </Button>
      </div>
    </Alert>
  );
}
