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
      const subscription = await notificationService.subscribeToPush(token);
      if (subscription) {
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
      const success = await notificationService.unsubscribeFromPush();
      if (success) {
        setIsSubscribed(false);
      }
      return success;
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
          const newCount = (prev[data.topic_id!] || 0) + 1;
          console.log(`[useNotifications] Incrementing unread count for topic ${data.topic_id}: ${newCount}`);
          return {
            ...prev,
            [data.topic_id!]: newCount,
          };
        });
      }

      // Show in-app notification if browser notifications are not available
      if (!notificationService.hasPermission()) {
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
      // Increment unread count if message is not in the active topic
      const topicId = data.topic_id || data.room_id;
      if (topicId) {
        setUnreadCounts((prev) => ({
          ...prev,
          [topicId]: (prev[topicId] || 0) + 1,
        }));
      }
    };

    socketService.onNewTopicMessage(handleNewMessage);

    return () => {
      socketService.offNewTopicMessage(handleNewMessage);
    };
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
