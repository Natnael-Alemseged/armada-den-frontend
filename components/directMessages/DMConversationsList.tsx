'use client';

import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { setCurrentConversation } from '@/lib/slices/directMessagesSlice';
import { fetchDMConversations, fetchDMEligibleUsers } from '@/lib/features/directMessages/directMessagesThunk';
import { DMConversation, DMEligibleUser } from '@/lib/types';
import { Search, Loader2, MessageSquarePlus, X, MessageCirclePlus } from 'lucide-react';

export function DMConversationsList() {
  const dispatch = useAppDispatch();
  const {
    conversations,
    currentConversation,
    conversationsLoading,
    eligibleUsers,
    eligibleUsersLoading,
  } = useAppSelector((state) => state.directMessages);

  const [searchQuery, setSearchQuery] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);

  useEffect(() => {
    dispatch(fetchDMConversations());
  }, [dispatch]);

  useEffect(() => {
    if (showNewChat) {
      dispatch(fetchDMEligibleUsers({ search: searchQuery }));
    }
  }, [showNewChat, searchQuery, dispatch]);

  const handleSelectConversation = (conversation: DMConversation) => {
    dispatch(setCurrentConversation(conversation));
    setShowNewChat(false);
  };

  const handleSelectNewUser = (user: DMEligibleUser) => {
    // Create a temporary conversation object for new chat
    const tempConversation: DMConversation = {
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        is_online: user.is_online,
        last_seen_at: user.last_seen_at,
      },
      last_message: null,
      unread_count: 0,
      last_message_at: null,
    };
    dispatch(setCurrentConversation(tempConversation));
    setShowNewChat(false);
  };

  const formatTime = (dateString: string | null) => {
    if (!dateString) return '';
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

  const filteredConversations = conversations.filter((conv: DMConversation) =>
    searchQuery && !showNewChat
      ? conv.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.user.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  const filteredUsers = eligibleUsers.filter((user: DMEligibleUser) =>
    searchQuery
      ? user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  return (
    <div className="w-96 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">
          {showNewChat ? 'New Chat' : 'Direct Messages'}
        </h2>

        <div className="flex items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={showNewChat ? 'Search contacts' : 'Search conversations'}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-2xl bg-gray-50 focus:ring-2 focus:ring-[#1A73E8] focus:border-transparent text-sm"
            />
          </div>

          {/* Toggle New Message Button */}
          <button
            onClick={() => setShowNewChat(!showNewChat)}
            className={`flex items-center justify-center w-8 h-8 rounded-md transition-all ${showNewChat
                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                : 'bg-[#1A73E8] text-white hover:bg-[#1557B0]'
              }`}
            title={showNewChat ? 'Back to conversations' : 'New message'}
          >
            {showNewChat ? (
              <X className="w-5 h-5" />
            ) : (
              // <MessageSquarePlus className="w-4 h-4" />
              <MessageCirclePlus className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {showNewChat ? (
          eligibleUsersLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-black">
                  Contacts on Armada Den
                </p>
                {/* <p className="text-sm text-gray-500">
                  Pick a teammate to start a new conversation.
                </p> */}
              </div>

              {filteredUsers.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <p className="text-sm">No users found</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredUsers.map((user: DMEligibleUser) => (
                    <button
                      key={user.id}
                      onClick={() => handleSelectNewUser(user)}
                      className="w-full p-3 text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                            {(user.full_name || user.email)[0].toUpperCase()}
                          </div>
                          {user.is_online && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-900 truncate">
                            {user.full_name || user.email}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        ) : (
          // Conversations List
          conversationsLoading && conversations.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <p className="text-sm">
                {searchQuery ? 'No conversations found' : 'No conversations yet'}
              </p>
              <button
                onClick={() => setShowNewChat(true)}
                className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Start a new conversation
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredConversations.map((conversation: DMConversation) => {
                const isSelected = currentConversation?.user.id === conversation.user.id;
                return (
                  <button
                    key={conversation.user.id}
                    onClick={() => handleSelectConversation(conversation)}
                    className={`w-full p-3 text-left hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50' : ''
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                          {(conversation.user.full_name || conversation.user.email)[0].toUpperCase()}
                        </div>
                        {conversation.user.is_online && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium text-sm text-gray-900 truncate">
                            {conversation.user.full_name || conversation.user.email}
                          </p>
                          {conversation.last_message && (
                            <span className="text-xs text-gray-400 ml-2">
                              {formatTime(conversation.last_message.created_at)}
                            </span>
                          )}
                        </div>
                        {conversation.last_message && (
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-500 truncate flex-1">
                              {conversation.last_message.content}
                            </p>
                            {conversation.unread_count > 0 && (
                              <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                                {conversation.unread_count}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )
        )}
      </div>
    </div>
  );
}
