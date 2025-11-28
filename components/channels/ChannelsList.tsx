'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Channel } from '@/lib/types';
import { Plus, LogOut, ChevronDown, Settings, Bell, BellOff } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { logoutUser } from '@/lib/slices/authThunk';
import { notificationService } from '@/lib/services/notificationService';

interface ChannelsListProps {
  channels: Channel[];
  selectedChannelId: string | null;
  onChannelSelect: (channel: Channel) => void;
  onCreateChannel?: () => void;
  isAdmin?: boolean;
  onOpenSettings?: () => void;
}

export function ChannelsList({
  channels,
  selectedChannelId,
  onChannelSelect,
  onCreateChannel,
  isAdmin,
  onOpenSettings,
}: ChannelsListProps) {
  const dispatch = useAppDispatch();
  const { user, token } = useAppSelector((state) => state.auth);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(false);
  const [isTogglingNotification, setIsTogglingNotification] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Check notification status on mount
  useEffect(() => {
    const checkNotificationStatus = async () => {
      const isSubscribed = await notificationService.isSubscribed();
      setIsNotificationEnabled(isSubscribed);
    };
    checkNotificationStatus();
  }, []);

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  const handleToggleNotifications = async () => {
    if (!token) return;

    setIsTogglingNotification(true);
    try {
      // Import thunks dynamically
      const { subscribeToNotifications, unsubscribeFromNotifications } = await import('@/lib/features/notifications/notificationSlice');

      if (isNotificationEnabled) {
        // Unsubscribe
        const resultAction = await dispatch(unsubscribeFromNotifications());
        if (unsubscribeFromNotifications.fulfilled.match(resultAction)) {
          setIsNotificationEnabled(false);
        }
      } else {
        // Subscribe
        const resultAction = await dispatch(subscribeToNotifications());
        if (subscribeToNotifications.fulfilled.match(resultAction)) {
          setIsNotificationEnabled(true);
        }
      }
    } catch (error) {
      console.error('Failed to toggle notifications:', error);
    } finally {
      setIsTogglingNotification(false);
    }
  };

  const getUserInitials = () => {
    if (user?.full_name) {
      const names = user.full_name.split(' ');
      return names.length > 1
        ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
        : names[0][0].toUpperCase();
    }
    return user?.email?.[0]?.toUpperCase() || 'U';
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  return (
    <div
      className={`bg-[#F2F2F7] flex flex-col transition-all duration-300 ease-in-out ${isExpanded ? 'w-64' : 'w-16'
        }`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* User Info */}
      <div className="px-3 pt-4 pb-3 flex items-center gap-3 relative">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-semibold text-white">{getUserInitials()}</span>
        </div>
        <div
          className={`flex-1 min-w-0 overflow-hidden transition-all duration-300 ${isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'
            }`}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-gray-900 truncate">
                {user?.full_name || 'User'}
              </div>
              <div className="text-xs text-gray-500 truncate">{user?.email}</div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDropdown(!showDropdown);
              }}
              className="p-1 hover:bg-gray-200 rounded transition-colors flex-shrink-0"
            >
              <ChevronDown className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Dropdown Menu */}
        {showDropdown && isExpanded && (
          <div
            ref={dropdownRef}
            className="absolute top-full left-3 right-3 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
          >
            <button
              onClick={() => {
                handleToggleNotifications();
              }}
              disabled={isTogglingNotification}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors ${isNotificationEnabled
                ? 'text-green-600 hover:bg-green-50'
                : 'text-gray-700 hover:bg-gray-100'
                } ${isTogglingNotification ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isNotificationEnabled ? (
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
            <button
              onClick={() => {
                setShowDropdown(false);
                onOpenSettings?.();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
            <button
              onClick={() => {
                setShowDropdown(false);
                handleLogout();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>

      {/* Channels Header */}
      <div
        className={`px-3 py-2 overflow-hidden transition-all duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 h-0 py-0'
          }`}
        style={{
          color: '#3D3D3D',
          fontFamily: '"General Sans Variable", system-ui, sans-serif',
          fontSize: '14px',
          fontWeight: 450,
        }}
      >
        Channels
      </div>

      {/* Channels */}
      <div className="flex-1 flex flex-col gap-1 px-2 overflow-y-auto">
        {channels.map((channel) => (
          <button
            key={channel.id}
            onClick={() => onChannelSelect(channel)}
            className={`w-full flex items-center gap-3 px-2 py-2 rounded-md text-sm font-medium transition-colors ${selectedChannelId === channel.id
              ? 'bg-[#1A73E8] text-white'
              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
            title={channel.name}
          >
            {channel.name.includes('HireArmada') ? (
              <span className="w-6 h-6 rounded bg-black flex items-center justify-center flex-shrink-0 overflow-hidden p-0.5">
                <img
                  src="/logo_black.png"
                  alt="HireArmada"
                  className="w-full h-full object-contain invert"
                />
              </span>
            ) : (
              <span className="w-6 h-6 rounded bg-black flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                {channel.name.charAt(0).toUpperCase()}
              </span>
            )}
            <span
              className={`truncate transition-all duration-300 ${isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'
                }`}
            >
              {channel.name}
            </span>
          </button>
        ))}

        {/* Add Channel Button */}
        {isAdmin && onCreateChannel && (
          <button
            onClick={onCreateChannel}
            className="w-full flex items-center gap-3 px-2 py-2 rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            title="Create Channel"
          >
            <span className="w-6 h-6 rounded bg-black flex items-center justify-center flex-shrink-0">
              <Plus className="w-4 h-4 text-white" />
            </span>
            <span
              className={`truncate transition-all duration-300 ${isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'
                }`}
            >
              Create Channel
            </span>
          </button>
        )}
      </div>

      {/* Bottom Section - Armada Den */}
      <div className="mt-auto px-3 py-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-black flex items-center justify-center flex-shrink-0">
            <span className="text-lg font-bold text-white">A</span>
          </div>
          <div
            className={`flex-1 min-w-0 overflow-hidden transition-all duration-300 ${isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'
              }`}
          >
            <div className="text-sm font-semibold text-gray-900">Armada Den</div>
            <div className="text-xs text-gray-500">workspace</div>
          </div>
        </div>
      </div>
    </div>
  );
} 
