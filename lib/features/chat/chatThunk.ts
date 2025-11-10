import { createAsyncThunk } from "@reduxjs/toolkit";
import { ApiService } from "@/lib/util/apiService";
import { ENDPOINTS } from "@/lib/constants/endpoints";
import {
    ChatRequest,
    ChatResponse,
    ConversationsListResponse,
    Conversation,
    CreateConversationRequest,
    UpdateConversationRequest,
} from "@/lib/types";
import { AxiosError } from "axios";

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

// Send Chat Message
export const sendChatMessage = createAsyncThunk<
    ChatResponse,
    ChatRequest,
    { rejectValue: string }
>("chat/sendMessage", async (payload, { rejectWithValue }) => {
    try {
        const res = await ApiService.post(
            ENDPOINTS.AI_CHAT,
            payload,
            undefined,
            true
        );
        return res.data;
    } catch (err: unknown) {
        return rejectWithValue(getErrorMessage(err, "Failed to send message"));
    }
});

// Fetch Conversations List
export const fetchConversations = createAsyncThunk<
    ConversationsListResponse,
    { page?: number; pageSize?: number; includeDeleted?: boolean },
    { rejectValue: string }
>("chat/fetchConversations", async (payload, { rejectWithValue }) => {
    try {
        const params = new URLSearchParams();
        if (payload.page) params.append('page', payload.page.toString());
        if (payload.pageSize) params.append('page_size', payload.pageSize.toString());
        if (payload.includeDeleted) params.append('include_deleted', 'true');

        const endpoint = `${ENDPOINTS.CONVERSATIONS_LIST}${params.toString() ? `?${params.toString()}` : ''}`;
        const res = await ApiService.get(endpoint, undefined, true);
        return res.data;
    } catch (err: unknown) {
        return rejectWithValue(getErrorMessage(err, "Failed to fetch conversations"));
    }
});

// Fetch Single Conversation
export const fetchConversation = createAsyncThunk<
    Conversation,
    { conversationId: string; includeMessages?: boolean },
    { rejectValue: string }
>("chat/fetchConversation", async (payload, { rejectWithValue }) => {
    try {
        const params = new URLSearchParams();
        if (payload.includeMessages !== undefined) {
            params.append('include_messages', payload.includeMessages.toString());
        }

        const endpoint = `${ENDPOINTS.CONVERSATIONS_GET(payload.conversationId)}${params.toString() ? `?${params.toString()}` : ''}`;
        const res = await ApiService.get(endpoint, undefined, true);
        return res.data;
    } catch (err: unknown) {
        return rejectWithValue(getErrorMessage(err, "Failed to fetch conversation"));
    }
});

// Create New Conversation
export const createConversation = createAsyncThunk<
    Conversation,
    CreateConversationRequest,
    { rejectValue: string }
>("chat/createConversation", async (payload, { rejectWithValue }) => {
    try {
        const res = await ApiService.post(
            ENDPOINTS.CONVERSATIONS_CREATE,
            payload,
            undefined,
            true
        );
        return res.data;
    } catch (err: unknown) {
        return rejectWithValue(getErrorMessage(err, "Failed to create conversation"));
    }
});

// Update Conversation
export const updateConversation = createAsyncThunk<
    Conversation,
    { conversationId: string; data: UpdateConversationRequest },
    { rejectValue: string }
>("chat/updateConversation", async (payload, { rejectWithValue }) => {
    try {
        const res = await ApiService.patch(
            ENDPOINTS.CONVERSATIONS_UPDATE(payload.conversationId),
            payload.data,
            undefined,
            true
        );
        return res.data;
    } catch (err: unknown) {
        return rejectWithValue(getErrorMessage(err, "Failed to update conversation"));
    }
});

// Delete Conversation
export const deleteConversation = createAsyncThunk<
    string,
    { conversationId: string; hardDelete?: boolean },
    { rejectValue: string }
>("chat/deleteConversation", async (payload, { rejectWithValue }) => {
    try {
        const params = new URLSearchParams();
        if (payload.hardDelete) params.append('hard_delete', 'true');

        const endpoint = `${ENDPOINTS.CONVERSATIONS_DELETE(payload.conversationId)}${params.toString() ? `?${params.toString()}` : ''}`;
        await ApiService.delete(endpoint, undefined, undefined, true);
        return payload.conversationId;
    } catch (err: unknown) {
        return rejectWithValue(getErrorMessage(err, "Failed to delete conversation"));
    }
});

// Generate Conversation Title
export const generateConversationTitle = createAsyncThunk<
    Conversation,
    { conversationId: string },
    { rejectValue: string }
>("chat/generateTitle", async (payload, { rejectWithValue }) => {
    try {
        const res = await ApiService.post(
            ENDPOINTS.CONVERSATIONS_GENERATE_TITLE(payload.conversationId),
            {},
            undefined,
            true
        );
        return res.data;
    } catch (err: unknown) {
        return rejectWithValue(getErrorMessage(err, "Failed to generate title"));
    }
});