"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export const useOfflineRedirect = () => {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleOffline = () => {
      // Don't redirect if user is already on health records page
      if (pathname === '/patientProfile/healthRecords') {
        return;
      }

      // Don't redirect if user is on authentication pages
      if (pathname.includes('/auth/')) {
        return;
      }

      // Show notification and redirect to health records for offline access
      const shouldRedirect = confirm(
        'No internet connection detected. Would you like to access your offline health records?'
      );

      if (shouldRedirect) {
        router.push('/patientProfile/healthRecords');
      }
    };

    const handleOnline = () => {
      console.log('Connection restored');
      // Optionally show a toast notification that connection is back
    };

    // Check initial connection status
    if (!navigator.onLine) {
      // Small delay to ensure page is loaded
      setTimeout(() => {
        handleOffline();
      }, 1000);
    }

    // Listen for network status changes
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, [router, pathname]);

  return navigator.onLine;
};

// Alternative: Automatic redirect without user confirmation
export const useAutoOfflineRedirect = () => {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleOffline = () => {
      // Don't redirect if user is already on health records page
      if (pathname === '/patientProfile/healthRecords') {
        return;
      }

      // Don't redirect if user is on authentication pages
      if (pathname.includes('/auth/')) {
        return;
      }

      // Automatically redirect to health records for offline access
      router.push('/patientProfile/healthRecords');
    };

    // Check initial connection status
    if (!navigator.onLine) {
      // Small delay to ensure page is loaded
      setTimeout(() => {
        handleOffline();
      }, 1000);
    }

    // Listen for offline events
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('offline', handleOffline);
    };
  }, [router, pathname]);

  return navigator.onLine;
};

export default useOfflineRedirect;