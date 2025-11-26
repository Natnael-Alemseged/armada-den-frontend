'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAppSelector } from '@/lib/hooks';
import { useNotifications } from '@/lib/hooks/useNotifications';

interface NotificationContextType {
  isSubscribed: boolean;
  isLoading: boolean;
  onlineUsers: Set<string>;
  unreadCounts: Record<string, number>;
  isUserOnline: (userId: string) => boolean;
  getUnreadCount: (topicId: string) => number;
  getTotalUnreadCount: () => number;
  subscribeToPush: () => Promise<boolean>;
  unsubscribeFromPush: () => Promise<boolean>;
  markTopicAsRead: (topicId: string) => void;
  fetchUnreadCounts: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

/**
 * Provider component that manages notifications globally
 */
export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { token } = useAppSelector((state) => state.auth);
  
  const {
    isSubscribed,
    isLoading,
    onlineUsers,
    unreadCounts,
    isUserOnline,
    getUnreadCount,
    getTotalUnreadCount,
    subscribeToPush,
    unsubscribeFromPush,
    markTopicAsRead,
    fetchUnreadCounts,
  } = useNotifications(token || undefined);

  const value: NotificationContextType = {
    isSubscribed,
    isLoading,
    onlineUsers,
    unreadCounts,
    isUserOnline,
    getUnreadCount,
    getTotalUnreadCount,
    subscribeToPush,
    unsubscribeFromPush,
    markTopicAsRead,
    fetchUnreadCounts,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
