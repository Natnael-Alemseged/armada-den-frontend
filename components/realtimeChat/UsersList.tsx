'use client';

import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { setCurrentRoom } from '@/lib/features/realTimeChat/realtimeChatSlice';
import { createChatRoom, fetchRoomMessages } from '@/lib/features/realTimeChat/realtimeChatThunk';
import { socketService } from '@/lib/services/socketService';
import { UserWithChatInfo } from '@/lib/types';
import { User, Loader2, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export function UsersList() {
  const dispatch = useAppDispatch();
  const { users, currentRoom, loading } = useAppSelector(
    (state) => state.realtimeChat
  );
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const [searchQuery, setSearchQuery] = useState('');

  // Sort users: most recent conversations first, then users with unread messages, then new users
  const sortedUsers = [...users].sort((a, b) => {
    // Users with last messages come first
    const aHasMessage = a.last_message ? 1 : 0;
    const bHasMessage = b.last_message ? 1 : 0;
    
    if (aHasMessage !== bHasMessage) {
      return bHasMessage - aHasMessage; // Users with messages first
    }
    
    // Among users with messages, sort by most recent
    if (a.last_message && b.last_message) {
      return new Date(b.last_message.created_at).getTime() - new Date(a.last_message.created_at).getTime();
    }
    
    // For users without messages, sort alphabetically
    const aName = a.full_name || a.email;
    const bName = b.full_name || b.email;
    return aName.localeCompare(bName);
  });

  // Filter users based on search
  const filteredUsers = sortedUsers.filter((user) =>
    searchQuery
      ? user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  const handleSelectUser = async (user: UserWithChatInfo) => {
    try {
      // If room already exists, join it
      if (user.room_id) {
        // Leave previous room
        if (currentRoom) {
          socketService.leaveRoom(currentRoom.id);
        }

        // Fetch the existing room and join
        const room = {
          id: user.room_id,
          name: user.full_name || user.email,
          room_type: 'direct' as const,
          description: null,
          avatar_url: null,
          created_by: currentUser?.id || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_active: true,
        };

        dispatch(setCurrentRoom(room));
        socketService.joinRoom(user.room_id);

        // Fetch messages
        await dispatch(
          fetchRoomMessages({ roomId: user.room_id, page: 1, pageSize: 50 })
        ).unwrap();
      } else {
        // Leave previous room if any
        if (currentRoom) {
          socketService.leaveRoom(currentRoom.id);
        }

        // Create new room
        const newRoom = await dispatch(
          createChatRoom({
            room_type: 'direct',
            member_ids: [user.id],
          })
        ).unwrap();

        // Set as current room
        dispatch(setCurrentRoom(newRoom));

        // Join the new room
        socketService.joinRoom(newRoom.id);

        // Fetch messages (will be empty for new room)
        await dispatch(
          fetchRoomMessages({ roomId: newRoom.id, page: 1, pageSize: 50 })
        ).unwrap();
      }
    } catch (error) {
      console.error('Failed to select user:', error);
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

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
        <p className="text-sm">No users found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
          />
        </div>
      </div>

      {/* Users List */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-200 dark:divide-gray-700">
        {filteredUsers.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            <p className="text-sm">No users found</p>
          </div>
        ) : (
          filteredUsers.map((user) => {
            const isSelected = currentRoom?.members?.some((m) => m.user_id === user.id);
            const hasNoMessages = !user.last_message;

            return (
              <button
                key={user.id}
                onClick={() => handleSelectUser(user)}
                className={cn(
                  'w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors',
                  isSelected && 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600',
                  hasNoMessages && 'opacity-60'
                )}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center",
                      hasNoMessages 
                        ? "bg-gray-300 dark:bg-gray-600" 
                        : "bg-gradient-to-br from-blue-500 to-purple-500"
                    )}>
                      <User className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                          {user.full_name || user.email}
                        </h3>
                        {/* Unread Badge */}
                        {user.unread_count > 0 && (
                          <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold text-white bg-blue-600 rounded-full flex-shrink-0">
                            {user.unread_count > 99 ? '99+' : user.unread_count}
                          </span>
                        )}
                      </div>
                      {user.last_message && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">
                          {formatTime(user.last_message.created_at)}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate mb-1">
                      {user.email}
                    </p>

                    {user.last_message ? (
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {user.last_message.sender_id === currentUser?.id ? 'You: ' : ''}
                        {user.last_message.message_type === 'text'
                          ? user.last_message.content
                          : `📎 ${user.last_message.message_type.toLowerCase()}`}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-400 dark:text-gray-500 italic">
                        No messages yet
                      </p>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
