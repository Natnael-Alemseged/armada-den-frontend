import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  ChatRoom,
  ChatRoomMessage,
  UserWithChatInfo,
  SocketNewMessageEvent,
  SocketMessageEditedEvent,
  SocketMessageDeletedEvent,
  SocketMessagesReadEvent,
  SocketUserTypingEvent,
} from '@/lib/types';
import {
  fetchChatRooms,
  fetchChatRoom,
  createChatRoom,
  updateChatRoom,
  addRoomMember,
  removeRoomMember,
  fetchRoomMessages,
  createChatMessage,
  updateChatMessage,
  deleteChatMessage,
  markMessagesAsRead,
  uploadMedia,
  fetchUsers,
} from './realtimeChatThunk';

export interface RealtimeChatState {
  rooms: ChatRoom[];
  currentRoom: ChatRoom | null;
  messages: ChatRoomMessage[];
  users: UserWithChatInfo[];
  typingUsers: Record<string, string[]>; // roomId -> array of user IDs
  loading: boolean;
  sendingMessage: boolean;
  uploadingMedia: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
  };
  messagesPagination: {
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
  };
  usersPagination: {
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
  };
  socketConnected: boolean;
}

const initialState: RealtimeChatState = {
  rooms: [],
  currentRoom: null,
  messages: [],
  users: [],
  typingUsers: {},
  loading: false,
  sendingMessage: false,
  uploadingMedia: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    pageSize: 20,
    hasMore: false,
  },
  messagesPagination: {
    total: 0,
    page: 1,
    pageSize: 50,
    hasMore: false,
  },
  usersPagination: {
    total: 0,
    page: 1,
    pageSize: 50,
    hasMore: false,
  },
  socketConnected: false,
};

