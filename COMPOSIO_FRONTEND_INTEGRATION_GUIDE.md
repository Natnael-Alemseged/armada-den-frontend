# Composio Frontend Integration Guide

## Overview
This guide provides comprehensive instructions for integrating the Armada Den backend (with Composio v0.9.1) into a frontend application. The backend provides Gmail and web search functionality through Composio's API.

---

## Table of Contents
1. [API Base URL](#api-base-url)
2. [Authentication](#authentication)
3. [Gmail Integration](#gmail-integration)
4. [Web Search Integration](#web-search-integration)
5. [Error Handling](#error-handling)
6. [TypeScript Types](#typescript-types)
7. [Example Implementation](#example-implementation)

---

## API Base URL

**Development:** `http://localhost:8000`
**Production:** Update with your production URL

All API endpoints are prefixed with `/api`

---

## Authentication

### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "is_active": true,
  "is_superuser": false,
  "is_verified": false
}
```

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "is_active": true,
  "is_superuser": false,
  "is_verified": false
}
```

### Login
```http
POST /api/auth/jwt/login
Content-Type: application/x-www-form-urlencoded

username=user@example.com&password=securePassword123
```

**Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer"
}
```

### Get Current User
```http
GET /api/users/me
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "is_active": true,
  "is_superuser": false,
  "is_verified": false
}
```

---

## Gmail Integration

### 1. Connect Gmail Account

**Endpoint:** `POST /api/gmail/connect`

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "redirect_url": "http://localhost:3000/gmail/callback"
}
```

**Response:**
```json
{
  "connection_url": "https://composio.dev/oauth/...",
  "entity_id": "user-uuid",
  "status": "pending"
}
```

**Frontend Implementation:**
```typescript
async function connectGmail() {
  const response = await fetch('http://localhost:8000/api/gmail/connect', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      redirect_url: window.location.origin + '/gmail/callback'
    })
  });
  
  const data = await response.json();
  
  // Redirect user to Composio OAuth page
  window.location.href = data.connection_url;
}
```

### 2. Handle OAuth Callback

**Endpoint:** `GET /api/gmail/callback?code={code}&state={state}`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "status": "success",
  "message": "Gmail connected successfully",
  "user_id": "uuid"
}
```

**Frontend Implementation:**
```typescript
// In your callback page component
useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  const state = urlParams.get('state');
  
  if (code) {
    fetch(`http://localhost:8000/api/gmail/callback?code=${code}&state=${state}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
    .then(res => res.json())
    .then(data => {
      console.log('Gmail connected:', data);
      // Redirect to main app
      window.location.href = '/dashboard';
    });
  }
}, []);
```

### 3. Check Gmail Connection Status

**Endpoint:** `GET /api/gmail/status`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "connected": true,
  "entity_id": "user-uuid",
  "accounts": [
    {
      "appName": "gmail",
      "connectionStatus": "active"
    }
  ]
}
```

### 4. Read Emails

**Endpoint:** `POST /api/gmail/read`

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "max_results": 10,
  "query": "is:unread"
}
```

**Query Options:**
- `"is:unread"` - Unread emails
- `"from:example@gmail.com"` - From specific sender
- `"subject:meeting"` - Emails with specific subject
- `""` - All emails

**Response:**
```json
{
  "status": "success",
  "emails": [
    {
      "id": "message-id",
      "threadId": "thread-id",
      "snippet": "Email preview text..."
    }
  ],
  "count": 10
}
```

### 5. Send Email

**Endpoint:** `POST /api/gmail/send`

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "to": [
    {
      "email": "recipient@example.com",
      "name": "Recipient Name"
    }
  ],
  "subject": "Email Subject",
  "body": "Email body content",
  "cc": [
    {
      "email": "cc@example.com",
      "name": "CC Name"
    }
  ],
  "bcc": []
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Email sent successfully",
  "result": {
    "id": "sent-message-id"
  }
}
```

### 6. Create Draft

**Endpoint:** `POST /api/gmail/draft`

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "to": [
    {
      "email": "recipient@example.com",
      "name": "Recipient Name"
    }
  ],
  "subject": "Draft Subject",
  "body": "Draft body content",
  "cc": [],
  "bcc": []
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Draft created successfully",
  "draft_id": "draft-id",
  "result": {
    "id": "draft-id"
  }
}
```

### 7. Get Available Gmail Tools

**Endpoint:** `GET /api/gmail/tools`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "status": "success",
  "tools": [
    {
      "name": "GMAIL_SEND_EMAIL",
      "description": "Send an email via Gmail"
    }
  ],
  "count": 15
}
```

---

## Web Search Integration

### 1. Connect Search Engine

**Endpoint:** `POST /api/search/connect`

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "redirect_url": "http://localhost:3000/search/callback"
}
```

**Response:**
```json
{
  "connection_url": "https://composio.dev/oauth/...",
  "entity_id": "user-uuid",
  "status": "pending"
}
```

### 2. Handle Search OAuth Callback

**Endpoint:** `GET /api/search/callback?code={code}&state={state}`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "status": "success",
  "message": "Search engine connected successfully",
  "user_id": "uuid"
}
```

### 3. Check Search Connection Status

**Endpoint:** `GET /api/search/status`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "connected": true,
  "entity_id": "user-uuid",
  "accounts": [
    {
      "appName": "serpapi",
      "connectionStatus": "active"
    }
  ]
}
```

### 4. Perform Web Search

**Endpoint:** `POST /api/search/query`

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "query": "Python FastAPI tutorial",
  "num_results": 10,
  "engine": "SERPAPI",
  "save_to_db": true
}
```

**Response:**
```json
{
  "query": "Python FastAPI tutorial",
  "engine": "SERPAPI",
  "results": [
    {
      "title": "FastAPI Tutorial",
      "link": "https://example.com",
      "snippet": "Learn FastAPI..."
    }
  ],
  "count": 10,
  "search_id": "search-uuid"
}
```

### 5. Get Search History

**Endpoint:** `GET /api/search/history?page=1&page_size=20`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "searches": [
    {
      "id": "search-uuid",
      "query": "Python FastAPI tutorial",
      "engine": "SERPAPI",
      "created_at": "2025-11-07T13:00:00Z",
      "results_count": 10
    }
  ],
  "total": 50,
  "page": 1,
  "page_size": 20
}
```

