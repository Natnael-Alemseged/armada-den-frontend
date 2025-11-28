'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/lib/store';
import { subscribeToNotifications } from '@/lib/features/notifications/notificationSlice';
import { Bell, X } from 'lucide-react';

interface NotificationPromptProps {
  token?: string;
  onDismiss?: () => void;
}

/**
 * Auto-prompt component that asks for notification permission on first visit
 * Shows as a banner at the top of the app
 */
export const NotificationPrompt: React.FC<NotificationPromptProps> = ({ token, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkAndShowPrompt = async () => {
      // Check if notifications are supported
      if (!('Notification' in window) || !('serviceWorker' in navigator)) {
        return;
      }

      // Check if user has already made a decision
      const hasDecided = localStorage.getItem('notification_prompt_dismissed');
      if (hasDecided) {
        return;
      }

      // Check current permission status
      const permission = Notification.permission;

      // Only show prompt if permission is still default (not asked yet)
      if (permission === 'default') {
        // Small delay to not overwhelm user immediately on login
        setTimeout(() => {
          setIsVisible(true);
        }, 2000);
      } else {
        // User already made a decision, don't show again
        localStorage.setItem('notification_prompt_dismissed', 'true');
      }
    };

    if (token) {
      checkAndShowPrompt();
    }
  }, [token]);

  const dispatch = useDispatch<AppDispatch>();

  const handleEnable = async () => {
    if (!token) return;

    setIsLoading(true);
    try {
      const resultAction = await dispatch(subscribeToNotifications());
      if (subscribeToNotifications.fulfilled.match(resultAction)) {
        // Success - mark as decided and hide
        localStorage.setItem('notification_prompt_dismissed', 'true');
        setIsVisible(false);
        onDismiss?.();
      } else {
        // Permission denied or failed
        localStorage.setItem('notification_prompt_dismissed', 'true');
        setIsVisible(false);
        onDismiss?.();
      }
    } catch (error) {
      console.error('Failed to enable notifications:', error);
      localStorage.setItem('notification_prompt_dismissed', 'true');
      setIsVisible(false);
      onDismiss?.();
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('notification_prompt_dismissed', 'true');
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="flex-shrink-0">
              <Bell className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm">Stay Connected</h3>
              <p className="text-xs text-blue-50">
                Enable notifications to receive messages even when you're away
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleEnable}
              disabled={isLoading}
              className="px-4 py-2 bg-white text-blue-600 rounded-lg font-medium text-sm hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Enabling...' : 'Enable Notifications'}
            </button>
            <button
              onClick={handleDismiss}
              className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
              title="Dismiss"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
