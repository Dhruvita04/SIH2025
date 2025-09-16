"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import OfflineNotification from './OfflineNotification';

const OfflineDetector: React.FC = () => {
  const [showNotification, setShowNotification] = useState(false);
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

      // Show notification
      setShowNotification(true);

      // Redirect after a short delay to show the notification
      setTimeout(() => {
        router.push('/patientProfile/healthRecords');
        setShowNotification(false);
      }, 3000);
    };

    const handleOnline = () => {
      setShowNotification(false);
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

  return (
    <OfflineNotification
      show={showNotification}
      onClose={() => setShowNotification(false)}
    />
  );
};

export default OfflineDetector;