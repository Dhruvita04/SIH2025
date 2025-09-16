import { useEffect } from 'react';

export const useServiceWorker = () => {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('SW registered: ', registration);
            
            // Check for updates
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // New version available
                    if (confirm('New version available! Refresh to update?')) {
                      newWorker.postMessage({ type: 'SKIP_WAITING' });
                      window.location.reload();
                    }
                  }
                });
              }
            });
            
            // Register background sync for health records
            if ('sync' in window.ServiceWorkerRegistration.prototype) {
              navigator.serviceWorker.ready.then((swRegistration) => {
                // Type assertion for background sync which might not be available in all browsers
                return (swRegistration as any).sync?.register('health-records-sync');
              }).catch((error) => {
                console.log('Background sync registration failed:', error);
              });
            }
          })
          .catch((registrationError) => {
            console.log('SW registration failed: ', registrationError);
          });
      });
      
      // Listen for service worker updates
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    }
  }, []);
};

export default useServiceWorker;