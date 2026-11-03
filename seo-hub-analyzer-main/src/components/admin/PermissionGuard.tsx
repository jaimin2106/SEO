import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Permission } from '@/lib/adminRbac';

interface PermissionGuardProps {
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Wraps admin routes or UI elements. 
 * If the current admin lacks the specified permission:
 * - If fallback is provided, renders it (or null).
 * - If fallback is NOT provided, redirects to /admin/forbidden.
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({ 
  permission, 
  children, 
  fallback = <Navigate to="/admin/forbidden" replace /> 
}) => {
  const { can, isLoading } = useAdminAuth();

  // If auth is still loading, don't flash the fallback
  if (isLoading) return null;

  if (!can(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
