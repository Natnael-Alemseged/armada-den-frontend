import { createAsyncThunk } from "@reduxjs/toolkit";
import { ApiService } from "@/lib/util/apiService";
import { ENDPOINTS, BASE_URL } from "@/lib/constants/endpoints";
import {
    GmailConnectionResponse,
    GmailStatusResponse,
    ReadEmailsResponse,
    SendEmailRequest,
    SendEmailResponse,
    EmailDraftRequest,
    CallbackResponse,
    ToolsResponse,
} from "@/lib/types";

// Connect Gmail
export const connectGmail = createAsyncThunk<
    GmailConnectionResponse,
    { redirectUrl: string },
    { rejectValue: string }
>("gmail/connect", async (payload, { rejectWithValue }) => {
    try {
        const res = await ApiService.post(
            ENDPOINTS.GMAIL_CONNECT,
            { redirect_url: payload.redirectUrl },
            undefined,
            true
        );
        
        return res.data;
    } catch (err: any) {
        return rejectWithValue(err.response?.data?.detail || "Failed to connect Gmail");
    }
});

// Get Gmail Status
export const getGmailStatus = createAsyncThunk<
    GmailStatusResponse,
    void,
    { rejectValue: string }
>("gmail/status", async (_, { rejectWithValue, getState }) => {
    try {
        console.log("Calling gmail/status endpoint...");

        // Access token from Redux store
        const state = getState() as any;
        const token = state.auth.token;
        console.log("Token from Redux store:", token ? "***" + token.slice(-10) : "null");

        if (!token) {
            throw new Error("No authentication token available");
        }

        // Use fetch instead of ApiService
        const url = `${BASE_URL}${ENDPOINTS.GMAIL_STATUS}`;
        console.log("Fetch URL:", url);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("gmail/status response:", data);
        return data;
    } catch (err: any) {
        console.error("gmail/status error:", err);
        return rejectWithValue(err.message || "Failed to get Gmail status");
    }
});

// Fetch Emails
export const fetchEmails = createAsyncThunk<
    ReadEmailsResponse,
    { maxResults?: number; query?: string },
    { rejectValue: string }
>("gmail/fetchEmails", async (payload, { rejectWithValue }) => {
    try {
        const res = await ApiService.post(
            ENDPOINTS.GMAIL_READ,
            {
                max_results: payload.maxResults || 10,
                query: payload.query || "",
            },
            undefined,
            true
        );
        return res.data;
    } catch (err: any) {
        return rejectWithValue(err.response?.data?.detail || "Failed to fetch emails");
    }
});

// Send Email
export const sendEmail = createAsyncThunk<
    SendEmailResponse,
    SendEmailRequest,
    { rejectValue: string }
>("gmail/sendEmail", async (payload, { rejectWithValue }) => {
    try {
        const res = await ApiService.post(ENDPOINTS.GMAIL_SEND, payload, undefined, true);
        return res.data;
    } catch (err: any) {
        return rejectWithValue(err.response?.data?.detail || "Failed to send email");
    }
});

// Create Draft
export const createDraft = createAsyncThunk<
    SendEmailResponse,
    EmailDraftRequest,
    { rejectValue: string }
>("gmail/createDraft", async (payload, { rejectWithValue }) => {
    try {
        const res = await ApiService.post(ENDPOINTS.GMAIL_DRAFT, payload, undefined, true);
        return res.data;
    } catch (err: any) {
        return rejectWithValue(err.response?.data?.detail || "Failed to create draft");
    }
});

// Handle Gmail OAuth Callback
export const handleGmailCallback = createAsyncThunk<
    CallbackResponse,
    { code: string; state?: string },
    { rejectValue: string }
>("gmail/handleCallback", async (payload, { rejectWithValue }) => {
    try {
        const url = `${BASE_URL}${ENDPOINTS.GMAIL_CALLBACK}?code=${payload.code}${payload.state ? `&state=${payload.state}` : ''}`;
        
        const response = await fetch(url, {
            method: 'GET',
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (err: any) {
        return rejectWithValue(err.message || "Failed to handle Gmail callback");
    }
});

// Get Gmail Tools
export const getGmailTools = createAsyncThunk<
    ToolsResponse,
    void,
    { rejectValue: string }
>("gmail/getTools", async (_, { rejectWithValue }) => {
    try {
        const res = await ApiService.get(ENDPOINTS.GMAIL_TOOLS, undefined, true);
        return res.data;
    } catch (err: any) {
        return rejectWithValue(err.response?.data?.detail || "Failed to get Gmail tools");
    }
});