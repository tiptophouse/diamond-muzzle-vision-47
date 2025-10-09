// Service Worker Registration for Telegram Mini App
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('✅ SW registered:', registration.scope);
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New service worker available
                  console.log('🔄 New SW available - refresh recommended');
                  
                  // Auto-update after 3 seconds
                  setTimeout(() => {
                    newWorker.postMessage({ type: 'SKIP_WAITING' });
                    window.location.reload();
                  }, 3000);
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('❌ SW registration failed:', error);
        });
    });

    // Handle controller change (SW activated)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('🔄 SW controller changed');
    });
  }
}

export function unregisterServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
        console.log('✅ SW unregistered');
      })
      .catch((error) => {
        console.error('❌ SW unregister failed:', error);
      });
  }
}

export function clearCache() {
  if ('caches' in window) {
    caches.keys().then((names) => {
      names.forEach((name) => {
        caches.delete(name);
      });
    });
  }
}
