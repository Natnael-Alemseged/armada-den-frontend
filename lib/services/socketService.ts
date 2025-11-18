import { io, Socket } from 'socket.io-client';
import {
  SocketAuthData,
  SocketJoinRoomData,
  SocketLeaveRoomData,
  SocketTypingData,
  SocketMarkReadData,
  SocketConnectedEvent,
  SocketRoomJoinedEvent,
  SocketRoomLeftEvent,
  SocketUserJoinedEvent,
  SocketUserLeftEvent,
  SocketNewMessageEvent,
  SocketMessageEditedEvent,
  SocketMessageDeletedEvent,
  SocketMessagesReadEvent,
  SocketUserTypingEvent,
  SocketRoomCreatedEvent,
  SocketRoomUpdatedEvent,
  SocketMemberAddedEvent,
  SocketMemberRemovedEvent,
  SocketErrorEvent,
} from '@/lib/types';

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  /**
   * Initialize and connect to Socket.IO server
   */
  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve();
        return;
      }

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://armada-den-frontend.vercel.app/api';
      const socketUrl = baseUrl.replace('/api', '');

      this.socket = io(socketUrl, {
        path: '/socket.io',
        auth: {
          token,
        },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
      });

      this.socket.on('connect', () => {
        console.log('Socket.IO connected');
        this.reconnectAttempts = 0;
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket.IO connection error:', error);
        this.reconnectAttempts++;
        
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          reject(new Error('Failed to connect to Socket.IO server'));
        }
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Socket.IO disconnected:', reason);
      });
    });
  }

  /**
   * Disconnect from Socket.IO server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Join a chat room
   */
  joinRoom(roomId: string): void {
    if (!this.socket) {
      throw new Error('Socket not connected');
    }
    this.socket.emit('join_room', { room_id: roomId } as SocketJoinRoomData);
  }

  /**
   * Leave a chat room
   */
  leaveRoom(roomId: string): void {
    if (!this.socket) {
      throw new Error('Socket not connected');
    }
    this.socket.emit('leave_room', { room_id: roomId } as SocketLeaveRoomData);
  }

  /**
   * Send typing indicator
   */
  sendTyping(roomId: string, isTyping: boolean): void {
    if (!this.socket) {
      throw new Error('Socket not connected');
    }
    this.socket.emit('typing', {
      room_id: roomId,
      is_typing: isTyping,
    } as SocketTypingData);
  }

  /**
   * Mark messages as read
   */
  markAsRead(roomId: string, messageIds: string[]): void {
    if (!this.socket) {
      throw new Error('Socket not connected');
    }
    this.socket.emit('mark_as_read', {
      room_id: roomId,
      message_ids: messageIds,
    } as SocketMarkReadData);
  }

  /**
   * Event Listeners
   */

  onConnected(callback: (data: SocketConnectedEvent) => void): void {
    this.socket?.on('connected', callback);
  }

  onRoomJoined(callback: (data: SocketRoomJoinedEvent) => void): void {
    this.socket?.on('room_joined', callback);
  }

  onRoomLeft(callback: (data: SocketRoomLeftEvent) => void): void {
    this.socket?.on('room_left', callback);
  }

  onUserJoined(callback: (data: SocketUserJoinedEvent) => void): void {
    this.socket?.on('user_joined', callback);
  }

  onUserLeft(callback: (data: SocketUserLeftEvent) => void): void {
    this.socket?.on('user_left', callback);
  }

  onNewMessage(callback: (data: SocketNewMessageEvent) => void): void {
    this.socket?.on('new_message', callback);
  }

  onMessageEdited(callback: (data: SocketMessageEditedEvent) => void): void {
    this.socket?.on('message_edited', callback);
  }

  onMessageDeleted(callback: (data: SocketMessageDeletedEvent) => void): void {
    this.socket?.on('message_deleted', callback);
  }

  onMessagesRead(callback: (data: SocketMessagesReadEvent) => void): void {
    this.socket?.on('messages_read', callback);
  }

  onUserTyping(callback: (data: SocketUserTypingEvent) => void): void {
    this.socket?.on('user_typing', callback);
  }

  onRoomCreated(callback: (data: SocketRoomCreatedEvent) => void): void {
    this.socket?.on('room_created', callback);
  }

  onRoomUpdated(callback: (data: SocketRoomUpdatedEvent) => void): void {
    this.socket?.on('room_updated', callback);
  }

  onMemberAdded(callback: (data: SocketMemberAddedEvent) => void): void {
    this.socket?.on('member_added', callback);
  }

  onMemberRemoved(callback: (data: SocketMemberRemovedEvent) => void): void {
    this.socket?.on('member_removed', callback);
  }

  onError(callback: (data: SocketErrorEvent) => void): void {
    this.socket?.on('error', callback);
  }

  /**
   * Remove event listeners
   */

  offConnected(callback?: (data: SocketConnectedEvent) => void): void {
    this.socket?.off('connected', callback);
  }

  offRoomJoined(callback?: (data: SocketRoomJoinedEvent) => void): void {
    this.socket?.off('room_joined', callback);
  }

  offRoomLeft(callback?: (data: SocketRoomLeftEvent) => void): void {
    this.socket?.off('room_left', callback);
  }

  offUserJoined(callback?: (data: SocketUserJoinedEvent) => void): void {
    this.socket?.off('user_joined', callback);
  }

  offUserLeft(callback?: (data: SocketUserLeftEvent) => void): void {
    this.socket?.off('user_left', callback);
  }

  offNewMessage(callback?: (data: SocketNewMessageEvent) => void): void {
    this.socket?.off('new_message', callback);
  }

  offMessageEdited(callback?: (data: SocketMessageEditedEvent) => void): void {
    this.socket?.off('message_edited', callback);
  }

  offMessageDeleted(callback?: (data: SocketMessageDeletedEvent) => void): void {
    this.socket?.off('message_deleted', callback);
  }

  offMessagesRead(callback?: (data: SocketMessagesReadEvent) => void): void {
    this.socket?.off('messages_read', callback);
  }

  offUserTyping(callback?: (data: SocketUserTypingEvent) => void): void {
    this.socket?.off('user_typing', callback);
  }

  offRoomCreated(callback?: (data: SocketRoomCreatedEvent) => void): void {
    this.socket?.off('room_created', callback);
  }

  offRoomUpdated(callback?: (data: SocketRoomUpdatedEvent) => void): void {
    this.socket?.off('room_updated', callback);
  }

  offMemberAdded(callback?: (data: SocketMemberAddedEvent) => void): void {
    this.socket?.off('member_added', callback);
  }

  offMemberRemoved(callback?: (data: SocketMemberRemovedEvent) => void): void {
    this.socket?.off('member_removed', callback);
  }

  offError(callback?: (data: SocketErrorEvent) => void): void {
    this.socket?.off('error', callback);
  }

  /**
   * Channels/Topics Methods
   */

  // Join a topic
  joinTopic(topicId: string): void {
    if (!this.socket) {
      throw new Error('Socket not connected');
    }
    this.socket.emit('join_topic', { topic_id: topicId });
  }

  // Leave a topic
  leaveTopic(topicId: string): void {
    if (!this.socket) {
      throw new Error('Socket not connected');
    }
    this.socket.emit('leave_topic', { topic_id: topicId });
  }

  // Send typing indicator for topic
  sendTopicTyping(topicId: string, isTyping: boolean): void {
    if (!this.socket) {
      throw new Error('Socket not connected');
    }
    this.socket.emit('topic_typing', {
      topic_id: topicId,
      is_typing: isTyping,
    });
  }

  /**
   * Channels/Topics Event Listeners
   */

  onTopicCreated(callback: (data: any) => void): void {
    this.socket?.on('topic_created', callback);
  }

  onTopicUpdated(callback: (data: any) => void): void {
    this.socket?.on('topic_updated', callback);
  }

  onTopicJoined(callback: (data: any) => void): void {
    this.socket?.on('topic_joined', callback);
  }

  onTopicLeft(callback: (data: any) => void): void {
    this.socket?.on('topic_left', callback);
  }

  onMemberAddedToTopic(callback: (data: any) => void): void {
    this.socket?.on('member_added', callback);
  }

  onMemberRemovedFromTopic(callback: (data: any) => void): void {
    this.socket?.on('member_removed', callback);
  }

  onUserJoinedTopic(callback: (data: any) => void): void {
    this.socket?.on('user_joined_topic', callback);
  }

  onUserLeftTopic(callback: (data: any) => void): void {
    this.socket?.on('user_left_topic', callback);
  }

  onNewTopicMessage(callback: (data: any) => void): void {
    this.socket?.on('new_topic_message', callback);
  }

  onTopicMessageEdited(callback: (data: any) => void): void {
    this.socket?.on('topic_message_edited', callback);
  }

  onTopicMessageDeleted(callback: (data: any) => void): void {
    this.socket?.on('topic_message_deleted', callback);
  }

  onUserTypingTopic(callback: (data: any) => void): void {
    this.socket?.on('user_typing_topic', callback);
  }

  onMentioned(callback: (data: any) => void): void {
    this.socket?.on('mentioned', callback);
  }

  onReactionAdded(callback: (data: any) => void): void {
    this.socket?.on('reaction_added', callback);
  }

  onReactionRemoved(callback: (data: any) => void): void {
    this.socket?.on('reaction_removed', callback);
  }

  onTyping(callback: (data: any) => void): void {
    this.socket?.on('typing', callback);
  }

  onAiError(callback: (data: any) => void): void {
    this.socket?.on('ai_error', callback);
  }

  /**
   * Remove Channels/Topics event listeners
   */

  offTopicCreated(callback?: (data: any) => void): void {
    this.socket?.off('topic_created', callback);
  }

  offTopicUpdated(callback?: (data: any) => void): void {
    this.socket?.off('topic_updated', callback);
  }

  offTopicJoined(callback?: (data: any) => void): void {
    this.socket?.off('topic_joined', callback);
  }

  offTopicLeft(callback?: (data: any) => void): void {
    this.socket?.off('topic_left', callback);
  }

  offMemberAddedToTopic(callback?: (data: any) => void): void {
    this.socket?.off('member_added', callback);
  }

  offMemberRemovedFromTopic(callback?: (data: any) => void): void {
    this.socket?.off('member_removed', callback);
  }

  offUserJoinedTopic(callback?: (data: any) => void): void {
    this.socket?.off('user_joined_topic', callback);
  }

  offUserLeftTopic(callback?: (data: any) => void): void {
    this.socket?.off('user_left_topic', callback);
  }

  offNewTopicMessage(callback?: (data: any) => void): void {
    this.socket?.off('new_topic_message', callback);
  }

  offTopicMessageEdited(callback?: (data: any) => void): void {
    this.socket?.off('topic_message_edited', callback);
  }

  offTopicMessageDeleted(callback?: (data: any) => void): void {
    this.socket?.off('topic_message_deleted', callback);
  }

  offUserTypingTopic(callback?: (data: any) => void): void {
    this.socket?.off('user_typing_topic', callback);
  }

  offMentioned(callback?: (data: any) => void): void {
    this.socket?.off('mentioned', callback);
  }

  offReactionAdded(callback?: (data: any) => void): void {
    this.socket?.off('reaction_added', callback);
  }

  offReactionRemoved(callback?: (data: any) => void): void {
    this.socket?.off('reaction_removed', callback);
  }

  offTyping(callback?: (data: any) => void): void {
    this.socket?.off('typing', callback);
  }

  offAiError(callback?: (data: any) => void): void {
    this.socket?.off('ai_error', callback);
  }
}

// Export singleton instance
export const socketService = new SocketService();
