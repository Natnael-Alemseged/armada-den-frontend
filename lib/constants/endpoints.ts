/**
 * API-related constants and endpoints.
 * This file centralizes all API configuration for easier management.
 */

// Base URL for the API
export const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8002/api";

// Define endpoints for your application
export const ENDPOINTS = {
    // Authentication
    AUTH_REGISTER: '/auth/register',
    AUTH_LOGIN: '/auth/jwt/login',
    AUTH_LOGOUT: '/auth/jwt/logout',
    AUTH_ME: '/users/me',
    
    // Users
    USERS_LIST: '/users/users',

    // Gmail
    GMAIL_CONNECT: '/gmail/connect',
    GMAIL_CALLBACK: '/gmail/callback',
    GMAIL_STATUS: '/gmail/status',
    GMAIL_READ: '/gmail/read',
    GMAIL_SEND: '/gmail/send',
    GMAIL_DRAFT: '/gmail/draft',
    GMAIL_TOOLS: '/gmail/tools',

    // Search
    SEARCH_CONNECT: '/search/connect',
    SEARCH_CALLBACK: '/search/callback',
    SEARCH_STATUS: '/search/status',
    SEARCH_QUERY: '/search/query',
    SEARCH_HISTORY: '/search/history',
    SEARCH_DETAILS: (searchId: string) => `/search/history/${searchId}`,
    SEARCH_TOOLS: '/search/tools',

    // AI Chat & Conversations
    AI_CHAT: '/ai',
    CONVERSATIONS_LIST: '/conversations',
    CONVERSATIONS_CREATE: '/conversations',
    CONVERSATIONS_GET: (conversationId: string) => `/conversations/${conversationId}`,
    CONVERSATIONS_UPDATE: (conversationId: string) => `/conversations/${conversationId}`,
    CONVERSATIONS_DELETE: (conversationId: string) => `/conversations/${conversationId}`,
    CONVERSATIONS_MESSAGES: (conversationId: string) => `/conversations/${conversationId}/messages`,
    CONVERSATIONS_MESSAGE_CREATE: (conversationId: string) => `/conversations/${conversationId}/messages`,
    CONVERSATIONS_MESSAGE_UPDATE: (conversationId: string, messageId: string) => `/conversations/${conversationId}/messages/${messageId}`,
    CONVERSATIONS_GENERATE_TITLE: (conversationId: string) => `/conversations/${conversationId}/generate-title`,

    // Real-Time Chat
    CHAT_ROOMS: '/chat/rooms',
    CHAT_ROOM_CREATE: '/chat/rooms',
    CHAT_ROOM_GET: (roomId: string) => `/chat/rooms/${roomId}`,
    CHAT_ROOM_UPDATE: (roomId: string) => `/chat/rooms/${roomId}`,
    CHAT_ROOM_ADD_MEMBER: (roomId: string, userId: string) => `/chat/rooms/${roomId}/members/${userId}`,
    CHAT_ROOM_REMOVE_MEMBER: (roomId: string, userId: string) => `/chat/rooms/${roomId}/members/${userId}`,
    CHAT_MESSAGES: '/chat/messages',
    CHAT_MESSAGE_CREATE: '/chat/messages',
    CHAT_MESSAGE_UPDATE: (messageId: string) => `/chat/messages/${messageId}`,
    CHAT_MESSAGE_DELETE: (messageId: string) => `/chat/messages/${messageId}`,
    CHAT_ROOM_MESSAGES: (roomId: string) => `/chat/rooms/${roomId}/messages`,
    CHAT_MARK_READ: (roomId: string) => `/chat/rooms/${roomId}/read`,
    CHAT_UPLOAD: '/chat/upload',
    CHAT_SIGNED_URL: '/chat/upload/signed-url',

    // Channels & Topics
    CHANNELS_LIST: '/channels',
    CHANNELS_CREATE: '/channels',
    CHANNELS_GET: (channelId: string) => `/channels/${channelId}`,
    CHANNELS_UPDATE: (channelId: string) => `/channels/${channelId}`,
    CHANNELS_DELETE: (channelId: string) => `/channels/${channelId}`,
    CHANNELS_TOPICS: (channelId: string) => `/channels/${channelId}/topics`,
    
    TOPICS_LIST: '/channels/topics',
    TOPICS_MY: '/channels/topics/my',
    TOPICS_CREATE: '/channels/topics',
    TOPICS_GET: (topicId: string) => `/channels/topics/${topicId}`,
    TOPICS_UPDATE: (topicId: string) => `/channels/topics/${topicId}`,
    TOPICS_DELETE: (topicId: string) => `/channels/topics/${topicId}`,
    TOPICS_PIN: (topicId: string) => `/channels/topics/${topicId}/pin`,
    TOPICS_UNPIN: (topicId: string) => `/channels/topics/${topicId}/unpin`,
    
    TOPICS_MEMBERS: (topicId: string) => `/channels/topics/${topicId}/members`,
    TOPICS_MEMBER_ADD: (topicId: string) => `/channels/topics/${topicId}/members`,
    TOPICS_MEMBER_REMOVE: (topicId: string, userId: string) => `/channels/topics/${topicId}/members/${userId}`,
    
    TOPICS_MESSAGES: (topicId: string) => `/channels/topics/${topicId}/messages`,
    TOPICS_MESSAGE_CREATE: '/channels/topics/messages',
    TOPICS_MESSAGE_GET: (messageId: string) => `/channels/topics/messages/${messageId}`,
    TOPICS_MESSAGE_UPDATE: (messageId: string) => `/channels/topics/messages/${messageId}`,
    TOPICS_MESSAGE_DELETE: (messageId: string) => `/channels/topics/messages/${messageId}`,
    
    TOPICS_MESSAGE_REACTION_ADD: (messageId: string) => `/channels/topics/messages/${messageId}/reactions`,
    TOPICS_MESSAGE_REACTION_REMOVE: (messageId: string, emoji: string) => `/channels/topics/messages/${messageId}/reactions/${encodeURIComponent(emoji)}`,
};