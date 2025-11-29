// Auth Types
export interface RegisterRequest {
    email: string;
    password: string;
    is_active?: boolean;
    is_superuser?: boolean;
    is_verified?: boolean;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface AuthResponse {
    access_token: string;
    token_type: string;
}

export interface User {
    id: string;
    email: string;
    is_active: boolean;
    is_superuser: boolean;
    is_verified: boolean;
    full_name?: string;
}

export interface UserWithChatInfo extends User {
    last_message?: {
        content: string;
        created_at: string;
        sender_id: string;
        message_type: string;
    } | null;
    unread_count: number;
    room_id: string | null;
}

export interface UsersListResponse {
    users: UserWithChatInfo[];
    total: number;
    page: number;
    page_size: number;
    has_more: boolean;
}

export interface UserForTopicAddition {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string | null;
    is_member: boolean;
}

// Gmail Types
export interface EmailRecipient {
    email: string;
    name?: string;
}

export interface SendEmailRequest {
    recipient_email: string;
    subject: string;
    body: string;
    cc?: string[];
    bcc?: string[];
    extra_recipients?: string[];
}

export interface EmailDraftRequest {
    to: EmailRecipient[];
    subject: string;
    body: string;
    cc?: EmailRecipient[];
    bcc?: EmailRecipient[];
}

export interface ReadEmailsRequest {
    max_results?: number;
    query?: string;
}

export interface EmailHeader {
    name: string;
    value: string;
}

export interface EmailBody {
    size: number;
    data?: string;
    attachmentId?: string;
}

export interface EmailPart {
    partId: string;
    mimeType: string;
    filename: string;
    headers: EmailHeader[];
    body: EmailBody;
    parts?: EmailPart[];
}

export interface EmailAttachment {
    filename: string;
    mimeType: string;
}

export interface EmailPreview {
    body: string;
    subject: string;
}

export interface Email {
    attachmentList: EmailAttachment[];
    labelIds: string[];
    messageId: string;
    messageText: string;
    messageTimestamp: string;
    payload: {
        body: EmailBody;
        filename: string;
        headers: EmailHeader[];
        mimeType: string;
        partId: string;
        parts?: EmailPart[];
    };
    preview: EmailPreview;
    sender: string;
    subject: string;
    threadId: string;
    to: string;
}

export interface GmailConnectionRequest {
    redirect_url?: string;
}

export interface GmailConnectionResponse {
    connection_url: string;
    entity_id: string;
    status: string;
}

export interface GmailStatusResponse {
    connected: boolean;
    entity_id: string;
    accounts: Array<{
        appName: string;
        connectionStatus: string;
    }>;
}

export interface ReadEmailsResponse {
    status: string;
    emails: Email[];
    count: number;
}

export interface SendEmailResponse {
    status: string;
    message: string;
    result: {
        id: string;
    };
}

// Search Types
export interface WebSearchRequest {
    query: string;
    num_results?: number;
    engine?: 'SERPAPI';
    save_to_db?: boolean;
}

export interface SearchResult {
    title: string;
    link: string;
    snippet: string;
}

export interface WebSearchResponse {
    query: string;
    engine: string;
    results: SearchResult[];
    count: number;
    search_id?: string;
}

export interface SearchHistoryItem {
    id: string;
    query: string;
    engine: string;
    created_at: string;
    results_count: number;
}

export interface SearchHistoryResponse {
    searches: SearchHistoryItem[];
    total: number;
    page: number;
    page_size: number;
}

export interface SearchConnectionRequest {
    redirect_url?: string;
}

export interface SearchConnectionResponse {
    connection_url: string;
    entity_id: string;
    status: string;
}

export interface SearchStatusResponse {
    connected: boolean;
    entity_id: string;
    accounts: Array<{
        appName: string;
        connectionStatus: string;
    }>;
}

// Callback Types
export interface CallbackResponse {
    status: string;
    message: string;
    user_id: string;
}

// Tools Types
export interface Tool {
    name: string;
    description: string;
}

export interface ToolsResponse {
    status: string;
    tools: Tool[];
    count: number;
}

// Search Details Types
export interface SearchDetailsResponse {
    id: string;
    query: string;
    engine: string;
    created_at: string;
    raw_results: Record<string, unknown>;
    summary: string | null;
}

// API Error
export interface APIError {
    detail: string;
}

// Chat/Conversation Types
export type MessageRole = 'USER' | 'ASSISTANT' | 'SYSTEM' | 'TOOL';
export type ContentType = 'TEXT' | 'MARKDOWN' | 'CODE';

export interface Message {
    id: string;
    conversation_id: string;
    role: MessageRole;
    content: string;
    content_type: ContentType;
    tool_name?: string | null;
    tool_input?: Record<string, unknown> | null;
    tool_output?: Record<string, unknown> | null;
    meta_data?: Record<string, unknown>;
    is_deleted: boolean;
    created_at: string;
    updated_at: string;
}

export interface Conversation {
    id: string;
    user_id: string;
    title: string;
    created_at: string;
    updated_at: string | null;
    deleted_at: string | null;
    message_count: number;
    messages?: Message[];
}

export interface ChatRequest {
    message: string;
    conversation_id?: string;
    agent_type?: string;
}

export interface ChatResponse {
    conversation_id: string;
    message_id: string;
    role: MessageRole;
    content: string;
    content_type: ContentType;
    tool_calls_executed: unknown[];
    created_at: string;
}

export interface ConversationsListResponse {
    conversations: Conversation[];
    total: number;
    page: number;
    page_size: number;
    has_more: boolean;
}

export interface CreateConversationRequest {
    title?: string;
}

export interface UpdateConversationRequest {
    title: string;
}

export interface CreateMessageRequest {
    role: MessageRole;
    content: string;
    content_type?: ContentType;
    tool_name?: string | null;
    tool_input?: Record<string, unknown> | null;
    tool_output?: Record<string, unknown> | null;
    meta_data?: Record<string, unknown>;
}

export interface UpdateMessageRequest {
    content?: string;
    is_deleted?: boolean;
}

// Legacy chat type for backward compatibility
export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

// Real-Time Chat Types
export type RoomType = 'direct' | 'group';
export type ChatMessageType = 'text' | 'image' | 'video' | 'audio' | 'file';

export interface ChatRoom {
    id: string;
    name: string | null;
    room_type: RoomType;
    description: string | null;
    avatar_url: string | null;
    created_by: string;
    created_at: string;
    updated_at: string;
    is_active: boolean;
    members?: ChatRoomMember[];
    last_message?: ChatRoomMessage;
    unread_count?: number;
}

export interface ChatRoomMember {
    id: string;
    room_id: string;
    user_id: string;
    joined_at: string;
    last_read_at: string | null;
    is_admin: boolean;
    is_active: boolean;
    user?: User;
}

export type MessageStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface ChatRoomMessage {
    id: string;
    room_id: string;
    sender_id: string;
    message_type: ChatMessageType;
    content: string;
    media_url: string | null;
    media_filename: string | null;
    media_size: number | null;
    media_mime_type: string | null;
    reply_to_id: string | null;
    forwarded_from_id: string | null;
    is_edited: boolean;
    edited_at: string | null;
    is_deleted: boolean;
    deleted_at: string | null;
    created_at: string;
    sender?: User;
    reply_to?: ChatRoomMessage;
    read_by?: string[];
    status?: MessageStatus; // Client-side only field for tracking message delivery status
}

export interface MessageReadReceipt {
    id: string;
    message_id: string;
    user_id: string;
    read_at: string;
}

// Chat API Request/Response Types
export interface CreateChatRoomRequest {
    name?: string;
    room_type: RoomType;
    description?: string;
    avatar_url?: string;
    member_ids: string[];
}

export interface UpdateChatRoomRequest {
    name?: string;
    description?: string;
    avatar_url?: string;
}

export interface CreateChatMessageRequest {
    room_id: string;
    message_type: ChatMessageType;
    content: string;
    media_url?: string;
    media_filename?: string;
    media_size?: number;
    media_mime_type?: string;
    reply_to_id?: string;
    forwarded_from_id?: string;
}

export interface UpdateChatMessageRequest {
    content: string;
}

export interface MarkMessagesReadRequest {
    room_id: string;
    message_ids: string[];
}

export interface ChatRoomsResponse {
    rooms: ChatRoom[];
    total: number;
    page: number;
    page_size: number;
    has_more: boolean;
}

export interface ChatMessagesResponse {
    messages: ChatRoomMessage[];
    total: number;
    page: number;
    page_size: number;
    has_more: boolean;
}

export interface MediaUploadResponse {
    url: string;
    filename: string;
    size: number;
    mime_type: string;
}

// Socket.IO Event Types
export interface SocketAuthData {
    token: string;
}

export interface SocketJoinRoomData {
    room_id: string;
}

export interface SocketLeaveRoomData {
    room_id: string;
}

export interface SocketSendMessageData {
    room_id: string;
    message_id: string;
}

export interface SocketTypingData {
    room_id: string;
    is_typing: boolean;
}

export interface SocketMarkReadData {
    room_id: string;
    message_ids: string[];
}

export interface SocketConnectedEvent {
    user_id: string;
    message: string;
}

export interface SocketRoomJoinedEvent {
    room_id: string;
    user_id: string;
}

export interface SocketRoomLeftEvent {
    room_id: string;
    user_id: string;
}

export interface SocketUserJoinedEvent {
    room_id: string;
    user_id: string;
    user: User;
}

export interface SocketUserLeftEvent {
    room_id: string;
    user_id: string;
}

export interface SocketNewMessageEvent {
    room_id: string;
    message: ChatRoomMessage;
}

export interface SocketMessageEditedEvent {
    room_id: string;
    message_id: string;
    content: string;
    edited_at: string;
}

export interface SocketMessageDeletedEvent {
    room_id: string;
    message_id: string;
    deleted_at: string;
}

export interface SocketMessagesReadEvent {
    room_id: string;
    user_id: string;
    message_ids: string[];
}

export interface SocketUserTypingEvent {
    room_id: string;
    user_id: string;
    is_typing: boolean;
}

export interface SocketRoomCreatedEvent {
    room: ChatRoom;
}

export interface SocketRoomUpdatedEvent {
    room: ChatRoom;
}

export interface SocketMemberAddedEvent {
    room_id: string;
    member: ChatRoomMember;
}

export interface SocketMemberRemovedEvent {
    room_id: string;
    user_id: string;
}

export interface SocketErrorEvent {
    message: string;
    code?: string;
}

// Channels & Topics Types
export type UserRole = 'ADMIN' | 'USER';

export interface Channel {
    id: string;
    name: string;
    description: string | null;
    icon: string | null;
    color: string | null;
    created_by: string;
    created_at: string;
    updated_at: string;
}

export interface Topic {
    id: string;
    channel_id: string;
    name: string;
    description: string | null;
    is_pinned: boolean;
    created_by: string;
    created_at: string;
    updated_at: string;
    channel?: Channel;
    unread_count?: number;
    last_message?: TopicMessage;
}

export interface TopicMember {
    id: string;
    topic_id: string;
    user_id: string;
    joined_at: string;
    last_read_at: string | null;
    is_active: boolean;
    user?: User;
}

export interface Attachment {
    id: string;
    url: string;
    filename: string;
    size: number;
    mime_type: string;
}

export interface TopicMessage {
    id: string;
    topic_id: string;
    sender_id: string;
    content: string;
    reply_to_id: string | null;
    is_edited: boolean;
    edited_at: string | null;
    is_deleted: boolean;
    deleted_at: string | null;
    created_at: string;
    // Backend provides these fields directly
    sender_email: string;
    sender_full_name: string | null;
    mention_count: number;
    reaction_count: number;
    attachments: Attachment[]; // Multiple file attachments
    // Optional nested objects
    sender?: User;
    reply_to?: TopicMessage;
    mentions?: MessageMention[];
    reactions?: MessageReaction[] | GroupedReaction[]; // Support both formats
}

export interface MessageMention {
    id: string;
    message_id: string;
    mentioned_user_id: string;
    is_read: boolean;
    created_at: string;
    mentioned_user?: User;
}

export interface MessageReaction {
    id: string;
    message_id: string;
    user_id: string;
    emoji: string;
    created_at: string;
    user?: User;
}

// Grouped reaction format from backend
export interface GroupedReaction {
    emoji: string;
    count: number;
    users: string[]; // Array of user IDs
    user_reacted: boolean; // Whether current user has reacted
}

// Channel API Request/Response Types
export interface CreateChannelRequest {
    name: string;
    description?: string;
    icon?: string;
    color?: string;
}

export interface UpdateChannelRequest {
    name?: string;
    description?: string;
    icon?: string;
    color?: string;
}

export interface ChannelsResponse {
    channels: Channel[];
    total: number;
}

// Topic API Request/Response Types
export interface CreateTopicRequest {
    channel_id: string;
    name: string;
    description?: string;
    member_ids?: string[];
}

export interface UpdateTopicRequest {
    name?: string;
    description?: string;
    is_pinned?: boolean;
}

export interface TopicsResponse {
    topics: Topic[];
    total: number;
}

// Topic Message API Request/Response Types
export interface CreateTopicMessageRequest {
    topic_id: string;
    content: string;
    reply_to_id?: string;
    mentioned_user_ids?: string[];
    attachments?: Attachment[]; // Multiple file attachments
}

export interface UpdateTopicMessageRequest {
    content: string;
}

export interface TopicMessagesResponse {
    messages: TopicMessage[];
    total: number;
    page: number;
    page_size: number;
    has_more: boolean;
}

// Reaction API Request/Response Types
export interface AddReactionRequest {
    emoji: string;
}

// Socket.IO Events for Channels/Topics
export interface SocketJoinTopicData {
    topic_id: string;
}

export interface SocketLeaveTopicData {
    topic_id: string;
}

export interface SocketTopicTypingData {
    topic_id: string;
    is_typing: boolean;
}

export interface SocketTopicCreatedEvent {
    topic_id: string;
    channel_id: string;
    name: string;
    created_by: string;
}

export interface SocketTopicUpdatedEvent {
    topic_id: string;
    updated_by: string;
}

export interface SocketMemberAddedToTopicEvent {
    topic_id: string;
    user_id: string;
    added_by: string;
}

export interface SocketMemberRemovedFromTopicEvent {
    topic_id: string;
    user_id: string;
    removed_by: string;
}

export interface SocketNewTopicMessageEvent {
    topic_id: string;
    message: TopicMessage;
}

export interface SocketTopicMessageEditedEvent {
    topic_id: string;
    message_id: string;
    content: string;
    edited_by: string;
}

export interface SocketTopicMessageDeletedEvent {
    topic_id: string;
    message_id: string;
    deleted_by: string;
}

export interface SocketUserTypingTopicEvent {
    topic_id: string;
    user_id: string;
    is_typing: boolean;
}

export interface SocketMentionedEvent {
    topic_id: string;
    message_id: string;
    mentioned_by: string;
}

export interface SocketReactionAddedEvent {
    topic_id: string;
    message_id: string;
    user_id: string;
    emoji: string;
}

export interface SocketReactionRemovedEvent {
    topic_id: string;
    message_id: string;
    user_id: string;
    emoji: string;
}

// New Socket Events for Global Notifications & Online Status
export interface SocketUserStatusChangeEvent {
    user_id: string;
    is_online: boolean;
    last_seen_at: string;
}

export interface SocketGlobalMessageAlertEvent {
    room_id: string;
    topic_id: string | null;
    sender_id: string;
    message_preview: string;
}

// Push Notification Types
export interface PushSubscription {
    id: string;
    endpoint: string;
    created_at: string;
}

export interface PushSubscriptionRequest {
    endpoint: string;
    p256dh: string;
    auth: string;
}

export interface VapidPublicKeyResponse {
    public_key: string;
}

export interface UnreadCountsResponse {
    [topicId: string]: number;
}

// Extended User type with online status
export interface UserWithStatus extends User {
    is_online?: boolean;
    last_seen_at?: string;
}