import { createAsyncThunk } from '@reduxjs/toolkit';
import { ApiService } from '@/lib/util/apiService';
import { ENDPOINTS } from '@/lib/constants/endpoints';
import {
  ChatRoom,
  ChatRoomMessage,
  ChatRoomsResponse,
  ChatMessagesResponse,
  CreateChatRoomRequest,
  UpdateChatRoomRequest,
  CreateChatMessageRequest,
  UpdateChatMessageRequest,
  MarkMessagesReadRequest,
  MediaUploadResponse,
  UsersListResponse,
} from '@/lib/types';
import { AxiosError } from 'axios';

// Helper to extract error message
const getErrorMessage = (err: unknown, defaultMessage: string): string => {
  if (err instanceof AxiosError) {
    return err.response?.data?.detail || defaultMessage;
  }
  if (err instanceof Error) {
    return err.message;
  }
  return defaultMessage;
};

// Fetch Chat Rooms
export const fetchChatRooms = createAsyncThunk<
  ChatRoomsResponse,
  { page?: number; pageSize?: number },
  { rejectValue: string }
>('realtimeChat/fetchRooms', async (payload, { rejectWithValue }) => {
  try {
    const params = new URLSearchParams();
    if (payload.page) params.append('page', payload.page.toString());
    if (payload.pageSize) params.append('page_size', payload.pageSize.toString());

    const endpoint = `${ENDPOINTS.CHAT_ROOMS}${params.toString() ? `?${params.toString()}` : ''}`;
    const res = await ApiService.get(endpoint, undefined, true);
    return res.data;
  } catch (err: unknown) {
    return rejectWithValue(getErrorMessage(err, 'Failed to fetch chat rooms'));
  }
});

// Fetch Single Chat Room
export const fetchChatRoom = createAsyncThunk<
  ChatRoom,
  { roomId: string },
  { rejectValue: string }
>('realtimeChat/fetchRoom', async (payload, { rejectWithValue }) => {
  try {
    const res = await ApiService.get(
      ENDPOINTS.CHAT_ROOM_GET(payload.roomId),
      undefined,
      true
    );
    return res.data;
  } catch (err: unknown) {
    return rejectWithValue(getErrorMessage(err, 'Failed to fetch chat room'));
  }
});

// Create Chat Room
export const createChatRoom = createAsyncThunk<
  ChatRoom,
  CreateChatRoomRequest,
  { rejectValue: string }
>('realtimeChat/createRoom', async (payload, { rejectWithValue }) => {
  try {
    const res = await ApiService.post(
      ENDPOINTS.CHAT_ROOM_CREATE,
      payload,
      undefined,
      true
    );
    return res.data;
  } catch (err: unknown) {
    return rejectWithValue(getErrorMessage(err, 'Failed to create chat room'));
  }
});

// Update Chat Room
export const updateChatRoom = createAsyncThunk<
  ChatRoom,
  { roomId: string; data: UpdateChatRoomRequest },
  { rejectValue: string }
>('realtimeChat/updateRoom', async (payload, { rejectWithValue }) => {
  try {
    const res = await ApiService.patch(
      ENDPOINTS.CHAT_ROOM_UPDATE(payload.roomId),
      payload.data,
      undefined,
      true
    );
    return res.data;
  } catch (err: unknown) {
    return rejectWithValue(getErrorMessage(err, 'Failed to update chat room'));
  }
});

// Add Member to Room
export const addRoomMember = createAsyncThunk<
  ChatRoom,
  { roomId: string; userId: string },
  { rejectValue: string }
>('realtimeChat/addMember', async (payload, { rejectWithValue }) => {
  try {
    const res = await ApiService.post(
      ENDPOINTS.CHAT_ROOM_ADD_MEMBER(payload.roomId, payload.userId),
      {},
      undefined,
      true
    );
    return res.data;
  } catch (err: unknown) {
    return rejectWithValue(getErrorMessage(err, 'Failed to add member'));
  }
});

// Remove Member from Room
export const removeRoomMember = createAsyncThunk<
  { roomId: string; userId: string },
  { roomId: string; userId: string },
  { rejectValue: string }
>('realtimeChat/removeMember', async (payload, { rejectWithValue }) => {
  try {
    await ApiService.delete(
      ENDPOINTS.CHAT_ROOM_REMOVE_MEMBER(payload.roomId, payload.userId),
      undefined,
      undefined,
      true
    );
    return payload;
  } catch (err: unknown) {
    return rejectWithValue(getErrorMessage(err, 'Failed to remove member'));
  }
});

