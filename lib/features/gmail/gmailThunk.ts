import { createAsyncThunk } from "@reduxjs/toolkit";
import { ApiService } from "@/lib/util/apiService";
import { ENDPOINTS } from "@/lib/constants/endpoints";
import {
    GmailConnectionResponse,
    GmailStatusResponse,
    ReadEmailsResponse,
    SendEmailRequest,
    SendEmailResponse,
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
>("gmail/status", async (_, { rejectWithValue }) => {
    try {
        const res = await ApiService.get(ENDPOINTS.GMAIL_STATUS, undefined, true);
        return res.data;
    } catch (err: any) {
        return rejectWithValue(err.response?.data?.detail || "Failed to get Gmail status");
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
    SendEmailRequest,
    { rejectValue: string }
>("gmail/createDraft", async (payload, { rejectWithValue }) => {
    try {
        const res = await ApiService.post(ENDPOINTS.GMAIL_DRAFT, payload, undefined, true);
        return res.data;
    } catch (err: any) {
        return rejectWithValue(err.response?.data?.detail || "Failed to create draft");
    }
});