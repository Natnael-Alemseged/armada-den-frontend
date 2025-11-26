'use client';

import React, { useEffect, useState } from 'react';
import { socketService } from '@/lib/services/socketService';
import { Bell, X } from 'lucide-react';
import type { SocketGlobalMessageAlertEvent } from '@/lib/types';

interface Notification {
  id: string;
  data: SocketGlobalMessageAlertEvent;
  timestamp: number;
}

/**
 * Component that displays toast notifications for global message alerts
 */
export const GlobalNotificationToast: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!socketService.isConnected()) return;

    const handleGlobalAlert = (data: SocketGlobalMessageAlertEvent) => {
      const notification: Notification = {
        id: `${Date.now()}-${Math.random()}`,
        data,
        timestamp: Date.now(),
      };

      setNotifications((prev) => [...prev, notification]);

      // Auto-dismiss after 5 seconds
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
      }, 5000);
    };

    socketService.onGlobalMessageAlert(handleGlobalAlert);

    return () => {
      socketService.offGlobalMessageAlert(handleGlobalAlert);
    };
  }, []);

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 flex items-start gap-3 animate-slide-in"
        >
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
              <Bell className="w-5 h-5 text-white" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-gray-900 mb-1">
              New Message
            </h4>
            <p className="text-xs text-gray-600 line-clamp-2">
              {notification.data.message_preview}
            </p>
            {notification.data.topic_id && (
              <button
                onClick={() => {
                  window.location.href = `/channels?topic=${notification.data.topic_id}`;
                }}
                className="text-xs text-blue-500 hover:text-blue-600 mt-1 font-medium"
              >
                View Topic
              </button>
            )}
          </div>
          
          <button
            onClick={() => dismissNotification(notification.id)}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
