import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
    fetchEmails,
    sendEmail,
    createDraft,
    connectGmail,
    getGmailStatus,
    handleGmailCallback,
    getGmailTools
} from "./gmailThunk";
import { Email, Tool } from "@/lib/types";

export interface GmailState {
    emails: Email[];
    loading: boolean;
    error: string | null;
    connected: boolean;
    entityId: string | null;
    connectionUrl: string | null;
    tools: Tool[];
    callbackStatus: 'idle' | 'loading' | 'success' | 'error';
}

const initialState: GmailState = {
    emails: [],
    loading: false,
    error: null,
    connected: false,
    entityId: null,
    connectionUrl: null,
    tools: [],
    callbackStatus: 'idle',
};

const gmailSlice = createSlice({
    name: "gmail",
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearEmails: (state) => {
            state.emails = [];
        },
        setConnected: (state, action: PayloadAction<boolean>) => {
            state.connected = action.payload;
        },
    },
    extraReducers: (builder) => {
        // Connect Gmail
        builder.addCase(connectGmail.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(connectGmail.fulfilled, (state, action) => {
            state.loading = false;
            state.connectionUrl = action.payload.connection_url;
            state.entityId = action.payload.entity_id;
        });
        builder.addCase(connectGmail.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || "Failed to connect Gmail";
        });

        // Get Gmail Status
        builder.addCase(getGmailStatus.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(getGmailStatus.fulfilled, (state, action) => {
            state.loading = false;
            state.connected = action.payload.connected;
            state.entityId = action.payload.entity_id;
        });
        builder.addCase(getGmailStatus.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || "Failed to get Gmail status";
        });

        // Fetch Emails
        builder.addCase(fetchEmails.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchEmails.fulfilled, (state, action) => {
            state.loading = false;
            state.emails = action.payload.emails;
        });
        builder.addCase(fetchEmails.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || "Failed to fetch emails";
        });

        // Send Email
        builder.addCase(sendEmail.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(sendEmail.fulfilled, (state) => {
            state.loading = false;
        });
        builder.addCase(sendEmail.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || "Failed to send email";
        });

        // Create Draft
        builder.addCase(createDraft.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(createDraft.fulfilled, (state) => {
            state.loading = false;
        });
        builder.addCase(createDraft.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || "Failed to create draft";
        });

        // Handle Gmail Callback
        builder.addCase(handleGmailCallback.pending, (state) => {
            state.callbackStatus = 'loading';
            state.error = null;
        });
        builder.addCase(handleGmailCallback.fulfilled, (state) => {
            state.callbackStatus = 'success';
            state.connected = true;
        });
        builder.addCase(handleGmailCallback.rejected, (state, action) => {
            state.callbackStatus = 'error';
            state.error = action.payload || "Failed to handle Gmail callback";
        });

        // Get Gmail Tools
        builder.addCase(getGmailTools.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(getGmailTools.fulfilled, (state, action) => {
            state.loading = false;
            state.tools = action.payload.tools;
        });
        builder.addCase(getGmailTools.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || "Failed to get Gmail tools";
        });
    },
});

export const { clearError, clearEmails, setConnected } = gmailSlice.actions;
export default gmailSlice.reducer;