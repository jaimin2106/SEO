// src/components/admin/AdminGuard.tsx
// Protects all /admin/* routes.
// - Not authenticated → redirect to /admin/login
// - Authenticated but no admin role → 403 page
// - Passes → renders children

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

interface AdminGuardProps {
  children: React.ReactNode;
}

export const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const {
    isLoading,
    isAdminAuthenticated,
    hasSession,
    authError,
    retryAdminVerification,
  } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f5f4ed] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 rounded-full border-2 border-[#c96442] border-t-transparent animate-spin" />
          <p className="text-[13px] text-[#87867f] font-medium tracking-wide">Verifying access…</p>
        </div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="min-h-screen bg-[#f5f4ed] flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <p role="alert" className="text-[13px] text-[#87867f]">
            Unable to verify admin access: {authError}
          </p>
          <button
            type="button"
            onClick={() => void retryAdminVerification()}
            className="mt-4 rounded-lg bg-[#c96442] px-4 py-2 text-sm font-medium text-white hover:bg-[#b75637]"
          >
            Retry verification
          </button>
        </div>
      </div>
    );
  }

  if (!isAdminAuthenticated) {
    if (hasSession) {
      // User is logged in but lacks admin role
      return <Navigate to="/admin/forbidden" replace />;
    }
    // Guest user
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};
