'use client';

import React from 'react';
import { useRoleAuth, UserRole } from '../../hooks/useRoleAuth';

interface RoleProtectedProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  fallback?: React.ReactNode;
  redirectPath?: string;
}

/**
 * Component that protects its children based on user role
 * Shows loading state, handles authentication, and enforces role requirements
 */
export const RoleProtected: React.FC<RoleProtectedProps> = ({
  children,
  requiredRole,
  fallback,
  redirectPath
}) => {
  const { userRole, isAuthenticated, isLoading, requireRole } = useRoleAuth();

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Check authentication and role requirements
  if (requiredRole && !requireRole(requiredRole, redirectPath)) {
    return fallback || (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
          <p className="text-sm text-gray-500 mt-2">
            Required role: {requiredRole}
          </p>
          <p className="text-sm text-gray-500">
            Current role: {userRole || 'Not authenticated'}
          </p>
          <button 
            onClick={() => window.location.href = '/auth'}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  // If no role requirement, just check authentication
  if (!isAuthenticated) {
    return fallback || (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please sign in to access this page.</p>
          <button 
            onClick={() => window.location.href = '/auth'}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default RoleProtected;