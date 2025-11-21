'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import {
  fetchTopicMessages,
  createTopicMessage,
} from '@/lib/features/channels/channelsThunk';
import { fetchUsers } from '@/lib/features/realTimeChat/realtimeChatThunk';
import {
  addMessage,
  addOptimisticMessage,
  updateOptimisticMessage,
  markMessageAsFailed,
  removeOptimisticMessage,
  updateMessageInState,
  deleteMessageInState,
  addReactionToMessage,
  removeReactionFromMessage,
  OptimisticMessage,
} from '@/lib/features/channels/channelsSlice';
import { Topic } from '@/lib/types';
import { Hash, Loader2 } from 'lucide-react';
import { MessageList } from './MessageList';
import { MentionInput } from './MentionInput';
import { socketService } from '@/lib/services/socketService';

interface TopicViewProps {
  topic: Topic;
}

export function TopicView({ topic }: TopicViewProps) {
  const dispatch = useAppDispatch();
  const { messages, messagesLoading } = useAppSelector((state) => state.channels);
  const { user, token } = useAppSelector((state) => state.auth);
  const { users } = useAppSelector((state) => state.realtimeChat);
  const [messageContent, setMessageContent] = useState('');
  const [sending, setSending] = useState(false);
  const [aiTyping, setAiTyping] = useState(false);
  const [aiTypingName, setAiTypingName] = useState('AI');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevMessageCountRef = useRef(messages.length);

  useEffect(() => {
    if (topic) {
      dispatch(fetchTopicMessages({ topicId: topic.id }));
    }
  }, [topic, dispatch]);

  useEffect(() => {
    // Fetch users for mentions
    if (users.length === 0) {
      dispatch(fetchUsers({ page: 1, pageSize: 100 }));
    }
  }, [users.length, dispatch]);

  // Socket.IO integration
  useEffect(() => {
    if (!topic || !token) return;

    // Connect socket if not connected
    if (!socketService.isConnected()) {
      socketService.connect(token).catch((err) => {
        console.error('Failed to connect socket:', err);
      });
    }

    // Join topic room
    socketService.joinTopic(topic.id);

    // Listen for new messages
    const handleNewMessage = (data: any) => {
      if (data.topic_id === topic.id) {
        // Don't add messages from current user (already added optimistically)
        // Only add messages from other users or AI bots
        if (data.message.sender_id !== user?.id) {
          dispatch(addMessage(data.message));
        }
      }
    };

    // Listen for message edits
    const handleMessageEdited = (data: any) => {
      if (data.topic_id === topic.id) {
        dispatch(
          updateMessageInState({
            messageId: data.message_id,
            content: data.content,
            editedAt: data.edited_at || new Date().toISOString(),
          })
        );
      }
    };

    // Listen for message deletes
    const handleMessageDeleted = (data: any) => {
      if (data.topic_id === topic.id) {
        dispatch(
          deleteMessageInState({
            messageId: data.message_id,
            deletedAt: data.deleted_at || new Date().toISOString(),
          })
        );
      }
    };

    // Listen for typing indicators
    const handleTyping = (data: any) => {
      if (data.topic_id === topic.id && data.user_type === 'ai') {
        setAiTyping(data.is_typing);
        if (data.is_typing) {
          // Extract bot name from user_type or use default
          const botName = data.bot_name || 'AI Assistant';
          setAiTypingName(botName);
        }
      }
    };

    // Listen for AI errors
    const handleAiError = (data: any) => {
      if (data.topic_id === topic.id) {
        console.error('AI Error:', data.error);
        // You can add a toast notification here if you have a toast library
        // toast.error(data.error);
      }
    };

    // Listen for reactions
    const handleReactionAdded = (data: any) => {
      if (data.topic_id === topic.id) {
        dispatch(
          addReactionToMessage({
            messageId: data.message_id,
            reaction: {
              id: `${data.user_id}-${data.emoji}`,
              message_id: data.message_id,
              user_id: data.user_id,
              emoji: data.emoji,
              created_at: new Date().toISOString(),
            },
            currentUserId: user?.id,
          })
        );
      }
    };

    const handleReactionRemoved = (data: any) => {
      if (data.topic_id === topic.id) {
        dispatch(
          removeReactionFromMessage({
            messageId: data.message_id,
            userId: data.user_id,
            emoji: data.emoji,
            currentUserId: user?.id,
          })
        );
      }
    };

    // Register event listeners
    socketService.onNewTopicMessage(handleNewMessage);
    socketService.onTopicMessageEdited(handleMessageEdited);
    socketService.onTopicMessageDeleted(handleMessageDeleted);
    socketService.onTyping(handleTyping);
    socketService.onAiError(handleAiError);
    socketService.onReactionAdded(handleReactionAdded);
    socketService.onReactionRemoved(handleReactionRemoved);

    // Cleanup
    return () => {
      socketService.leaveTopic(topic.id);
      socketService.offNewTopicMessage(handleNewMessage);
      socketService.offTopicMessageEdited(handleMessageEdited);
      socketService.offTopicMessageDeleted(handleMessageDeleted);
      socketService.offTyping(handleTyping);
      socketService.offAiError(handleAiError);
      socketService.offReactionAdded(handleReactionAdded);
      socketService.offReactionRemoved(handleReactionRemoved);
    };
  }, [topic, token, dispatch, user?.id]);

  useEffect(() => {
    // Only scroll to bottom when new messages are added, not when reactions change
    if (messages.length > prevMessageCountRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    prevMessageCountRef.current = messages.length;
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!messageContent.trim() || !user) return;

    const content = messageContent.trim();
    const tempId = `temp-${Date.now()}-${Math.random()}`;

    // Create optimistic message
    const optimisticMessage: OptimisticMessage = {
      id: tempId,
      topic_id: topic.id,
      sender_id: user.id,
      content: content,
      reply_to_id: null,
      is_edited: false,
      edited_at: null,
      is_deleted: false,
      deleted_at: null,
      created_at: new Date().toISOString(),
      sender_email: user.email,
      sender_full_name: user.full_name || null,
      mention_count: 0,
      reaction_count: 0,
      reactions: [],
      _optimistic: true,
      _pending: true,
      _failed: false,
      _tempId: tempId,
    };

    // Add optimistic message immediately
    dispatch(addOptimisticMessage(optimisticMessage));
    setMessageContent('');
    setSending(false);

    // Send to server in background
    try {
      const result = await dispatch(
        createTopicMessage({
          topic_id: topic.id,
          content: content,
        })
      ).unwrap();

      // Replace optimistic message with real message from server
      dispatch(updateOptimisticMessage({ tempId, message: result }));
    } catch (error) {
      console.error('Failed to send message:', error);
      // Mark message as failed
      dispatch(markMessageAsFailed(tempId));
    }
  };

  const handleRetryMessage = async (tempId: string, content: string) => {
    // Remove failed message
    dispatch(removeOptimisticMessage(tempId));

    // Create new optimistic message
    const newTempId = `temp-${Date.now()}-${Math.random()}`;
    const optimisticMessage: OptimisticMessage = {
      id: newTempId,
      topic_id: topic.id,
      sender_id: user!.id,
      content: content,
      reply_to_id: null,
      is_edited: false,
      edited_at: null,
      is_deleted: false,
      deleted_at: null,
      created_at: new Date().toISOString(),
      sender_email: user!.email,
      sender_full_name: user!.full_name || null,
      mention_count: 0,
      reaction_count: 0,
      reactions: [],
      _optimistic: true,
      _pending: true,
      _failed: false,
      _tempId: newTempId,
    };

    dispatch(addOptimisticMessage(optimisticMessage));

    // Try sending again
    try {
      const result = await dispatch(
        createTopicMessage({
          topic_id: topic.id,
          content: content,
        })
      ).unwrap();

      dispatch(updateOptimisticMessage({ tempId: newTempId, message: result }));
    } catch (error) {
      console.error('Failed to retry message:', error);
      dispatch(markMessageAsFailed(newTempId));
    }
  };

  const handleCancelMessage = (tempId: string) => {
    dispatch(removeOptimisticMessage(tempId));
  };

  return (
    <div className="flex-1 flex flex-col bg-white min-w-0">
      {/* Topic Header */}
      <div className="h-12 border-b border-gray-200 flex items-center px-5">
        <Hash className="w-5 h-5 text-gray-500 mr-2" />
        <div className="flex-1">
          <h2 className="text-base font-semibold text-gray-900">
            {topic.name}
          </h2>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 custom-scrollbar">
        {messagesLoading && messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-[#1A73E8]" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-600">
            <div className="text-center">
              <Hash className="w-12 h-12 mx-auto mb-2 opacity-20" />
              <p className="text-sm">No messages yet. Start the conversation!</p>
            </div>
          </div>
        ) : (
          <MessageList
            messages={messages}
            currentUserId={user?.id || ''}
            onRetryMessage={handleRetryMessage}
            onCancelMessage={handleCancelMessage}
          />
        )}

        {/* AI Typing Indicator */}
        {aiTyping && (
          <div className="flex items-center gap-3 px-4 py-3 animate-fade-in">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
              🤖
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">{aiTypingName} is typing</span>
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 px-5 py-3">
        <form onSubmit={handleSendMessage}>
          <MentionInput
            value={messageContent}
            onChange={setMessageContent}
            onSubmit={handleSendMessage}
            placeholder={`Message #${topic.name}... (use @ to mention)`}
            disabled={sending}
            sending={sending}
            users={users}
          />
        </form>
        <div className="flex items-center pb-2"></div>
      </div>
    </div>
  );
}
