import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { fetchEmails, sendEmail, createDraft, connectGmail, getGmailStatus } from "./gmailThunk";
import { Email } from "@/lib/types";

export interface GmailState {
    emails: Email[];
    loading: boolean;
    error: string | null;
    connected: boolean;
    entityId: string | null;
    connectionUrl: string | null;
}

const initialState: GmailState = {
    emails: [],
    loading: false,
    error: null,
    connected: false,
    entityId: null,
    connectionUrl: null,
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
    },
});

export const { clearError, clearEmails, setConnected } = gmailSlice.actions;
export default gmailSlice.reducer;