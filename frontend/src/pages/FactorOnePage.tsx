import React from 'react';
import { Navigate } from 'react-router-dom';

export default function FactorOnePage() {
  // Immediately redirect to sign-in
  return <Navigate to="/sign-in" replace />;
}
