import { createAsyncThunk } from '@reduxjs/toolkit';
import { ApiService } from '@/lib/util/apiService';
import { ENDPOINTS } from '@/lib/constants/endpoints';
import {
    DMConversationsResponse,
    DMMessagesResponse,
    SendDMRequest,
    EditDMRequest,
    AddDMReactionRequest,
    DirectMessage,
    DMReaction,
    DMEligibleUser,
} from '@/lib/types';

// Fetch all conversations
export const fetchDMConversations = createAsyncThunk<
    DMConversationsResponse,
    void,
    { rejectValue: string }
>(
    'directMessages/fetchConversations',
    async (_, { rejectWithValue }) => {
        try {
            const response = await ApiService.get(ENDPOINTS.DM_CONVERSATIONS);
            return response.data as DMConversationsResponse;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.detail || 'Failed to fetch conversations');
        }
    }
);

// Fetch messages with a specific user
export const fetchDMMessages = createAsyncThunk<
    DMMessagesResponse,
    { userId: string; page?: number; pageSize?: number },
    { rejectValue: string }
>(
    'directMessages/fetchMessages',
    async ({ userId, page = 1, pageSize = 50 }, { rejectWithValue }) => {
        try {
            const queryParams = new URLSearchParams();
            queryParams.append('page', page.toString());
            queryParams.append('page_size', pageSize.toString());

            const response = await ApiService.get(
                `${ENDPOINTS.DM_MESSAGES_WITH_USER(userId)}?${queryParams.toString()}`
            );
            return response.data as DMMessagesResponse;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.detail || 'Failed to fetch messages');
        }
    }
);

// Send a new direct message
export const sendDM = createAsyncThunk<
    DirectMessage,
    SendDMRequest,
    { rejectValue: string }
>(
    'directMessages/send',
    async (messageData, { rejectWithValue }) => {
        try {
            const response = await ApiService.post(ENDPOINTS.DM_SEND, messageData);
            return response.data as DirectMessage;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.detail || 'Failed to send message');
        }
    }
);

// Edit a message
export const editDM = createAsyncThunk<
    DirectMessage,
    { messageId: string; content: string },
    { rejectValue: string }
>(
    'directMessages/edit',
    async ({ messageId, content }, { rejectWithValue }) => {
        try {
            const response = await ApiService.patch(
                ENDPOINTS.DM_EDIT(messageId),
                { content } as EditDMRequest
            );
            return response.data as DirectMessage;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.detail || 'Failed to edit message');
        }
    }
);

// Delete a message
export const deleteDM = createAsyncThunk<
    string,
    string,
    { rejectValue: string }
>(
    'directMessages/delete',
    async (messageId, { rejectWithValue }) => {
        try {
            await ApiService.delete(ENDPOINTS.DM_DELETE(messageId));
            return messageId;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.detail || 'Failed to delete message');
        }
    }
);

// Mark a message as read
export const markDMAsRead = createAsyncThunk<
    string,
    string,
    { rejectValue: string }
>(
    'directMessages/markRead',
    async (messageId, { rejectWithValue }) => {
        try {
            await ApiService.post(ENDPOINTS.DM_MARK_READ(messageId));
            return messageId;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.detail || 'Failed to mark message as read');
        }
    }
);

// Add reaction to a message
export const addDMReaction = createAsyncThunk<
    { messageId: string; reactions: DMReaction[] },
    { messageId: string; emoji: string },
    { rejectValue: string }
>(
    'directMessages/addReaction',
    async ({ messageId, emoji }, { rejectWithValue }) => {
        try {
            const response = await ApiService.post(
                ENDPOINTS.DM_ADD_REACTION(messageId),
                { emoji } as AddDMReactionRequest
            );
            return {
                messageId,
                reactions: response.data as DMReaction[],
            };
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.detail || 'Failed to add reaction');
        }
    }
);

// Remove reaction from a message
export const removeDMReaction = createAsyncThunk<
    { messageId: string; reactions: DMReaction[] },
    { messageId: string; emoji: string },
    { rejectValue: string }
>(
    'directMessages/removeReaction',
    async ({ messageId, emoji }, { rejectWithValue }) => {
        try {
            const response = await ApiService.delete(ENDPOINTS.DM_REMOVE_REACTION(messageId, emoji));
            return {
                messageId,
                reactions: response.data as DMReaction[],
            };
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.detail || 'Failed to remove reaction');
        }
    }
);

// Fetch eligible users for messaging
export const fetchDMEligibleUsers = createAsyncThunk<
    DMEligibleUser[],
    { search?: string } | void,
    { rejectValue: string }
>(
    'directMessages/fetchEligibleUsers',
    async (params, { rejectWithValue }) => {
        try {
            const queryParams = new URLSearchParams();
            if (params?.search) {
                queryParams.append('search', params.search);
            }

            const url = params?.search
                ? `${ENDPOINTS.DM_ELIGIBLE_USERS}?${queryParams.toString()}`
                : ENDPOINTS.DM_ELIGIBLE_USERS;

            const response = await ApiService.get(url);
            return response.data as DMEligibleUser[];
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.detail || 'Failed to fetch users');
        }
    }
);
