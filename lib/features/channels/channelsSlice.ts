import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  fetchChannels,
  fetchChannel,
  createChannel,
  updateChannel,
  deleteChannel,
  fetchTopicsByChannel,
  fetchUserTopics,
  fetchTopic,
  createTopic,
  updateTopic,
  addTopicMember,
  removeTopicMember,
  fetchTopicMessages,
  createTopicMessage,
  updateTopicMessage,
  deleteTopicMessage,
  addReaction,
  removeReaction,
} from './channelsThunk';
import {
  Channel,
  Topic,
  TopicMessage,
  MessageReaction,
  GroupedReaction,
} from '@/lib/types';

export interface OptimisticMessage extends TopicMessage {
  _optimistic?: boolean;
  _pending?: boolean;
  _failed?: boolean;
  _tempId?: string;
}

export interface ChannelsState {
  channels: Channel[];
  currentChannel: Channel | null;
  topics: Topic[];
  currentTopic: Topic | null;
  messages: OptimisticMessage[];
  loading: boolean;
  error: string | null;
  messagesLoading: boolean;
  messagesError: string | null;
  hasMoreMessages: boolean;
  currentPage: number;
}

const initialState: ChannelsState = {
  channels: [],
  currentChannel: null,
  topics: [],
  currentTopic: null,
  messages: [],
  loading: false,
  error: null,
  messagesLoading: false,
  messagesError: null,
  hasMoreMessages: false,
  currentPage: 1,
};

