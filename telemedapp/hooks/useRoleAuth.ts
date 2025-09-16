'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isTokenExpired, getUserFromToken } from '../utils/jwt';

export type UserRole = 'Patient' | 'Doctor' | null;

interface UseRoleAuthReturn {
  userRole: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (role: UserRole, token: string, userId: string, expiryDate?: string) => void;
  logout: () => void;
  requireRole: (requiredRole: UserRole, redirectPath?: string) => boolean;
  refreshAuth: () => void;
}

/**
 * Custom hook for role-based authentication
 * Provides secure role checking and authentication state management
 */
export const useRoleAuth = (): UseRoleAuthReturn => {
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const checkAuth = () => {
    try {
      setIsLoading(true);
      
      // Check if running in browser
      if (typeof window === 'undefined') {
        setIsLoading(false);
        return;
      }

      const token = localStorage.getItem('jwt');
      const storedRole = localStorage.getItem('userRole') as UserRole;
      const expiryDate = localStorage.getItem('expiryDate');
      const userId = localStorage.getItem('userId');

      console.log('Auth check - Token exists:', !!token, 'Role:', storedRole, 'UserId:', !!userId);

      // Check if required auth data exists
      if (!token || !storedRole || !userId) {
        console.log('Missing required auth data, clearing auth');
        clearAuth();
        return;
      }

      // If we have a proper JWT token, extract info from it
      if (token.includes('.')) {
        console.log('Found JWT token, extracting user info...');
        const userInfo = getUserFromToken(token);
        
        if (!userInfo) {
          console.log('Failed to extract user info from token');
          clearAuth();
          return;
        }

        // Check if token is expired
        if (isTokenExpired(token)) {
          console.log('Token is expired');
          clearAuth();
          return;
        }

        // Use role from token (more reliable)
        const tokenRole = userInfo.role as UserRole;
        
        if (tokenRole !== 'Patient' && tokenRole !== 'Doctor') {
          console.warn('Invalid user role in token:', tokenRole);
          clearAuth();
          return;
        }

        // Update localStorage with token info if needed
        if (storedRole !== tokenRole) {
          localStorage.setItem('userRole', tokenRole);
        }

        console.log('Auth successful from JWT - Role:', tokenRole, 'ID:', userInfo.id);
        setUserRole(tokenRole);
        setIsAuthenticated(true);
        setIsLoading(false);
        return;
      }

      // Fallback: Check expiry date if available (for non-JWT tokens)
      if (expiryDate) {
        const now = new Date().getTime();
        const expiry = new Date(expiryDate).getTime();
        
        if (now >= expiry) {
          console.log('Token expired (by date), clearing auth');
          clearAuth();
          return;
        }
      }

      // Validate role format
      if (storedRole !== 'Patient' && storedRole !== 'Doctor') {
        console.warn('Invalid user role detected:', storedRole);
        clearAuth();
        return;
      }

      console.log('Auth successful (fallback) - Role:', storedRole);
      setUserRole(storedRole);
      setIsAuthenticated(true);
      setIsLoading(false);
    } catch (error) {
      console.error('Error checking authentication:', error);
      clearAuth();
    }
  };

  const clearAuth = () => {
    setUserRole(null);
    setIsAuthenticated(false);
    setIsLoading(false);
    
    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('jwt');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userId');
      localStorage.removeItem('expiryDate');
    }
  };

  const login = (role: UserRole, token: string, userId: string, expiryDate?: string) => {
    try {
      console.log('Login called with:', { role, hasToken: !!token, userId, expiryDate });
      
      // Validate inputs
      if (!role || !token || !userId) {
        console.error('Invalid login parameters');
        return;
      }

      // Store authentication data
      if (typeof window !== 'undefined') {
        localStorage.setItem('jwt', token);
        localStorage.setItem('userRole', role);
        localStorage.setItem('userId', userId);
        
        // Store expiry date if provided
        if (expiryDate) {
          localStorage.setItem('expiryDate', expiryDate);
        }
      }

      // Update state
      setUserRole(role);
      setIsAuthenticated(true);
      setIsLoading(false);

      console.log('Authentication state updated successfully');

      // Force a navigation after state is set
      setTimeout(() => {
        console.log('Redirecting to dashboard...');
        if (role === 'Patient') {
          router.push('/patientProfile');
        } else if (role === 'Doctor') {
          router.push('/doctorProfile');
        }
      }, 100);
    } catch (error) {
      console.error('Error during login:', error);
      clearAuth();
    }
  };

  const logout = () => {
    clearAuth();
    router.push('/');
  };

  const requireRole = (requiredRole: UserRole, redirectPath?: string): boolean => {
    if (isLoading) return false;
    
    if (!isAuthenticated) {
      router.push('/auth');
      return false;
    }

    if (requiredRole && userRole !== requiredRole) {
      const defaultRedirect = userRole === 'Doctor' ? '/doctorProfile' : '/patientProfile';
      router.push(redirectPath || defaultRedirect);
      return false;
    }

    return true;
  };

  const refreshAuth = () => {
    checkAuth();
  };

  useEffect(() => {
    checkAuth();

    // Listen for storage changes (user logged in/out in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'jwt' || e.key === 'userRole' || e.key === 'expiryDate') {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return {
    userRole,
    isAuthenticated,
    isLoading,
    login,
    logout,
    requireRole,
    refreshAuth
  };
};