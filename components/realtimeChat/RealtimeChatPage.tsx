'use client';

import React, { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { socketService } from '@/lib/services/socketService';
import {
  setSocketConnected,
  handleNewMessage,
  handleMessageEdited,
  handleMessageDeleted,
  handleMessagesRead,
  handleUserTyping,
  setCurrentRoom,
} from '@/lib/features/realTimeChat/realtimeChatSlice';
import { fetchUsers } from '@/lib/features/realTimeChat/realtimeChatThunk';
import { UsersList } from './UsersList';
import { ChatRoomView } from './ChatRoomView';
import { Loader2 } from 'lucide-react';

export function RealtimeChatPage() {
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((state) => state.auth);
  const { socketConnected, currentRoom, loading } = useAppSelector(
    (state) => state.realtimeChat
  );

  // Initialize Socket.IO connection
  useEffect(() => {
    if (!token) return;

    const initSocket = async () => {
      try {
        await socketService.connect(token);
        dispatch(setSocketConnected(true));

        // Set up socket event listeners
        socketService.onConnected((data) => {
          console.log('Connected to chat:', data);
        });

        socketService.onNewMessage((data) => {
          dispatch(handleNewMessage(data));
        });

        socketService.onMessageEdited((data) => {
          dispatch(handleMessageEdited(data));
        });

        socketService.onMessageDeleted((data) => {
          dispatch(handleMessageDeleted(data));
        });

        socketService.onMessagesRead((data) => {
          dispatch(handleMessagesRead(data));
        });

        socketService.onUserTyping((data) => {
          dispatch(handleUserTyping(data));
        });

        socketService.onError((data) => {
          console.error('Socket error:', data);
        });

        // Fetch users instead of rooms
        dispatch(fetchUsers({ page: 1, pageSize: 50 }));
      } catch (error) {
        console.error('Failed to connect to socket:', error);
      }
    };

    initSocket();

    return () => {
      socketService.disconnect();
      dispatch(setSocketConnected(false));
    };
  }, [token, dispatch]);

  if (loading && !socketConnected) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar - Users List */}
      <div className="w-80 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Messages
          </h1>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <UsersList />
        </div>

        {/* Connection Status */}
        <div className="p-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <div
              className={`w-2 h-2 rounded-full ${
                socketConnected ? 'bg-green-500' : 'bg-red-500'
              }`}
            />
            {socketConnected ? 'Connected' : 'Disconnected'}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentRoom ? (
          <ChatRoomView />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Loader2 className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Select a user to chat</h3>
              <p className="text-sm">
                Choose a user from the list to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
