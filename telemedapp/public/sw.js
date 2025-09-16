const CACHE_NAME = 'health-records-v1';
const urlsToCache = [
  '/',
  '/patientProfile/healthRecords',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
  // Only handle health records related requests for offline functionality
  if (event.request.url.includes('/healthRecords') || 
      event.request.url.includes('/api/health-records') ||
      event.request.url.includes('/patient/medical-document')) {
    
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          // Return cached version or fetch from network
          if (response) {
            return response;
          }
          
          return fetch(event.request).then((response) => {
            // Don't cache if not a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }).catch(() => {
            // Return offline fallback for health records
            if (event.request.url.includes('/healthRecords')) {
              return new Response(
                JSON.stringify({
                  message: 'Offline mode - viewing cached health records',
                  offline: true,
                  data: []
                }),
                {
                  headers: { 'Content-Type': 'application/json' }
                }
              );
            }
          });
        })
    );
  }
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Background sync for health records
self.addEventListener('sync', (event) => {
  if (event.tag === 'health-records-sync') {
    event.waitUntil(syncHealthRecords());
  }
});

// Sync health records when back online
async function syncHealthRecords() {
  try {
    // Get pending health records from IndexedDB or localStorage
    const pendingRecords = await getPendingRecords();
    
    if (pendingRecords.length > 0) {
      // Send pending records to server
      for (const record of pendingRecords) {
        try {
          await fetch('/api/health-records/sync', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(record)
          });
          
          // Remove from pending after successful sync
          await removePendingRecord(record.id);
        } catch (error) {
          console.error('Failed to sync record:', error);
        }
      }
    }
  } catch (error) {
    console.error('Sync failed:', error);
  }
}

// Helper functions for pending records management
async function getPendingRecords() {
  // In a real implementation, this would use IndexedDB
  const pending = localStorage.getItem('pendingHealthRecords');
  return pending ? JSON.parse(pending) : [];
}

async function removePendingRecord(recordId) {
  const pending = await getPendingRecords();
  const updated = pending.filter(record => record.id !== recordId);
  localStorage.setItem('pendingHealthRecords', JSON.stringify(updated));
}

// Message handling for foreground app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_OFFLINE_STATUS') {
    event.ports[0].postMessage({
      offline: !navigator.onLine
    });
  }
});

console.log('Health Records Service Worker installed');