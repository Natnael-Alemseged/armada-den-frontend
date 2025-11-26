'use client';

import React, { useState, useEffect } from 'react';
import { notificationService } from '@/lib/services/notificationService';
import { Bell, BellOff } from 'lucide-react';

interface NotificationSettingsProps {
  token?: string;
  onSubscriptionChange?: (isSubscribed: boolean) => void;
}

/**
 * Component for managing push notification settings
 */
export const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  token,
  onSubscriptionChange,
}) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    // Check if notifications are supported
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      setIsSupported(false);
      return;
    }

    // Check current permission status
    setHasPermission(notificationService.hasPermission());

    // Check if already subscribed
    const checkSubscription = async () => {
      const subscribed = await notificationService.isSubscribed();
      setIsSubscribed(subscribed);
    };

    checkSubscription();
  }, []);

  const handleToggleNotifications = async () => {
    if (!token) {
      alert('Please log in to enable notifications');
      return;
    }

    setIsLoading(true);

    try {
      if (isSubscribed) {
        // Unsubscribe
        const success = await notificationService.unsubscribeFromPush();
        if (success) {
          setIsSubscribed(false);
          onSubscriptionChange?.(false);
        }
      } else {
        // Subscribe
        const subscription = await notificationService.subscribeToPush(token);
        if (subscription) {
          setIsSubscribed(true);
          setHasPermission(true);
          onSubscriptionChange?.(true);
        } else {
          // Permission might have been denied
          setHasPermission(notificationService.hasPermission());
        }
      }
    } catch (error) {
      console.error('Failed to toggle notifications:', error);
      alert('Failed to update notification settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSupported) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <BellOff className="w-4 h-4" />
        <span>Push notifications are not supported in this browser</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleToggleNotifications}
        disabled={isLoading}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg
          transition-colors duration-200
          ${
            isSubscribed
              ? 'bg-green-500 hover:bg-green-600 text-white'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
          }
          ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        {isSubscribed ? (
          <>
            <Bell className="w-4 h-4" />
            <span>Notifications On</span>
          </>
        ) : (
          <>
            <BellOff className="w-4 h-4" />
            <span>Enable Notifications</span>
          </>
        )}
      </button>

      {!hasPermission && !isSubscribed && (
        <span className="text-xs text-gray-500">
          Click to request notification permission
        </span>
      )}
    </div>
  );
};