// Fetch Room Messages
export const fetchRoomMessages = createAsyncThunk<
  ChatMessagesResponse,
  { roomId: string; page?: number; pageSize?: number },
  { rejectValue: string }
>('realtimeChat/fetchMessages', async (payload, { rejectWithValue }) => {
  try {
    const params = new URLSearchParams();
    if (payload.page) params.append('page', payload.page.toString());
    if (payload.pageSize) params.append('page_size', payload.pageSize.toString());

    const endpoint = `${ENDPOINTS.CHAT_ROOM_MESSAGES(payload.roomId)}${params.toString() ? `?${params.toString()}` : ''}`;
    const res = await ApiService.get(endpoint, undefined, true);
    return res.data;
  } catch (err: unknown) {
    return rejectWithValue(getErrorMessage(err, 'Failed to fetch messages'));
  }
});

// Create Message
export const createChatMessage = createAsyncThunk<
  ChatRoomMessage,
  CreateChatMessageRequest,
  { rejectValue: string }
>('realtimeChat/createMessage', async (payload, { rejectWithValue }) => {
  try {
    const res = await ApiService.post(
      ENDPOINTS.CHAT_MESSAGE_CREATE,
      payload,
      undefined,
      true
    );
    return res.data;
  } catch (err: unknown) {
    return rejectWithValue(getErrorMessage(err, 'Failed to send message'));
  }
});

// Update Message
export const updateChatMessage = createAsyncThunk<
  ChatRoomMessage,
  { messageId: string; data: UpdateChatMessageRequest },
  { rejectValue: string }
>('realtimeChat/updateMessage', async (payload, { rejectWithValue }) => {
  try {
    const res = await ApiService.patch(
      ENDPOINTS.CHAT_MESSAGE_UPDATE(payload.messageId),
      payload.data,
      undefined,
      true
    );
    return res.data;
  } catch (err: unknown) {
    return rejectWithValue(getErrorMessage(err, 'Failed to update message'));
  }
});

// Delete Message
export const deleteChatMessage = createAsyncThunk<
  string,
  { messageId: string },
  { rejectValue: string }
>('realtimeChat/deleteMessage', async (payload, { rejectWithValue }) => {
  try {
    await ApiService.delete(
      ENDPOINTS.CHAT_MESSAGE_DELETE(payload.messageId),
      undefined,
      undefined,
      true
    );
    return payload.messageId;
  } catch (err: unknown) {
    return rejectWithValue(getErrorMessage(err, 'Failed to delete message'));
  }
});

// Mark Messages as Read
export const markMessagesAsRead = createAsyncThunk<
  { roomId: string; messageIds: string[] },
  { roomId: string; messageIds: string[] },
  { rejectValue: string }
>('realtimeChat/markAsRead', async (payload, { rejectWithValue }) => {
  try {
    await ApiService.post(
      ENDPOINTS.CHAT_MARK_READ(payload.roomId),
      { 
        room_id: payload.roomId,
        message_ids: payload.messageIds 
      } as MarkMessagesReadRequest,
      undefined,
      true
    );
    return payload;
  } catch (err: unknown) {
    return rejectWithValue(getErrorMessage(err, 'Failed to mark messages as read'));
  }
});

// Upload Media
export const uploadMedia = createAsyncThunk<
  MediaUploadResponse,
  { file: File },
  { rejectValue: string }
>('realtimeChat/uploadMedia', async (payload, { rejectWithValue }) => {
  try {
    const formData = new FormData();
    formData.append('file', payload.file);

    const res = await ApiService.post(
      ENDPOINTS.CHAT_UPLOAD,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
      true
    );
    return res.data;
  } catch (err: unknown) {
    return rejectWithValue(getErrorMessage(err, 'Failed to upload media'));
  }
});

// Fetch Users with Chat Info
export const fetchUsers = createAsyncThunk<
  UsersListResponse,
  { page?: number; pageSize?: number; search?: string },
  { rejectValue: string }
>('realtimeChat/fetchUsers', async (payload, { rejectWithValue }) => {
  try {
    const params = new URLSearchParams();
    if (payload.page) params.append('page', payload.page.toString());
    if (payload.pageSize) params.append('page_size', payload.pageSize.toString());
    if (payload.search) params.append('search', payload.search);

    const endpoint = `${ENDPOINTS.USERS_LIST}${params.toString() ? `?${params.toString()}` : ''}`;
    const res = await ApiService.get(endpoint, undefined, true);
    return res.data;
  } catch (err: unknown) {
    return rejectWithValue(getErrorMessage(err, 'Failed to fetch users'));
  }
});
