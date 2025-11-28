
import { messaging, VAPID_KEY } from '@/lib/firebase';
import { getToken, deleteToken } from "firebase/messaging";

class NotificationService {
  async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  async getFCMToken(): Promise<string | null> {
    if (!messaging) {
      console.warn('Firebase messaging is not initialized');
      return null;
    }
    try {
      const token = await getToken(messaging, { vapidKey: VAPID_KEY });
      return token;
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  }

  async unsubscribe(): Promise<boolean> {
    if (!messaging) return false;
    try {
      return await deleteToken(messaging);
    } catch (error) {
      console.error("Error deleting token:", error);
      return false;
    }
  }

  async isSubscribed(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }
    return Notification.permission === 'granted';
  }

  // Helper for checking if we have a token (optional, but good for robust check)
  async hasToken(): Promise<boolean> {
    const token = await this.getFCMToken();
    return !!token;
  }
}

export const notificationService = new NotificationService();
