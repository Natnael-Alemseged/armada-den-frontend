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
  updateMessageInState,
  deleteMessageInState,
  addReactionToMessage,
  removeReactionFromMessage,
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
        dispatch(addMessage(data.message));
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
          })
        );
      }
    };

    // Register event listeners
    socketService.onNewTopicMessage(handleNewMessage);
    socketService.onTopicMessageEdited(handleMessageEdited);
    socketService.onTopicMessageDeleted(handleMessageDeleted);
    socketService.onReactionAdded(handleReactionAdded);
    socketService.onReactionRemoved(handleReactionRemoved);

    // Cleanup
    return () => {
      socketService.leaveTopic(topic.id);
      socketService.offNewTopicMessage(handleNewMessage);
      socketService.offTopicMessageEdited(handleMessageEdited);
      socketService.offTopicMessageDeleted(handleMessageDeleted);
      socketService.offReactionAdded(handleReactionAdded);
      socketService.offReactionRemoved(handleReactionRemoved);
    };
  }, [topic, token, dispatch]);

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

    setSending(true);
    try {
      await dispatch(
        createTopicMessage({
          topic_id: topic.id,
          content: messageContent.trim(),
        })
      ).unwrap();
      setMessageContent('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0D0D0D]">
      {/* Topic Header */}
      <div className="h-12 border-b border-[#1A1A1A] flex items-center px-5">
        <Hash className="w-5 h-5 text-gray-500 mr-2" />
        <div className="flex-1">
          <h2 className="text-base font-semibold text-white">
            {topic.name}
          </h2>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
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
          <MessageList messages={messages} currentUserId={user?.id || ''} />
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-[#1A1A1A] px-5 py-3">
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
      </div>
    </div>
  );
}
