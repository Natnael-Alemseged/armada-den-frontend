import { useEffect, useState, useCallback } from 'react';
import { socketService } from '@/lib/services/socketService';
import { notificationService } from '@/lib/services/notificationService';
import { apiClient } from '@/lib/util/apiClient';
import { ENDPOINTS } from '@/lib/constants/endpoints';
import type {
  SocketUserStatusChangeEvent,
  SocketGlobalMessageAlertEvent,
  UnreadCountsResponse,
} from '@/lib/types';

/**
 * Hook for managing notifications, online status, and unread counts
 */
export const useNotifications = (token?: string) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Fetch initial unread counts from API
   */
  const fetchUnreadCounts = useCallback(async () => {
    if (!token) return;

    try {
      const response = await apiClient.get<UnreadCountsResponse>(
        ENDPOINTS.TOPICS_UNREAD_COUNTS
      );
      setUnreadCounts(response.data);
    } catch (error) {
      console.error('Failed to fetch unread counts:', error);
    }
  }, [token]);

  /**
   * Subscribe to push notifications
   */
  const subscribeToPush = useCallback(async () => {
    if (!token) {
      console.warn('Cannot subscribe without token');
      return false;
    }

    setIsLoading(true);
    try {
      // Import the thunk dynamically to avoid circular dependencies
      const { subscribeToNotifications } = await import('@/lib/features/notifications/notificationSlice');
      const { store } = await import('@/lib/store');

      const resultAction = await store.dispatch(subscribeToNotifications());
      if (subscribeToNotifications.fulfilled.match(resultAction)) {
        setIsSubscribed(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  /**
   * Unsubscribe from push notifications
   */
  const unsubscribeFromPush = useCallback(async () => {
    setIsLoading(true);
    try {
      // Import the thunk dynamically to avoid circular dependencies
      const { unsubscribeFromNotifications } = await import('@/lib/features/notifications/notificationSlice');
      const { store } = await import('@/lib/store');

      const resultAction = await store.dispatch(unsubscribeFromNotifications());
      if (unsubscribeFromNotifications.fulfilled.match(resultAction)) {
        setIsSubscribed(false);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Mark a topic as read
   */
  const markTopicAsRead = useCallback((topicId: string) => {
    try {
      socketService.markTopicAsRead(topicId);

      // Update local state immediately
      setUnreadCounts((prev) => ({
        ...prev,
        [topicId]: 0,
      }));
    } catch (error) {
      console.error('Failed to mark topic as read:', error);
    }
  }, []);

  /**
   * Check if a user is online
   */
  const isUserOnline = useCallback(
    (userId: string) => {
      return onlineUsers.has(userId);
    },
    [onlineUsers]
  );

  /**
   * Get unread count for a topic
   */
  const getUnreadCount = useCallback(
    (topicId: string) => {
      return unreadCounts[topicId] || 0;
    },
    [unreadCounts]
  );

  /**
   * Get total unread count across all topics
   */
  const getTotalUnreadCount = useCallback(() => {
    return Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);
  }, [unreadCounts]);

  // Setup push notifications on mount
  useEffect(() => {
    if (!token) return;

    const checkSubscription = async () => {
      const subscribed = await notificationService.isSubscribed();
      setIsSubscribed(subscribed);
    };

    checkSubscription();
  }, [token]);

  // Fetch initial unread counts
  useEffect(() => {
    fetchUnreadCounts();
  }, [fetchUnreadCounts]);

  // Listen for user status changes
  useEffect(() => {
    if (!socketService.isConnected()) {
      console.warn('[useNotifications] Socket not connected, cannot listen for user status changes');
      return;
    }

    const handleStatusChange = (data: SocketUserStatusChangeEvent) => {
      console.log('[useNotifications] User status changed:', data);
      setOnlineUsers((prev) => {
        const newSet = new Set(prev);
        if (data.is_online) {
          newSet.add(data.user_id);
          console.log(`[useNotifications] User ${data.user_id} is now ONLINE`);
        } else {
          newSet.delete(data.user_id);
          console.log(`[useNotifications] User ${data.user_id} is now OFFLINE`);
        }
        console.log('[useNotifications] Total online users:', newSet.size);
        return newSet;
      });
    };

    console.log('[useNotifications] Setting up user status change listener');
    socketService.onUserStatusChange(handleStatusChange);

    return () => {
      console.log('[useNotifications] Cleaning up user status change listener');
      socketService.offUserStatusChange(handleStatusChange);
    };
  }, []);

  // Listen for global message alerts
  useEffect(() => {
    if (!socketService.isConnected()) {
      console.warn('[useNotifications] Socket not connected, cannot listen for global alerts');
      return;
    }

    const handleGlobalAlert = (data: SocketGlobalMessageAlertEvent) => {
      console.log('[useNotifications] 🔔 Global message alert received:', data);

      // Increment unread count for the topic
      if (data.topic_id) {
        setUnreadCounts((prev) => {
          const currentCount = prev[data.topic_id!] || 0;
          const newCount = currentCount + 1;
          console.log(`[useNotifications] Incrementing unread count for topic ${data.topic_id}: ${currentCount} -> ${newCount}`);
          return {
            ...prev,
            [data.topic_id!]: newCount,
          };
        });
      } else {
        console.warn('[useNotifications] Global alert received without topic_id', data);
      }

      // Show in-app notification if browser notifications are not available
      if (typeof window !== 'undefined' && Notification.permission !== 'granted') {
        console.log(`[useNotifications] No notification permission. Message: ${data.message_preview}`);
      } else {
        console.log('[useNotifications] Notification permission granted, push notification should be sent by backend');
      }
    };

    console.log('[useNotifications] Setting up global message alert listener');
    socketService.onGlobalMessageAlert(handleGlobalAlert);

    return () => {
      console.log('[useNotifications] Cleaning up global message alert listener');
      socketService.offGlobalMessageAlert(handleGlobalAlert);
    };
  }, []);

  // Listen for new messages to update unread counts
  useEffect(() => {
    if (!socketService.isConnected()) return;

    const handleNewMessage = (data: any) => {
      console.log('[useNotifications] 📨 New message event received:', data);

      // Extract topic ID from various possible fields
      const topicId = data.topic_id || data.room_id || (data.message && data.message.topic_id);

      if (topicId) {
        setUnreadCounts((prev) => {
          const currentCount = prev[topicId] || 0;
          const newCount = currentCount + 1;
          console.log(`[useNotifications] Updating unread count for topic ${topicId}: ${currentCount} -> ${newCount}`);
          return {
            ...prev,
            [topicId]: newCount,
          };
        });
      } else {
        console.warn('[useNotifications] New message received but could not determine topic_id:', data);
      }
    };

    socketService.onNewTopicMessage(handleNewMessage);
    // Also listen for standard new_message event just in case
    socketService.onNewMessage(handleNewMessage);

    return () => {
      socketService.offNewTopicMessage(handleNewMessage);
      socketService.offNewMessage(handleNewMessage);
    };
  }, []);

  // Listen for foreground Firebase messages
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      import('@/lib/firebase').then(({ messaging }) => {
        if (messaging) {
          import('firebase/messaging').then(({ onMessage }) => {
            onMessage(messaging, (payload) => {
              console.log('[useNotifications] 📬 FCM foreground message received:', payload);
              
              // Show toast notification for foreground messages
              if (payload.notification) {
                import('@/components/Toast').then(({ toastBar, ToastType }) => {
                  const title = payload.notification?.title || 'New Message';
                  const body = payload.notification?.body || '';
                  toastBar(`${title}: ${body}`, ToastType.INFO);
                });
              }

              // Update unread counts if topic_id is in the payload data
              if (payload.data?.topic_id) {
                const topicId = payload.data.topic_id;
                setUnreadCounts((prev) => {
                  const currentCount = prev[topicId] || 0;
                  const newCount = currentCount + 1;
                  console.log(`[useNotifications] FCM: Incrementing unread count for topic ${topicId}: ${currentCount} -> ${newCount}`);
                  return {
                    ...prev,
                    [topicId]: newCount,
                  };
                });
              }
            });
          });
        }
      });
    }
  }, []);

  return {
    // Push notification state
    isSubscribed,
    isLoading,

    // Online status
    onlineUsers,
    isUserOnline,

    // Unread counts
    unreadCounts,
    getUnreadCount,
    getTotalUnreadCount,

    // Actions
    subscribeToPush,
    unsubscribeFromPush,
    markTopicAsRead,
    fetchUnreadCounts,
  };
};
