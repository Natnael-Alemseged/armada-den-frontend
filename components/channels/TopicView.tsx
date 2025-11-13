'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import {
  fetchTopicMessages,
  createTopicMessage,
} from '@/lib/features/channels/channelsThunk';
import {
  addMessage,
  updateMessageInState,
  deleteMessageInState,
  addReactionToMessage,
  removeReactionFromMessage,
} from '@/lib/features/channels/channelsSlice';
import { Topic } from '@/lib/types';
import { Hash, Send, Loader2 } from 'lucide-react';
import { MessageList } from './MessageList';
import { socketService } from '@/lib/services/socketService';

interface TopicViewProps {
  topic: Topic;
}

export function TopicView({ topic }: TopicViewProps) {
  const dispatch = useAppDispatch();
  const { messages, messagesLoading } = useAppSelector((state) => state.channels);
  const { user, token } = useAppSelector((state) => state.auth);
  const [messageContent, setMessageContent] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (topic) {
      dispatch(fetchTopicMessages({ topicId: topic.id }));
    }
  }, [topic, dispatch]);

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
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
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
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-800">
      {/* Topic Header */}
      <div className="h-14 border-b border-gray-200 dark:border-gray-700 flex items-center px-4">
        <Hash className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" />
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {topic.name}
          </h2>
          {topic.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400">{topic.description}</p>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messagesLoading && messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <Hash className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No messages yet. Start the conversation!</p>
            </div>
          </div>
        ) : (
          <MessageList messages={messages} currentUserId={user?.id || ''} />
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            placeholder={`Message #${topic.name}`}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!messageContent.trim() || sending}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {sending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
