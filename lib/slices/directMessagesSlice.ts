import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ApiService } from '@/lib/util/apiService';
import { ENDPOINTS } from '@/lib/constants/endpoints';
import { UserWithChatInfo, DirectMessagesResponse, DMConversation, DirectMessage, DMEligibleUser } from '@/lib/types';
import {
    fetchDMConversations,
    fetchDMMessages,
    sendDM,
    editDM,
    deleteDM,
    markDMAsRead,
    addDMReaction,
    removeDMReaction,
    fetchDMEligibleUsers,
} from '@/lib/features/directMessages/directMessagesThunk';

// State interface
export interface DirectMessagesState {
    // Legacy fields for backward compatibility
    users: UserWithChatInfo[];
    selectedUser: UserWithChatInfo | null;
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
    
    // New DM fields
    conversations: DMConversation[];
    currentConversation: DMConversation | null;
    messages: DirectMessage[];
    messagesPage: number;
    messagesPageSize: number;
    messagesHasMore: boolean;
    messagesTotalCount: number;
    eligibleUsers: DMEligibleUser[];
    
    // Loading states
    loading: boolean;
    conversationsLoading: boolean;
    messagesLoading: boolean;
    sendingMessage: boolean;
    eligibleUsersLoading: boolean;
    
    // Error states
    error: string | null;
    conversationsError: string | null;
    messagesError: string | null;
    sendError: string | null;
}

// Initial state
const initialState: DirectMessagesState = {
    // Legacy fields
    users: [],
    selectedUser: null,
    total: 0,
    page: 1,
    pageSize: 20,
    hasMore: false,
    
    // New DM fields
    conversations: [],
    currentConversation: null,
    messages: [],
    messagesPage: 1,
    messagesPageSize: 50,
    messagesHasMore: false,
    messagesTotalCount: 0,
    eligibleUsers: [],
    
    // Loading states
    loading: false,
    conversationsLoading: false,
    messagesLoading: false,
    sendingMessage: false,
    eligibleUsersLoading: false,
    
    // Error states
    error: null,
    conversationsError: null,
    messagesError: null,
    sendError: null,
};

// Async thunks
export const fetchDirectMessages = createAsyncThunk<
    DirectMessagesResponse,
    { page?: number; pageSize?: number; search?: string } | void,
    { rejectValue: string }
>(
    'directMessages/fetchDirectMessages',
    async (params, { rejectWithValue }) => {
        try {
            const queryParams = new URLSearchParams();
            if (params?.page) queryParams.append('page', params.page.toString());
            if (params?.pageSize) queryParams.append('page_size', params.pageSize.toString());
            if (params?.search) queryParams.append('search', params.search);

            const response = await ApiService.get(
                `${ENDPOINTS.DIRECT_MESSAGES_LIST}?${queryParams.toString()}`
            );
            
            return {
                users: response.data.users,
                total: response.data.total,
                page: response.data.page,
                page_size: response.data.page_size,
                has_more: response.data.has_more,
            } as DirectMessagesResponse;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.detail || 'Failed to fetch direct messages');
        }
    }
);