const channelsSlice = createSlice({
  name: 'channels',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.messagesError = null;
    },
    setCurrentChannel: (state, action: PayloadAction<Channel | null>) => {
      state.currentChannel = action.payload;
    },
    setCurrentTopic: (state, action: PayloadAction<Topic | null>) => {
      state.currentTopic = action.payload;
      state.messages = [];
      state.currentPage = 1;
      state.hasMoreMessages = false;
    },
    addMessage: (state, action: PayloadAction<TopicMessage>) => {
      // Add message if it doesn't exist
      const exists = state.messages.find((m) => m.id === action.payload.id);
      if (!exists) {
        state.messages.push(action.payload);
      }
    },
    addOptimisticMessage: (state, action: PayloadAction<OptimisticMessage>) => {
      // Add optimistic message immediately
      state.messages.push(action.payload);
    },
    updateOptimisticMessage: (state, action: PayloadAction<{ tempId: string; message: TopicMessage }>) => {
      // Update optimistic message with real ID and remove optimistic flags
      const message = state.messages.find((m) => m._tempId === action.payload.tempId);
      if (message) {
        // Update with real message data but keep it in the same position
        message.id = action.payload.message.id;
        message.created_at = action.payload.message.created_at;
        // Remove optimistic flags
        message._optimistic = false;
        message._pending = false;
        message._failed = false;
        // Keep _tempId for now in case we need to reference it
      }
    },
    markMessageAsFailed: (state, action: PayloadAction<string>) => {
      // Mark message as failed
      const message = state.messages.find((m) => m._tempId === action.payload);
      if (message) {
        message._failed = true;
        message._pending = false;
      }
    },
    removeOptimisticMessage: (state, action: PayloadAction<string>) => {
      // Remove failed message (when user cancels retry)
      state.messages = state.messages.filter((m) => m._tempId !== action.payload);
    },
    updateMessageInState: (state, action: PayloadAction<{ messageId: string; content: string; editedAt: string }>) => {
      const message = state.messages.find((m) => m.id === action.payload.messageId);
      if (message) {
        message.content = action.payload.content;
        message.is_edited = true;
        message.edited_at = action.payload.editedAt;
      }
    },
    deleteMessageInState: (state, action: PayloadAction<{ messageId: string; deletedAt: string }>) => {
      const message = state.messages.find((m) => m.id === action.payload.messageId);
      if (message) {
        message.is_deleted = true;
        message.deleted_at = action.payload.deletedAt;
      }
    },
    addReactionToMessage: (state, action: PayloadAction<{ messageId: string; reaction: MessageReaction; currentUserId?: string }>) => {
      const message = state.messages.find((m) => m.id === action.payload.messageId);
      if (message) {
        if (!message.reactions) {
          message.reactions = [];
        }
        
        // Check if reactions are in grouped format
        const isGrouped = message.reactions.length > 0 && 'user_reacted' in message.reactions[0];
        
        if (isGrouped) {
          // Handle grouped format
          const groupedReactions = message.reactions as GroupedReaction[];
          const existingReaction = groupedReactions.find((r) => r.emoji === action.payload.reaction.emoji);
          
          if (existingReaction) {
            // Update existing grouped reaction
            existingReaction.count += 1;
            if (!existingReaction.users.includes(action.payload.reaction.user_id)) {
              existingReaction.users.push(action.payload.reaction.user_id);
            }
            // Update user_reacted if this is the current user
            if (action.payload.currentUserId && action.payload.reaction.user_id === action.payload.currentUserId) {
              existingReaction.user_reacted = true;
            }
          } else {
            // Add new grouped reaction
            const isCurrentUser = action.payload.currentUserId === action.payload.reaction.user_id;
            groupedReactions.push({
              emoji: action.payload.reaction.emoji,
              count: 1,
              users: [action.payload.reaction.user_id],
              user_reacted: isCurrentUser,
            });
          }
        } else {
          // Handle individual format (legacy)
          const exists = (message.reactions as MessageReaction[]).find(
            (r) => r.user_id === action.payload.reaction.user_id && r.emoji === action.payload.reaction.emoji
          );
          if (!exists) {
            (message.reactions as MessageReaction[]).push(action.payload.reaction);
          }
        }
      }
    },
    removeReactionFromMessage: (state, action: PayloadAction<{ messageId: string; userId: string; emoji: string; currentUserId?: string }>) => {
      const message = state.messages.find((m) => m.id === action.payload.messageId);
      if (message && message.reactions) {
        // Check if reactions are in grouped format
        const isGrouped = message.reactions.length > 0 && 'user_reacted' in message.reactions[0];
        
        if (isGrouped) {
          // Handle grouped format
          const groupedReactions = message.reactions as GroupedReaction[];
          const reactionIndex = groupedReactions.findIndex((r) => r.emoji === action.payload.emoji);
          
          if (reactionIndex !== -1) {
            const reaction = groupedReactions[reactionIndex];
            reaction.count -= 1;
            reaction.users = reaction.users.filter((id) => id !== action.payload.userId);
            
            // Update user_reacted if this is the current user
            if (action.payload.currentUserId && action.payload.userId === action.payload.currentUserId) {
              reaction.user_reacted = false;
            }
            
            // Remove the reaction entirely if count reaches 0
            if (reaction.count <= 0) {
              groupedReactions.splice(reactionIndex, 1);
            }
          }
        } else {
          // Handle individual format (legacy)
          message.reactions = (message.reactions as MessageReaction[]).filter(
            (r) => !(r.user_id === action.payload.userId && r.emoji === action.payload.emoji)
          );
        }
      }
    },
    updateTopicInList: (state, action: PayloadAction<Topic>) => {
      const index = state.topics.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) {
        state.topics[index] = action.payload;
      }
    },
    addTopicToList: (state, action: PayloadAction<Topic>) => {
      const exists = state.topics.find((t) => t.id === action.payload.id);
      if (!exists) {
        state.topics.push(action.payload);
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch Channels
    builder
      .addCase(fetchChannels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChannels.fulfilled, (state, action) => {
        state.loading = false;
        state.channels = action.payload;
      })
      .addCase(fetchChannels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch channels';
      });

    // Fetch Channel
    builder
      .addCase(fetchChannel.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChannel.fulfilled, (state, action) => {
        state.loading = false;
        state.currentChannel = action.payload;
      })
      .addCase(fetchChannel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch channel';
      });

    // Create Channel
    builder
      .addCase(createChannel.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createChannel.fulfilled, (state, action) => {
        state.loading = false;
        state.channels.push(action.payload);
      })
      .addCase(createChannel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to create channel';
      });

    // Update Channel
    builder
      .addCase(updateChannel.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateChannel.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.channels.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) {
          state.channels[index] = action.payload;
        }
        if (state.currentChannel?.id === action.payload.id) {
          state.currentChannel = action.payload;
        }
      })
      .addCase(updateChannel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update channel';
      });

    // Delete Channel
    builder
      .addCase(deleteChannel.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteChannel.fulfilled, (state, action) => {
        state.loading = false;
        state.channels = state.channels.filter((c) => c.id !== action.payload);
        if (state.currentChannel?.id === action.payload) {
          state.currentChannel = null;
        }
      })
      .addCase(deleteChannel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to delete channel';
      });

    // Fetch Topics by Channel
    builder
      .addCase(fetchTopicsByChannel.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTopicsByChannel.fulfilled, (state, action) => {
        state.loading = false;
        state.topics = action.payload;
      })
      .addCase(fetchTopicsByChannel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch topics';
      });

    // Fetch User Topics
    builder
      .addCase(fetchUserTopics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserTopics.fulfilled, (state, action) => {
        state.loading = false;
        state.topics = action.payload;
      })
      .addCase(fetchUserTopics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch user topics';
      });

    // Fetch Topic
    builder
      .addCase(fetchTopic.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTopic.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTopic = action.payload;
      })
      .addCase(fetchTopic.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch topic';
      });

    // Create Topic
    builder
      .addCase(createTopic.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTopic.fulfilled, (state, action) => {
        state.loading = false;
        state.topics.push(action.payload);
      })
      .addCase(createTopic.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to create topic';
      });

    // Update Topic
    builder
      .addCase(updateTopic.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTopic.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.topics.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.topics[index] = action.payload;
        }
        if (state.currentTopic?.id === action.payload.id) {
          state.currentTopic = action.payload;
        }
      })
      .addCase(updateTopic.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update topic';
      });

    // Add Topic Member
    builder
      .addCase(addTopicMember.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addTopicMember.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(addTopicMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to add member';
      });

    // Remove Topic Member
    builder
      .addCase(removeTopicMember.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeTopicMember.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(removeTopicMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to remove member';
      });

    // Fetch Topic Messages
    builder
      .addCase(fetchTopicMessages.pending, (state) => {
        state.messagesLoading = true;
        state.messagesError = null;
      })
      .addCase(fetchTopicMessages.fulfilled, (state, action) => {
        state.messagesLoading = false;
        // Reverse messages so oldest is first, newest is last (bottom)
        const sortedMessages = [...action.payload.messages].reverse();
        if (action.payload.page === 1) {
          state.messages = sortedMessages;
        } else {
          // Prepend older messages
          state.messages = [...sortedMessages, ...state.messages];
        }
        state.hasMoreMessages = action.payload.has_more;
        state.currentPage = action.payload.page;
      })
      .addCase(fetchTopicMessages.rejected, (state, action) => {
        state.messagesLoading = false;
        state.messagesError = action.payload || 'Failed to fetch messages';
      });

    // Create Topic Message
    builder
      .addCase(createTopicMessage.pending, (state) => {
        state.messagesError = null;
      })
      .addCase(createTopicMessage.fulfilled, (state, action) => {
        // Message will be added via Socket.IO event
      })
      .addCase(createTopicMessage.rejected, (state, action) => {
        state.messagesError = action.payload || 'Failed to send message';
      });

    // Update Topic Message
    builder
      .addCase(updateTopicMessage.pending, (state) => {
        state.messagesError = null;
      })
      .addCase(updateTopicMessage.fulfilled, (state, action) => {
        const message = state.messages.find((m) => m.id === action.payload.id);
        if (message) {
          message.content = action.payload.content;
          message.is_edited = action.payload.is_edited;
          message.edited_at = action.payload.edited_at;
        }
      })
      .addCase(updateTopicMessage.rejected, (state, action) => {
        state.messagesError = action.payload || 'Failed to update message';
      });

    // Delete Topic Message
    builder
      .addCase(deleteTopicMessage.pending, (state) => {
        state.messagesError = null;
      })
      .addCase(deleteTopicMessage.fulfilled, (state, action) => {
        const message = state.messages.find((m) => m.id === action.payload);
        if (message) {
          message.is_deleted = true;
          message.deleted_at = new Date().toISOString();
        }
      })
      .addCase(deleteTopicMessage.rejected, (state, action) => {
        state.messagesError = action.payload || 'Failed to delete message';
      });

    // Add Reaction
    builder
      .addCase(addReaction.pending, (state) => {
        state.messagesError = null;
      })
      .addCase(addReaction.fulfilled, (state) => {
        // Reaction will be added via Socket.IO event
      })
      .addCase(addReaction.rejected, (state, action) => {
        state.messagesError = action.payload || 'Failed to add reaction';
      });

    // Remove Reaction
    builder
      .addCase(removeReaction.pending, (state) => {
        state.messagesError = null;
      })
      .addCase(removeReaction.fulfilled, (state) => {
        // Reaction will be removed via Socket.IO event
      })
      .addCase(removeReaction.rejected, (state, action) => {
        state.messagesError = action.payload || 'Failed to remove reaction';
      });
  },
});

export const {
  clearError,
  setCurrentChannel,
  setCurrentTopic,
  addMessage,
  addOptimisticMessage,
  updateOptimisticMessage,
  markMessageAsFailed,
  removeOptimisticMessage,
  updateMessageInState,
  deleteMessageInState,
  addReactionToMessage,
  removeReactionFromMessage,
  updateTopicInList,
  addTopicToList,
} = channelsSlice.actions;

export default channelsSlice.reducer;
