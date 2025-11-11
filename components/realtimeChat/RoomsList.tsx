'use client';

import React from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { setCurrentRoom } from '@/lib/features/realTimeChat/realtimeChatSlice';
import { fetchRoomMessages } from '@/lib/features/realTimeChat/realtimeChatThunk';
import { socketService } from '@/lib/services/socketService';
import { ChatRoom } from '@/lib/types';
import { Users, User, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function RoomsList() {
  const dispatch = useAppDispatch();
  const { rooms, currentRoom, loading } = useAppSelector(
    (state) => state.realtimeChat
  );
  const { user } = useAppSelector((state) => state.auth);

  const handleSelectRoom = async (room: ChatRoom) => {
    if (currentRoom?.id === room.id) return;

    // Leave previous room
    if (currentRoom) {
      socketService.leaveRoom(currentRoom.id);
    }

    // Set current room and join
    dispatch(setCurrentRoom(room));
    socketService.joinRoom(room.id);

    // Fetch messages
    try {
      await dispatch(
        fetchRoomMessages({ roomId: room.id, page: 1, pageSize: 50 })
      ).unwrap();
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInHours < 24) return `${diffInHours}h`;
    if (diffInDays < 7) return `${diffInDays}d`;
    return date.toLocaleDateString();
  };

  const getRoomName = (room: ChatRoom) => {
    if (room.room_type === 'GROUP') {
      return room.name || 'Unnamed Group';
    }
    // For direct chats, show the other user's name
    const otherMember = room.members?.find((m) => m.user_id !== user?.id);
    return otherMember?.user?.email || 'Unknown User';
  };

  if (loading && rooms.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
        <p className="text-sm">No chats yet</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {rooms.map((room) => (
        <button
          key={room.id}
          onClick={() => handleSelectRoom(room)}
          className={cn(
            'w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors',
            currentRoom?.id === room.id &&
              'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600'
          )}
        >
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {room.avatar_url ? (
                <img
                  src={room.avatar_url}
                  alt={getRoomName(room)}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                  {room.room_type === 'GROUP' ? (
                    <Users className="w-6 h-6 text-white" />
                  ) : (
                    <User className="w-6 h-6 text-white" />
                  )}
                </div>
              )}
            </div>

            {/* Room Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                  {getRoomName(room)}
                </h3>
                {room.last_message && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                    {formatTime(room.last_message.created_at)}
                  </span>
                )}
              </div>

              {room.last_message && (
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {room.last_message.is_deleted
                    ? 'Message deleted'
                    : room.last_message.message_type === 'TEXT'
                    ? room.last_message.content
                    : `📎 ${room.last_message.message_type.toLowerCase()}`}
                </p>
              )}

              {/* Unread Badge */}
              {room.unread_count && room.unread_count > 0 && (
                <div className="mt-1">
                  <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold text-white bg-blue-600 rounded-full">
                    {room.unread_count > 99 ? '99+' : room.unread_count}
                  </span>
                </div>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
