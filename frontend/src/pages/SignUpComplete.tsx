import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function SignUpComplete() {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to the verification page
    navigate('/sign-up/verify-email-address');
  }, [navigate]);
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff3b9a]"></div>
    </div>
  );
}
