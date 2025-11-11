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
};