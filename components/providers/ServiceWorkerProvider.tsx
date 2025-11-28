'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Provider that handles service worker messages (e.g., notification clicks)
 */
export const ServiceWorkerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    // Listen for messages from the service worker
    const handleServiceWorkerMessage = (event: MessageEvent) => {
      console.log('[ServiceWorkerProvider] Received message from service worker:', event.data);
      
      if (event.data?.type === 'NOTIFICATION_CLICK' && event.data?.url) {
        // Navigate to the URL specified in the notification
        router.push(event.data.url);
      }
    };

    navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);

    return () => {
      navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
    };
  }, [router]);

  return <>{children}</>;
};
