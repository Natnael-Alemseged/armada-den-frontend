import { createAsyncThunk } from '@reduxjs/toolkit';
import { ApiService } from '@/lib/util/apiService';
import { ENDPOINTS } from '@/lib/constants/endpoints';
import {
  Channel,
  Topic,
  TopicMessage,
  CreateChannelRequest,
  UpdateChannelRequest,
  CreateTopicRequest,
  UpdateTopicRequest,
  CreateTopicMessageRequest,
  UpdateTopicMessageRequest,
  AddReactionRequest,
  UserForTopicAddition,
} from '@/lib/types';

// Channel Thunks
export const fetchChannels = createAsyncThunk<
  Channel[],
  void,
  { rejectValue: string }
>(
  'channels/fetchChannels',
  async (_, { rejectWithValue }) => {
    try {
      const res = await ApiService.get(ENDPOINTS.CHANNELS_LIST);
      return res.data.channels || res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to fetch channels');
    }
  }
);

export const fetchChannel = createAsyncThunk<
  Channel,
  string,
  { rejectValue: string }
>(
  'channels/fetchChannel',
  async (channelId, { rejectWithValue }) => {
    try {
      const res = await ApiService.get(ENDPOINTS.CHANNELS_GET(channelId));
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to fetch channel');
    }
  }
);

export const createChannel = createAsyncThunk<
  Channel,
  CreateChannelRequest,
  { rejectValue: string }
>(
  'channels/createChannel',
  async (data, { rejectWithValue }) => {
    try {
      const res = await ApiService.post(ENDPOINTS.CHANNELS_CREATE, data);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to create channel');
    }
  }
);

export const updateChannel = createAsyncThunk<
  Channel,
  { channelId: string; data: UpdateChannelRequest },
  { rejectValue: string }
>(
  'channels/updateChannel',
  async ({ channelId, data }, { rejectWithValue }) => {
    try {
      const res = await ApiService.patch(ENDPOINTS.CHANNELS_UPDATE(channelId), data);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to update channel');
    }
  }
);

export const deleteChannel = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>(
  'channels/deleteChannel',
  async (channelId, { rejectWithValue }) => {
    try {
      await ApiService.delete(ENDPOINTS.CHANNELS_DELETE(channelId));
      return channelId;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to delete channel');
    }
  }
);

// Topic Thunks
export const fetchTopicsByChannel = createAsyncThunk<
  Topic[],
  string,
  { rejectValue: string }
>(
  'channels/fetchTopicsByChannel',
  async (channelId, { rejectWithValue }) => {
    try {
      const res = await ApiService.get(ENDPOINTS.CHANNELS_TOPICS(channelId));
      return res.data.topics || res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to fetch topics');
    }
  }
);

export const fetchUserTopics = createAsyncThunk<
  Topic[],
  void,
  { rejectValue: string }
>(
  'channels/fetchUserTopics',
  async (_, { rejectWithValue }) => {
    try {
      const res = await ApiService.get(ENDPOINTS.TOPICS_MY);
      return res.data.topics || res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to fetch user topics');
    }
  }
);

export const fetchTopic = createAsyncThunk<
  Topic,
  string,
  { rejectValue: string }
>(
  'channels/fetchTopic',
  async (topicId, { rejectWithValue }) => {
    try {
      const res = await ApiService.get(ENDPOINTS.TOPICS_GET(topicId));
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to fetch topic');
    }
  }
);

export const createTopic = createAsyncThunk<
  Topic,
  CreateTopicRequest,
  { rejectValue: string }
>(
  'channels/createTopic',
  async (data, { rejectWithValue }) => {
    try {
      const res = await ApiService.post(ENDPOINTS.TOPICS_CREATE, data);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to create topic');
    }
  }
);

export const updateTopic = createAsyncThunk<
  Topic,
  { topicId: string; data: UpdateTopicRequest },
  { rejectValue: string }
>(
  'channels/updateTopic',
  async ({ topicId, data }, { rejectWithValue }) => {
    try {
      const res = await ApiService.patch(ENDPOINTS.TOPICS_UPDATE(topicId), data);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to update topic');
    }
  }
);

export const deleteTopic = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>(
  'channels/deleteTopic',
  async (topicId, { rejectWithValue }) => {
    try {
      await ApiService.delete(ENDPOINTS.TOPICS_DELETE(topicId));
      return topicId;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to delete topic');
    }
  }
);

export const addTopicMember = createAsyncThunk<
  void,
  { topicId: string; userId: string },
  { rejectValue: string }
