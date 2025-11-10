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

// API Error
export interface APIError {
    detail: string;
}

// Chat Types
export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}