import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
    sendChatMessage,
    fetchConversations,
    fetchConversation,
    createConversation,
    updateConversation,
    deleteConversation,
    generateConversationTitle,
} from "./chatThunk";
import { Conversation, Message } from "@/lib/types";

export interface ChatState {
    conversations: Conversation[];
    currentConversation: Conversation | null;
    messages: Message[];
    loading: boolean;
    sendingMessage: boolean;
    error: string | null;
    pagination: {
        total: number;
        page: number;
        pageSize: number;
        hasMore: boolean;
    };
}

const initialState: ChatState = {
    conversations: [],
    currentConversation: null,
    messages: [],
    loading: false,
    sendingMessage: false,
    error: null,
    pagination: {
        total: 0,
        page: 1,
        pageSize: 20,
        hasMore: false,
    },
};

const chatSlice = createSlice({
    name: "chat",
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearMessages: (state) => {
            state.messages = [];
        },
        setCurrentConversation: (state, action: PayloadAction<Conversation | null>) => {
            state.currentConversation = action.payload;
            if (action.payload?.messages) {
                state.messages = action.payload.messages;
            }
        },
        clearCurrentConversation: (state) => {
            state.currentConversation = null;
            state.messages = [];
        },
        addOptimisticMessage: (state, action: PayloadAction<Message>) => {
            state.messages.push(action.payload);
        },
    },
    extraReducers: (builder) => {
        // Send Chat Message
        builder.addCase(sendChatMessage.pending, (state) => {
            state.sendingMessage = true;
            state.error = null;
        });
        builder.addCase(sendChatMessage.fulfilled, (state, action) => {
            state.sendingMessage = false;
            
            // Add the assistant's response to messages
            const assistantMessage: Message = {
                id: action.payload.message_id,
                conversation_id: action.payload.conversation_id,
                role: action.payload.role,
                content: action.payload.content,
                content_type: action.payload.content_type,
                tool_name: null,
                tool_input: null,
                tool_output: null,
                meta_data: {},
                is_deleted: false,
                created_at: action.payload.created_at,
                updated_at: action.payload.created_at,
            };
            
            state.messages.push(assistantMessage);
            
            // Update current conversation ID if it's a new conversation
            if (state.currentConversation) {
                state.currentConversation.id = action.payload.conversation_id;
                state.currentConversation.updated_at = action.payload.created_at;
            }
        });
        builder.addCase(sendChatMessage.rejected, (state, action) => {
            state.sendingMessage = false;
            state.error = action.payload || "Failed to send message";
        });

        // Fetch Conversations
        builder.addCase(fetchConversations.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchConversations.fulfilled, (state, action) => {
            state.loading = false;
            state.conversations = action.payload.conversations;
            state.pagination = {
                total: action.payload.total,
                page: action.payload.page,
                pageSize: action.payload.page_size,
                hasMore: action.payload.has_more,
            };
        });
        builder.addCase(fetchConversations.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || "Failed to fetch conversations";
        });

        // Fetch Single Conversation
        builder.addCase(fetchConversation.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchConversation.fulfilled, (state, action) => {
            state.loading = false;
            state.currentConversation = action.payload;
            state.messages = action.payload.messages || [];
        });
        builder.addCase(fetchConversation.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || "Failed to fetch conversation";
        });

        // Create Conversation
        builder.addCase(createConversation.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(createConversation.fulfilled, (state, action) => {
            state.loading = false;
            state.currentConversation = action.payload;
            state.messages = [];
            state.conversations.unshift(action.payload);
        });
        builder.addCase(createConversation.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || "Failed to create conversation";
        });

        // Update Conversation
        builder.addCase(updateConversation.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(updateConversation.fulfilled, (state, action) => {
            state.loading = false;
            if (state.currentConversation?.id === action.payload.id) {
                state.currentConversation = action.payload;
            }
            const index = state.conversations.findIndex(c => c.id === action.payload.id);
            if (index !== -1) {
                state.conversations[index] = action.payload;
            }
        });
        builder.addCase(updateConversation.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || "Failed to update conversation";
        });

        // Delete Conversation
        builder.addCase(deleteConversation.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(deleteConversation.fulfilled, (state, action) => {
            state.loading = false;
            state.conversations = state.conversations.filter(c => c.id !== action.payload);
            if (state.currentConversation?.id === action.payload) {
                state.currentConversation = null;
                state.messages = [];
            }
        });
        builder.addCase(deleteConversation.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || "Failed to delete conversation";
        });

        // Generate Conversation Title
        builder.addCase(generateConversationTitle.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(generateConversationTitle.fulfilled, (state, action) => {
            state.loading = false;
            if (state.currentConversation?.id === action.payload.id) {
                state.currentConversation = action.payload;
            }
            const index = state.conversations.findIndex(c => c.id === action.payload.id);
            if (index !== -1) {
                state.conversations[index] = action.payload;
            }
        });
        builder.addCase(generateConversationTitle.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || "Failed to generate title";
        });
    },
});

export const {
    clearError,
    clearMessages,
    setCurrentConversation,
    clearCurrentConversation,
    addOptimisticMessage,
} = chatSlice.actions;

export default chatSlice.reducer;