// Slice
const directMessagesSlice = createSlice({
    name: 'directMessages',
    initialState,
    reducers: {
        setSelectedUser: (state, action: PayloadAction<UserWithChatInfo | null>) => {
            state.selectedUser = action.payload;
        },
        setCurrentConversation: (state, action: PayloadAction<DMConversation | null>) => {
            state.currentConversation = action.payload;
        },
        clearError: (state) => {
            state.error = null;
            state.conversationsError = null;
            state.messagesError = null;
            state.sendError = null;
        },
        resetDirectMessages: (state) => {
            state.users = [];
            state.selectedUser = null;
            state.total = 0;
            state.page = 1;
            state.hasMore = false;
            state.conversations = [];
            state.currentConversation = null;
            state.messages = [];
            state.messagesPage = 1;
            state.messagesHasMore = false;
        },
        updateUserUnreadCount: (state, action: PayloadAction<{ userId: string; count: number }>) => {
            const user = state.users.find(u => u.id === action.payload.userId);
            if (user) {
                user.unread_count = action.payload.count;
            }
        },
        addOptimisticMessage: (state, action: PayloadAction<DirectMessage>) => {
            state.messages.push(action.payload);
        },
        updateOptimisticMessage: (state, action: PayloadAction<{ tempId: string; message: DirectMessage }>) => {
            const index = state.messages.findIndex(m => m._tempId === action.payload.tempId);
            if (index !== -1) {
                state.messages[index] = action.payload.message;
            }
        },
        markMessageAsFailed: (state, action: PayloadAction<string>) => {
            const message = state.messages.find(m => m._tempId === action.payload);
            if (message) {
                message._pending = false;
                message._failed = true;
            }
        },
        removeOptimisticMessage: (state, action: PayloadAction<string>) => {
            state.messages = state.messages.filter(m => m._tempId !== action.payload);
        },
        updateMessageInList: (state, action: PayloadAction<DirectMessage>) => {
            const index = state.messages.findIndex(m => m.id === action.payload.id);
            if (index !== -1) {
                state.messages[index] = action.payload;
            }
        },
        removeMessageFromList: (state, action: PayloadAction<string>) => {
            state.messages = state.messages.filter(m => m.id !== action.payload);
        },
        addIncomingMessage: (state, action: PayloadAction<DirectMessage>) => {
            // Add message to the list
            state.messages.push(action.payload);
            state.messagesTotalCount += 1;

            // Update conversation list with the new message
            const senderId = action.payload.sender_id;
            const receiverId = action.payload.receiver_id;
            const otherUserId = senderId === state.currentConversation?.user.id ? senderId : receiverId;

            const conversationIndex = state.conversations.findIndex(
                (conv) => conv.user.id === otherUserId
            );

            if (conversationIndex !== -1) {
                // Update existing conversation
                const conversation = state.conversations[conversationIndex];
                state.conversations[conversationIndex] = {
                    ...conversation,
                    last_message: {
                        id: action.payload.id,
                        content: action.payload.content,
                        created_at: action.payload.created_at,
                        is_read: action.payload.is_read || false,
                    },
                    last_message_at: action.payload.created_at,
                };

                // Sort conversations by last_message_at (most recent first)
                state.conversations.sort((a, b) => {
                    const dateA = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
                    const dateB = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
                    return dateB - dateA;
                });
            }
        },
    },
    extraReducers: (builder) => {
        // Legacy: Fetch direct messages
        builder
            .addCase(fetchDirectMessages.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDirectMessages.fulfilled, (state, action) => {
                state.loading = false;
                state.users = action.payload.users;
                state.total = action.payload.total;
                state.page = action.payload.page;
                state.pageSize = action.payload.page_size;
                state.hasMore = action.payload.has_more;
            })
            .addCase(fetchDirectMessages.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch direct messages';
            })
            
            // Fetch conversations
            .addCase(fetchDMConversations.pending, (state) => {
                state.conversationsLoading = true;
                state.conversationsError = null;
            })
            .addCase(fetchDMConversations.fulfilled, (state, action) => {
                state.conversationsLoading = false;
                // Sort conversations by last_message_at (most recent first)
                state.conversations = action.payload.conversations.sort((a, b) => {
                    const dateA = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
                    const dateB = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
                    return dateB - dateA;
                });
            })
            .addCase(fetchDMConversations.rejected, (state, action) => {
                state.conversationsLoading = false;
                state.conversationsError = action.payload || 'Failed to fetch conversations';
            })
            
            // Fetch messages
            .addCase(fetchDMMessages.pending, (state) => {
                state.messagesLoading = true;
                state.messagesError = null;
            })
            .addCase(fetchDMMessages.fulfilled, (state, action) => {
                state.messagesLoading = false;
                // Reverse the messages array so oldest messages appear first (at top) and newest at bottom
                state.messages = [...action.payload.messages].reverse();
                state.messagesPage = action.payload.page;
                state.messagesPageSize = action.payload.page_size;
                state.messagesHasMore = action.payload.has_more;
                state.messagesTotalCount = action.payload.total;
            })
            .addCase(fetchDMMessages.rejected, (state, action) => {
                state.messagesLoading = false;
                state.messagesError = action.payload || 'Failed to fetch messages';
            })
            
            // Send message
            .addCase(sendDM.pending, (state) => {
                state.sendingMessage = true;
                state.sendError = null;
            })
            .addCase(sendDM.fulfilled, (state, action) => {
                state.sendingMessage = false;
                // Don't add message here - it's already added optimistically
                // The updateOptimisticMessage reducer will replace it with the real one

                // Update or create conversation in the list
                if (state.currentConversation) {
                    const conversationIndex = state.conversations.findIndex(
                        (conv) => conv.user.id === state.currentConversation?.user.id
                    );

                    const updatedConversation: DMConversation = {
                        user: state.currentConversation.user,
                        last_message: {
                            id: action.payload.id,
                            content: action.payload.content,
                            created_at: action.payload.created_at,
                            is_read: action.payload.is_read || false,
                        },
                        unread_count: state.currentConversation.unread_count,
                        last_message_at: action.payload.created_at,
                    };

                    if (conversationIndex !== -1) {
                        // Update existing conversation
                        state.conversations[conversationIndex] = updatedConversation;
                    } else {
                        // Add new conversation to the list
                        state.conversations.unshift(updatedConversation);
                    }

                    // Update current conversation
                    state.currentConversation = updatedConversation;

                    // Sort conversations by last_message_at (most recent first)
                    state.conversations.sort((a, b) => {
                        const dateA = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
                        const dateB = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
                        return dateB - dateA;
                    });
                }
            })
            .addCase(sendDM.rejected, (state, action) => {
                state.sendingMessage = false;
                state.sendError = action.payload || 'Failed to send message';
            })
            
            // Edit message
            .addCase(editDM.fulfilled, (state, action) => {
                const index = state.messages.findIndex(m => m.id === action.payload.id);
                if (index !== -1) {
                    state.messages[index] = action.payload;
                }
            })
            
            // Delete message
            .addCase(deleteDM.fulfilled, (state, action) => {
                const message = state.messages.find(m => m.id === action.payload.messageId);
                if (message) {
                    message.is_deleted = true;
                    message.deleted_at = action.payload.deletedAt;
                    message.content = '';
                    message.attachments = [];
                    message.reactions = [];
                }
            })
            
            // Mark as read
            .addCase(markDMAsRead.fulfilled, (state, action) => {
                const message = state.messages.find(m => m.id === action.payload);
                if (message) {
                    message.is_read = true;
                    message.read_at = new Date().toISOString();
                }
            })
            
            // Add reaction
            .addCase(addDMReaction.pending, (state, action) => {
                state.messagesError = null;
                const { messageId, emoji } = action.meta.arg;
                const currentUserId = action.meta.arg.currentUserId;

                if (!currentUserId) return;

                const message = state.messages.find((m) => m.id === messageId);
                if (message) {
                    if (!message.reactions) {
                        message.reactions = [];
                    }

                    const existingReaction = message.reactions.find((r) => r.emoji === emoji);

                    if (existingReaction) {
                        // Update existing reaction
                        existingReaction.count += 1;
                        if (!existingReaction.users.includes(currentUserId)) {
                            existingReaction.users.push(currentUserId);
                        }
                        existingReaction.user_reacted = true;
                    } else {
                        // Add new reaction
                        message.reactions.push({
                            emoji: emoji,
                            count: 1,
                            users: [currentUserId],
                            user_reacted: true,
                        });
                    }
                }
            })
            .addCase(addDMReaction.fulfilled, (state, action) => {
                // Reaction will be confirmed via Socket.IO event or API response
                const message = state.messages.find(m => m.id === action.payload.messageId);
                if (message) {
                    message.reactions = action.payload.reactions;
                }
            })
            .addCase(addDMReaction.rejected, (state, action) => {
                state.messagesError = action.payload || 'Failed to add reaction';
                // Revert optimistic update
                const { messageId, emoji } = action.meta.arg;
                const currentUserId = action.meta.arg.currentUserId;

                if (!currentUserId) return;

                const message = state.messages.find((m) => m.id === messageId);
                if (message && message.reactions) {
                    const reactionIndex = message.reactions.findIndex((r) => r.emoji === emoji);

                    if (reactionIndex !== -1) {
                        const reaction = message.reactions[reactionIndex];
                        reaction.count -= 1;
                        reaction.users = reaction.users.filter((id) => id !== currentUserId);
                        reaction.user_reacted = false;

                        if (reaction.count <= 0) {
                            message.reactions.splice(reactionIndex, 1);
                        }
                    }
                }
            })
            
            // Remove reaction
            .addCase(removeDMReaction.pending, (state, action) => {
                state.messagesError = null;
                const { messageId, emoji } = action.meta.arg;
                const currentUserId = action.meta.arg.currentUserId;

                if (!currentUserId) return;

                const message = state.messages.find((m) => m.id === messageId);
                if (message && message.reactions) {
                    const reactionIndex = message.reactions.findIndex((r) => r.emoji === emoji);

                    if (reactionIndex !== -1) {
                        const reaction = message.reactions[reactionIndex];
                        reaction.count -= 1;
                        reaction.users = reaction.users.filter((id) => id !== currentUserId);
                        reaction.user_reacted = false;

                        if (reaction.count <= 0) {
                            message.reactions.splice(reactionIndex, 1);
                        }
                    }
                }
            })
            .addCase(removeDMReaction.fulfilled, (state, action) => {
                // Reaction removal will be confirmed via Socket.IO event or API response
                const message = state.messages.find(m => m.id === action.payload.messageId);
                if (message) {
                    message.reactions = action.payload.reactions;
                }
            })
            .addCase(removeDMReaction.rejected, (state, action) => {
                state.messagesError = action.payload || 'Failed to remove reaction';
                // Revert optimistic update (Add it back)
                const { messageId, emoji } = action.meta.arg;
                const currentUserId = action.meta.arg.currentUserId;

                if (!currentUserId) return;

                const message = state.messages.find((m) => m.id === messageId);
                if (message) {
                    if (!message.reactions) {
                        message.reactions = [];
                    }

                    const existingReaction = message.reactions.find((r) => r.emoji === emoji);

                    if (existingReaction) {
                        existingReaction.count += 1;
                        if (!existingReaction.users.includes(currentUserId)) {
                            existingReaction.users.push(currentUserId);
                        }
                        existingReaction.user_reacted = true;
                    } else {
                        message.reactions.push({
                            emoji: emoji,
                            count: 1,
                            users: [currentUserId],
                            user_reacted: true,
                        });
                    }
                }
            })
            
            // Fetch eligible users
            .addCase(fetchDMEligibleUsers.pending, (state) => {
                state.eligibleUsersLoading = true;
            })
            .addCase(fetchDMEligibleUsers.fulfilled, (state, action) => {
                state.eligibleUsersLoading = false;
                state.eligibleUsers = action.payload;
            })
            .addCase(fetchDMEligibleUsers.rejected, (state, action) => {
                state.eligibleUsersLoading = false;
            });
    },
});

export const { 
    setSelectedUser,
    setCurrentConversation,
    clearError, 
    resetDirectMessages,
    updateUserUnreadCount,
    addOptimisticMessage,
    updateOptimisticMessage,
    markMessageAsFailed,
    removeOptimisticMessage,
    updateMessageInList,
    removeMessageFromList,
    addIncomingMessage,
} = directMessagesSlice.actions;

export default directMessagesSlice.reducer;