### 6. Get Search Details

**Endpoint:** `GET /api/search/history/{search_id}`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "id": "search-uuid",
  "query": "Python FastAPI tutorial",
  "engine": "SERPAPI",
  "created_at": "2025-11-07T13:00:00Z",
  "raw_results": {
    "organic_results": [...]
  },
  "summary": null
}
```

### 7. Get Available Search Tools

**Endpoint:** `GET /api/search/tools`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "status": "success",
  "tools": [
    {
      "name": "SERPAPI_SEARCH",
      "description": "Perform web search"
    }
  ],
  "count": 5
}
```

---

## Error Handling

All endpoints return standard HTTP status codes:

- **200**: Success
- **400**: Bad Request (invalid input)
- **401**: Unauthorized (missing or invalid token)
- **404**: Not Found
- **500**: Internal Server Error

**Error Response Format:**
```json
{
  "detail": "Error message describing what went wrong"
}
```

**Frontend Error Handling Example:**
```typescript
async function apiCall(url: string, options: RequestInit) {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'An error occurred');
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    // Show error to user
    toast.error(error.message);
    throw error;
  }
}
```

---

## TypeScript Types

```typescript
// Auth Types
interface RegisterRequest {
  email: string;
  password: string;
  is_active?: boolean;
  is_superuser?: boolean;
  is_verified?: boolean;
}

interface LoginRequest {
  username: string;
  password: string;
}

interface AuthResponse {
  access_token: string;
  token_type: string;
}

interface User {
  id: string;
  email: string;
  is_active: boolean;
  is_superuser: boolean;
  is_verified: boolean;
}

// Gmail Types
interface EmailRecipient {
  email: string;
  name?: string;
}

interface SendEmailRequest {
  to: EmailRecipient[];
  subject: string;
  body: string;
  cc?: EmailRecipient[];
  bcc?: EmailRecipient[];
}

interface ReadEmailsRequest {
  max_results?: number;
  query?: string;
}

interface GmailConnectionRequest {
  redirect_url?: string;
}

interface GmailConnectionResponse {
  connection_url: string;
  entity_id: string;
  status: string;
}

interface GmailStatusResponse {
  connected: boolean;
  entity_id: string;
  accounts: Array<{
    appName: string;
    connectionStatus: string;
  }>;
}

// Search Types
interface WebSearchRequest {
  query: string;
  num_results?: number;
  engine?: 'SERPAPI';
  save_to_db?: boolean;
}

interface WebSearchResponse {
  query: string;
  engine: string;
  results: Array<{
    title: string;
    link: string;
    snippet: string;
  }>;
  count: number;
  search_id?: string;
}

interface SearchHistoryResponse {
  searches: Array<{
    id: string;
    query: string;
    engine: string;
    created_at: string;
    results_count: number;
  }>;
  total: number;
  page: number;
  page_size: number;
}
```

---

## Example Implementation

### Complete React Component Example