>(
  'channels/addTopicMember',
  async ({ topicId, userId }, { rejectWithValue }) => {
    try {
      await ApiService.post(ENDPOINTS.TOPICS_MEMBER_ADD(topicId, userId));
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to add member');
    }
  }
);

export const removeTopicMember = createAsyncThunk<
  void,
  { topicId: string; userId: string },
  { rejectValue: string }
>(
  'channels/removeTopicMember',
  async ({ topicId, userId }, { rejectWithValue }) => {
    try {
      await ApiService.delete(ENDPOINTS.TOPICS_MEMBER_REMOVE(topicId, userId));
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to remove member');
    }
  }
);

export const fetchUsersForTopicAddition = createAsyncThunk<
  UserForTopicAddition[],
  { topicId: string; search?: string },
  { rejectValue: string }
>(
  'channels/fetchUsersForTopicAddition',
  async ({ topicId, search }, { rejectWithValue }) => {
    try {
      const res = await ApiService.get(ENDPOINTS.TOPICS_USERS_FOR_ADDITION(topicId, search));
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to fetch users');
    }
  }
);

export const fetchTopicMembers = createAsyncThunk<
  { topicId: string; members: UserForTopicAddition[] },
  string,
  { rejectValue: string }
>(
  'channels/fetchTopicMembers',
  async (topicId, { rejectWithValue }) => {
    try {
      const res = await ApiService.get(ENDPOINTS.TOPICS_USERS_FOR_ADDITION(topicId));
      // Filter only members
      const members = res.data.filter((user: UserForTopicAddition) => user.is_member);
      return { topicId, members };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to fetch topic members');
    }
  }
);

// Message Thunks
export const fetchTopicMessages = createAsyncThunk<
  { messages: TopicMessage[]; page: number; has_more: boolean },
  { topicId: string; page?: number; pageSize?: number },
  { rejectValue: string }
>(
  'channels/fetchTopicMessages',
  async ({ topicId, page = 1, pageSize = 50 }, { rejectWithValue }) => {
    try {
      const res = await ApiService.getWithQuery(
        ENDPOINTS.TOPICS_MESSAGES(topicId),
        { page, page_size: pageSize }
      );
      return {
        messages: res.data.messages || res.data,
        page: res.data.page || page,
        has_more: res.data.has_more || false,
      };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to fetch messages');
    }
  }
);

export const createTopicMessage = createAsyncThunk<
  TopicMessage,
  CreateTopicMessageRequest,
  { rejectValue: string }
>(
  'channels/createTopicMessage',
  async (data, { rejectWithValue }) => {
    try {
      const { topic_id, ...messageData } = data;
      const res = await ApiService.post(ENDPOINTS.TOPICS_MESSAGE_CREATE(topic_id), messageData);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to send message');
    }
  }
);

export const updateTopicMessage = createAsyncThunk<
  TopicMessage,
  { messageId: string; data: UpdateTopicMessageRequest },
  { rejectValue: string }
>(
  'channels/updateTopicMessage',
  async ({ messageId, data }, { rejectWithValue }) => {
    try {
      const res = await ApiService.patch(ENDPOINTS.TOPICS_MESSAGE_UPDATE(messageId), data);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to update message');
    }
  }
);

export const deleteTopicMessage = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>(
  'channels/deleteTopicMessage',
  async (messageId, { rejectWithValue }) => {
    try {
      await ApiService.delete(ENDPOINTS.TOPICS_MESSAGE_DELETE(messageId));
      return messageId;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to delete message');
    }
  }
);

// Reaction Thunks
// Reaction Thunks
export const addReaction = createAsyncThunk<
  void,
  { messageId: string; emoji: string; currentUserId?: string },
  { rejectValue: string }
>(
  'channels/addReaction',
  async ({ messageId, emoji }, { rejectWithValue }) => {
    try {
      await ApiService.post(
        ENDPOINTS.TOPICS_MESSAGE_REACTION_ADD(messageId),
        { emoji }
      );
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to add reaction');
    }
  }
);

export const removeReaction = createAsyncThunk<
  void,
  { messageId: string; emoji: string; currentUserId?: string },
  { rejectValue: string }
>(
  'channels/removeReaction',
  async ({ messageId, emoji }, { rejectWithValue }) => {
    try {
      await ApiService.delete(
        ENDPOINTS.TOPICS_MESSAGE_REACTION_REMOVE(messageId, emoji)
      );
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to remove reaction');
    }
  }
);
