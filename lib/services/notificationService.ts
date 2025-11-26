import { apiClient } from '@/lib/util/apiClient';
import { ENDPOINTS } from '@/lib/constants/endpoints';
import type {
  VapidPublicKeyResponse,
  PushSubscriptionRequest,
  PushSubscription,
} from '@/lib/types';

/**
 * Service for managing web push notifications
 */
class NotificationService {
  /**
   * Request notification permission from the user
   */
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  /**
   * Check if notification permission is granted
   */
  hasPermission(): boolean {
    if (!('Notification' in window)) {
      return false;
    }
    return Notification.permission === 'granted';
  }

  /**
   * Get VAPID public key from backend
   */
  async getVapidPublicKey(): Promise<string> {
    const response = await apiClient.get<VapidPublicKeyResponse>(
      ENDPOINTS.NOTIFICATIONS_VAPID_KEY
    );
    return response.data.public_key;
  }

  /**
   * Register service worker
   */
  async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service workers are not supported');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }

  /**
   * Subscribe to push notifications
   */
  async subscribeToPush(token: string): Promise<PushSubscription | null> {
    try {
      // 1. Request permission
      const hasPermission = await this.requestPermission();
      if (!hasPermission) {
        console.log('Notification permission denied');
        return null;
      }

      // 2. Register service worker
      const registration = await this.registerServiceWorker();
      if (!registration) {
        console.error('Failed to register service worker');
        return null;
      }

      // 3. Get VAPID public key
      const vapidPublicKey = await this.getVapidPublicKey();

      // 4. Convert VAPID key to Uint8Array
      const convertedVapidKey = this.urlBase64ToUint8Array(vapidPublicKey);

      // 5. Subscribe to push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey as BufferSource,
      });

      // 6. Send subscription to backend
      const subscriptionData: PushSubscriptionRequest = {
        endpoint: subscription.endpoint,
        p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')),
        auth: this.arrayBufferToBase64(subscription.getKey('auth')),
      };

      const response = await apiClient.post<PushSubscription>(
        ENDPOINTS.NOTIFICATIONS_SUBSCRIBE,
        subscriptionData
      );

      console.log('Push notification subscription successful');
      return response.data;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return null;
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribeFromPush(): Promise<boolean> {
    try {
      if (!('serviceWorker' in navigator)) {
        return false;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        // Unsubscribe from browser
        await subscription.unsubscribe();

        // Remove from backend
        await apiClient.delete(ENDPOINTS.NOTIFICATIONS_UNSUBSCRIBE_BY_ENDPOINT, {
          data: {
            endpoint: subscription.endpoint,
          },
        });

        console.log('Unsubscribed from push notifications');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      return false;
    }
  }

  /**
   * Get all push subscriptions for the current user
   */
  async getSubscriptions(): Promise<PushSubscription[]> {
    try {
      const response = await apiClient.get<PushSubscription[]>(
        ENDPOINTS.NOTIFICATIONS_SUBSCRIPTIONS
      );
      return response.data;
    } catch (error) {
      console.error('Failed to get subscriptions:', error);
      return [];
    }
  }

  /**
   * Check if user is currently subscribed
   */
  async isSubscribed(): Promise<boolean> {
    try {
      if (!('serviceWorker' in navigator)) {
        return false;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      return subscription !== null;
    } catch (error) {
      console.error('Failed to check subscription status:', error);
      return false;
    }
  }

  /**
   * Helper: Convert URL-safe base64 to Uint8Array
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  /**
   * Helper: Convert ArrayBuffer to base64
   */
  private arrayBufferToBase64(buffer: ArrayBuffer | null): string {
    if (!buffer) return '';
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
