'use client';

import React from 'react';
import { Channel } from '@/lib/types';
import { Hash, Plus, LogOut } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { logoutUser } from '@/lib/slices/authThunk';

interface ChannelsListProps {
  channels: Channel[];
  selectedChannelId: string | null;
  onChannelSelect: (channel: Channel) => void;
  onCreateChannel?: () => void;
  isAdmin?: boolean;
}

export function ChannelsList({
  channels,
  selectedChannelId,
  onChannelSelect,
  onCreateChannel,
  isAdmin,
}: ChannelsListProps) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logoutUser());
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

  return (
    <div className="w-64 bg-[#F2F2F7] flex flex-col">
      {/* User Info */}
      <div className="px-4 pt-4 pb-3 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
          <span className="text-sm font-semibold text-white">{getUserInitials()}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-gray-900 truncate">
            {user?.full_name || 'User'}
          </div>
          <div className="text-xs text-gray-500 truncate">{user?.email}</div>
        </div>
      </div>

      {/* Channels Header */}
      <div
        className="px-4 py-2"
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
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${selectedChannelId === channel.id
              ? 'bg-[#1A73E8] text-white'
              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
            title={channel.name}
          >
            <span className="w-6 h-6 rounded bg-black flex items-center justify-center text-xs font-bold text-white">
              {channel.name.charAt(0).toUpperCase()}
            </span>
            <span className="truncate">{channel.name}</span>
          </button>
        ))}

        {/* Add Channel Button */}
        {isAdmin && onCreateChannel && (
          <button
            onClick={onCreateChannel}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            title="Create Channel"
          >
            <span className="w-6 h-6 rounded bg-black flex items-center justify-center">
              <Plus className="w-4 h-4 text-white" />
            </span>
            <span className="truncate">Create Channel</span>
          </button>
        )}
      </div>

      {/* Bottom Section - Armada Den & Logout */}
      <div className="mt-auto px-4 py-3 space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-black flex items-center justify-center">
            <span className="text-lg font-bold text-white">A</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-gray-900">Armada Den</div>
            <div className="text-xs text-gray-500">workspace</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-gray-600 hover:bg-gray-100 hover:text-red-600 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}
