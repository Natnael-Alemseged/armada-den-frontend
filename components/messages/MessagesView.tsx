'use client';

import React, { useState } from 'react';
import { Send, Search, User, MoreVertical, Phone, Video, Paperclip, Smile, Check, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock data for demonstration
interface UserContact {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away';
  lastSeen?: string;
}

interface DirectMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

interface Conversation {
  userId: string;
  lastMessage: DirectMessage;
  unreadCount: number;
}

export function MessagesView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserContact | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<DirectMessage[]>([]);

  // Mock current user
  const currentUserId = 'current-user-id';

  // Mock users data
  const mockUsers: UserContact[] = [
    // { id: '1', name: 'Alice Johnson', email: 'alice@example.com', status: 'online' },
    // { id: '2', name: 'Bob Smith', email: 'bob@example.com', status: 'offline', lastSeen: '2 hours ago' },
    // { id: '3', name: 'Carol Williams', email: 'carol@example.com', status: 'away' },
    // { id: '4', name: 'David Brown', email: 'david@example.com', status: 'online' },
    // { id: '5', name: 'Emma Davis', email: 'emma@example.com', status: 'offline', lastSeen: '1 day ago' },
  ];

  // Mock messages for selected user
  const mockMessages: DirectMessage[] = selectedUser ? [
    {
      id: '1',
      senderId: selectedUser.id,
      receiverId: currentUserId,
      content: 'Hey! How are you doing?',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      read: true,
    },
    {
      id: '2',
      senderId: currentUserId,
      receiverId: selectedUser.id,
      content: 'I\'m doing great! Thanks for asking. How about you?',
      timestamp: new Date(Date.now() - 3000000).toISOString(),
      read: true,
    },
    {
      id: '3',
      senderId: selectedUser.id,
      receiverId: currentUserId,
      content: 'Pretty good! Working on some exciting projects.',
      timestamp: new Date(Date.now() - 2400000).toISOString(),
      read: true,
    },
  ] : [];

  const filteredUsers = mockUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedUser) return;

    // In a real app, this would send to the backend
    console.log('Sending message:', messageInput, 'to:', selectedUser.id);
    setMessageInput('');
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="flex h-full bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Users List Sidebar */}
      <div className="w-80 border-r border-gray-200 dark:border-gray-700 flex flex-col bg-white dark:bg-gray-800">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Messages</h2>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users..."
              className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 dark:text-white"
            />
          </div>
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto">
          {filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No users found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className={cn(
                    'w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors',
                    selectedUser?.id === user.id && 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600'
                  )}
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                        {user.name.charAt(0)}
                      </div>
                      <div className={cn(
                        'absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800',
                        getStatusColor(user.status)
                      )} />
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                        {user.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {user.status === 'online' ? 'Online' : user.lastSeen || 'Offline'}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      {selectedUser ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                  {selectedUser.name.charAt(0)}
                </div>
                <div className={cn(
                  'absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800',
                  getStatusColor(selectedUser.status)
                )} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {selectedUser.name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {selectedUser.status === 'online' ? 'Online' : selectedUser.lastSeen || 'Offline'}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <Phone className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <Video className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {mockMessages.map((message) => {
              const isCurrentUser = message.senderId === currentUserId;
              return (
                <div
                  key={message.id}
                  className={cn(
                    'flex gap-3',
                    isCurrentUser ? 'justify-end' : 'justify-start'
                  )}
                >
                  {!isCurrentUser && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                      {selectedUser.name.charAt(0)}
                    </div>
                  )}
                  
                  <div
                    className={cn(
                      'max-w-[70%] rounded-2xl px-4 py-2 shadow-sm',
                      isCurrentUser
                        ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
                    )}
                  >
                    <p className="text-sm">{message.content}</p>
                    <div className={cn(
                      'flex items-center gap-1 mt-1 text-xs',
                      isCurrentUser ? 'text-blue-100 justify-end' : 'text-gray-500 dark:text-gray-400'
                    )}>
                      <span>{formatTime(message.timestamp)}</span>
                      {isCurrentUser && (
                        message.read ? (
                          <CheckCheck className="w-3 h-3" />
                        ) : (
                          <Check className="w-3 h-3" />
                        )
                      )}
                    </div>
                  </div>

                  {isCurrentUser && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                      You
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Message Input */}
          <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
            <form onSubmit={handleSendMessage} className="flex items-end gap-2">
              <button
                type="button"
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Paperclip className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              
              <div className="flex-1 relative">
                <textarea
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                  placeholder="Type a message..."
                  rows={1}
                  className="w-full px-4 py-3 pr-12 bg-gray-100 dark:bg-gray-700 border-none rounded-xl resize-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                />
                <button
                  type="button"
                  className="absolute right-3 bottom-3 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  <Smile className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              <button
                type="submit"
                disabled={!messageInput.trim()}
                className="p-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg hover:scale-105"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <User className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Select a conversation
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Choose a user from the list to start messaging
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