```typescript
import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:8000/api';

function GmailIntegration() {
  const [accessToken, setAccessToken] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [emails, setEmails] = useState<any[]>([]);

  // Check connection status on mount
  useEffect(() => {
    if (accessToken) {
      checkGmailStatus();
    }
  }, [accessToken]);

  async function checkGmailStatus() {
    try {
      const response = await fetch(`${API_BASE_URL}/gmail/status`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      const data = await response.json();
      setIsConnected(data.connected);
    } catch (error) {
      console.error('Error checking Gmail status:', error);
    }
  }

  async function connectGmail() {
    try {
      const response = await fetch(`${API_BASE_URL}/gmail/connect`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          redirect_url: window.location.origin + '/gmail/callback'
        })
      });
      const data = await response.json();
      window.location.href = data.connection_url;
    } catch (error) {
      console.error('Error connecting Gmail:', error);
    }
  }

  async function readEmails() {
    try {
      const response = await fetch(`${API_BASE_URL}/gmail/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          max_results: 10,
          query: 'is:unread'
        })
      });
      const data = await response.json();
      setEmails(data.emails);
    } catch (error) {
      console.error('Error reading emails:', error);
    }
  }

  async function sendEmail(to: string, subject: string, body: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/gmail/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to: [{ email: to }],
          subject,
          body
        })
      });
      const data = await response.json();
      alert('Email sent successfully!');
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }

  return (
    <div>
      <h1>Gmail Integration</h1>
      
      {!isConnected ? (
        <button onClick={connectGmail}>Connect Gmail</button>
      ) : (
        <div>
          <p>Gmail Connected ✓</p>
          <button onClick={readEmails}>Read Emails</button>
          
          <div>
            <h2>Emails</h2>
            {emails.map((email, index) => (
              <div key={index}>
                <p>{email.snippet}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default GmailIntegration;
```

### API Service Class

```typescript
class ArmadaDenAPI {
  private baseURL: string;
  private accessToken: string | null = null;

  constructor(baseURL: string = 'http://localhost:8000/api') {
    this.baseURL = baseURL;
  }

  setAccessToken(token: string) {
    this.accessToken = token;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'API request failed');
    }

    return response.json();
  }

  // Auth methods
  async register(email: string, password: string) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, is_active: true }),
    });
  }

  async login(email: string, password: string) {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const response = await fetch(`${this.baseURL}/auth/jwt/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    const data = await response.json();
    this.setAccessToken(data.access_token);
    return data;
  }

  // Gmail methods
  async connectGmail(redirectUrl: string) {
    return this.request('/gmail/connect', {
      method: 'POST',
      body: JSON.stringify({ redirect_url: redirectUrl }),
    });
  }

  async getGmailStatus() {
    return this.request('/gmail/status');
  }

  async readEmails(maxResults: number = 10, query: string = '') {
    return this.request('/gmail/read', {
      method: 'POST',
      body: JSON.stringify({ max_results: maxResults, query }),
    });
  }

  async sendEmail(to: EmailRecipient[], subject: string, body: string) {
    return this.request('/gmail/send', {
      method: 'POST',
      body: JSON.stringify({ to, subject, body }),
    });
  }

  // Search methods
  async performSearch(query: string, numResults: number = 10) {
    return this.request('/search/query', {
      method: 'POST',
      body: JSON.stringify({
        query,
        num_results: numResults,
        engine: 'SERPAPI',
        save_to_db: true,
      }),
    });
  }

  async getSearchHistory(page: number = 1, pageSize: number = 20) {
    return this.request(`/search/history?page=${page}&page_size=${pageSize}`);
  }
}

// Usage
const api = new ArmadaDenAPI();

// Login
await api.login('user@example.com', 'password');

// Connect Gmail
const gmailConnection = await api.connectGmail(window.location.origin + '/callback');
window.location.href = gmailConnection.connection_url;

// Read emails
const emails = await api.readEmails(10, 'is:unread');

// Perform search
const searchResults = await api.performSearch('Python tutorial', 10);
```

---

## Important Notes

1. **CORS Configuration**: Ensure your backend allows requests from your frontend origin
2. **Token Storage**: Store access tokens securely (e.g., httpOnly cookies or secure localStorage)
3. **Token Refresh**: Implement token refresh logic for long-lived sessions
4. **Error Handling**: Always handle API errors gracefully and show user-friendly messages
5. **Loading States**: Show loading indicators during API calls
6. **Rate Limiting**: Be aware of potential rate limits on Composio API calls

---

## Testing Endpoints

You can test all endpoints using tools like:
- **Postman**: Import the endpoints and test manually
- **cURL**: Use command-line requests
- **Thunder Client** (VS Code extension): Test directly in VS Code

Example cURL command:
```bash
curl -X POST http://localhost:8000/api/gmail/read \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"max_results": 10, "query": "is:unread"}'
```

---

## Support

For issues or questions:
1. Check the backend logs for detailed error messages
2. Verify your access token is valid
3. Ensure Composio connections are active
4. Review the Composio documentation: https://docs.composio.dev

---

**Last Updated:** November 7, 2025
**Backend Version:** Composio v0.9.1
**API Version:** v1