const realtimeChatSlice = createSlice({
  name: 'realtimeChat',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentRoom: (state, action: PayloadAction<ChatRoom | null>) => {
      state.currentRoom = action.payload;
      state.messages = [];
    },
    clearCurrentRoom: (state) => {
      state.currentRoom = null;
      state.messages = [];
    },
    setSocketConnected: (state, action: PayloadAction<boolean>) => {
      state.socketConnected = action.payload;
    },
    // Socket event handlers
    handleNewMessage: (state, action: PayloadAction<SocketNewMessageEvent>) => {
      const { room_id, message } = action.payload;
      
      // Add message if it's for the current room
      if (state.currentRoom?.id === room_id) {
        // Check if message already exists
        const exists = state.messages.some((m) => m.id === message.id);
        if (!exists) {
          state.messages.push(message);
        }
      }
      
      // Update room's last message
      const room = state.rooms.find((r) => r.id === room_id);
      if (room) {
        room.last_message = message;
        room.updated_at = message.created_at;
        // Increment unread count if not current room
        if (state.currentRoom?.id !== room_id) {
          room.unread_count = (room.unread_count || 0) + 1;
        }
      }
    },
    handleMessageEdited: (state, action: PayloadAction<SocketMessageEditedEvent>) => {
      const { message_id, content, edited_at } = action.payload;
      
      const message = state.messages.find((m) => m.id === message_id);
      if (message) {
        message.content = content;
        message.is_edited = true;
        message.edited_at = edited_at;
      }
    },
    handleMessageDeleted: (state, action: PayloadAction<SocketMessageDeletedEvent>) => {
      const { message_id, deleted_at } = action.payload;
      
      const message = state.messages.find((m) => m.id === message_id);
      if (message) {
        message.is_deleted = true;
        message.deleted_at = deleted_at;
      }
    },
    handleMessagesRead: (state, action: PayloadAction<SocketMessagesReadEvent>) => {
      const { user_id, message_ids } = action.payload;
      
      message_ids.forEach((messageId) => {
        const message = state.messages.find((m) => m.id === messageId);
        if (message) {
          if (!message.read_by) {
            message.read_by = [];
          }
          if (!message.read_by.includes(user_id)) {
            message.read_by.push(user_id);
          }
        }
      });
    },
    handleUserTyping: (state, action: PayloadAction<SocketUserTypingEvent>) => {
      const { room_id, user_id, is_typing } = action.payload;
      
      if (!state.typingUsers[room_id]) {
        state.typingUsers[room_id] = [];
      }
      
      if (is_typing) {
        if (!state.typingUsers[room_id].includes(user_id)) {
          state.typingUsers[room_id].push(user_id);
        }
      } else {
        state.typingUsers[room_id] = state.typingUsers[room_id].filter(
          (id) => id !== user_id
        );
      }
    },
    addOptimisticMessage: (state, action: PayloadAction<ChatRoomMessage>) => {
      state.messages.push(action.payload);
    },
    removeOptimisticMessage: (state, action: PayloadAction<string>) => {
      state.messages = state.messages.filter((m) => m.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    // Fetch Chat Rooms
    builder.addCase(fetchChatRooms.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchChatRooms.fulfilled, (state, action) => {
      state.loading = false;
      state.rooms = action.payload.rooms;
      state.pagination = {
        total: action.payload.total,
        page: action.payload.page,
        pageSize: action.payload.page_size,
        hasMore: action.payload.has_more,
      };
    });
    builder.addCase(fetchChatRooms.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || 'Failed to fetch chat rooms';
    });

    // Fetch Single Chat Room
    builder.addCase(fetchChatRoom.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchChatRoom.fulfilled, (state, action) => {
      state.loading = false;
      state.currentRoom = action.payload;
    });
    builder.addCase(fetchChatRoom.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || 'Failed to fetch chat room';
    });

    // Create Chat Room
    builder.addCase(createChatRoom.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createChatRoom.fulfilled, (state, action) => {
      state.loading = false;
      state.rooms.unshift(action.payload);
      state.currentRoom = action.payload;
    });
    builder.addCase(createChatRoom.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || 'Failed to create chat room';
    });

    // Update Chat Room
    builder.addCase(updateChatRoom.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateChatRoom.fulfilled, (state, action) => {
      state.loading = false;
      const index = state.rooms.findIndex((r) => r.id === action.payload.id);
      if (index !== -1) {
        state.rooms[index] = action.payload;
      }
      if (state.currentRoom?.id === action.payload.id) {
        state.currentRoom = action.payload;
      }
    });
    builder.addCase(updateChatRoom.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || 'Failed to update chat room';
    });

    // Add Room Member
    builder.addCase(addRoomMember.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(addRoomMember.fulfilled, (state, action) => {
      state.loading = false;
      const index = state.rooms.findIndex((r) => r.id === action.payload.id);
      if (index !== -1) {
        state.rooms[index] = action.payload;
      }
      if (state.currentRoom?.id === action.payload.id) {
        state.currentRoom = action.payload;
      }
    });
    builder.addCase(addRoomMember.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || 'Failed to add member';
    });

    // Remove Room Member
    builder.addCase(removeRoomMember.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(removeRoomMember.fulfilled, (state, action) => {
      state.loading = false;
      const { roomId, userId } = action.payload;
      
      const room = state.rooms.find((r) => r.id === roomId);
      if (room?.members) {
        room.members = room.members.filter((m) => m.user_id !== userId);
      }
      
      if (state.currentRoom?.id === roomId && state.currentRoom.members) {
        state.currentRoom.members = state.currentRoom.members.filter(
          (m) => m.user_id !== userId
        );
      }
    });
    builder.addCase(removeRoomMember.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || 'Failed to remove member';
    });

    // Fetch Room Messages
    builder.addCase(fetchRoomMessages.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchRoomMessages.fulfilled, (state, action) => {
      state.loading = false;
      state.messages = action.payload.messages;
      state.messagesPagination = {
        total: action.payload.total,
        page: action.payload.page,
        pageSize: action.payload.page_size,
        hasMore: action.payload.has_more,
      };
    });
    builder.addCase(fetchRoomMessages.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || 'Failed to fetch messages';
    });

    // Create Message
    builder.addCase(createChatMessage.pending, (state) => {
      state.sendingMessage = true;
      state.error = null;
    });
    builder.addCase(createChatMessage.fulfilled, (state, action) => {
      state.sendingMessage = false;
      // Remove optimistic message if exists
      state.messages = state.messages.filter(
        (m) => !m.id.startsWith('temp-')
      );
      // Add real message
      const exists = state.messages.some((m) => m.id === action.payload.id);
      if (!exists) {
        state.messages.push(action.payload);
      }
    });
    builder.addCase(createChatMessage.rejected, (state, action) => {
      state.sendingMessage = false;
      state.error = action.payload || 'Failed to send message';
      // Remove optimistic message on error
      state.messages = state.messages.filter(
        (m) => !m.id.startsWith('temp-')
      );
    });

    // Update Message
    builder.addCase(updateChatMessage.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateChatMessage.fulfilled, (state, action) => {
      state.loading = false;
      const index = state.messages.findIndex((m) => m.id === action.payload.id);
      if (index !== -1) {
        state.messages[index] = action.payload;
      }
    });
    builder.addCase(updateChatMessage.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || 'Failed to update message';
    });

    // Delete Message
    builder.addCase(deleteChatMessage.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteChatMessage.fulfilled, (state, action) => {
      state.loading = false;
      const message = state.messages.find((m) => m.id === action.payload);
      if (message) {
        message.is_deleted = true;
        message.deleted_at = new Date().toISOString();
      }
    });
    builder.addCase(deleteChatMessage.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || 'Failed to delete message';
    });

    // Mark Messages as Read
    builder.addCase(markMessagesAsRead.fulfilled, (state, action) => {
      const { roomId, messageIds } = action.payload;
      
      // Update unread count for the room
      const room = state.rooms.find((r) => r.id === roomId);
      if (room) {
        room.unread_count = 0;
      }
    });

    // Upload Media
    builder.addCase(uploadMedia.pending, (state) => {
      state.uploadingMedia = true;
      state.error = null;
    });
    builder.addCase(uploadMedia.fulfilled, (state) => {
      state.uploadingMedia = false;
    });
    builder.addCase(uploadMedia.rejected, (state, action) => {
      state.uploadingMedia = false;
      state.error = action.payload || 'Failed to upload media';
    });

    // Fetch Users
    builder.addCase(fetchUsers.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchUsers.fulfilled, (state, action) => {
      state.loading = false;
      state.users = action.payload.users;
      state.usersPagination = {
        total: action.payload.total,
        page: action.payload.page,
        pageSize: action.payload.page_size,
        hasMore: action.payload.has_more,
      };
    });
    builder.addCase(fetchUsers.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || 'Failed to fetch users';
    });
  },
});

export const {
  clearError,
  setCurrentRoom,
  clearCurrentRoom,
  setSocketConnected,
  handleNewMessage,
  handleMessageEdited,
  handleMessageDeleted,
  handleMessagesRead,
  handleUserTyping,
  addOptimisticMessage,
  removeOptimisticMessage,
} = realtimeChatSlice.actions;

export default realtimeChatSlice.reducer;
