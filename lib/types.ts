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