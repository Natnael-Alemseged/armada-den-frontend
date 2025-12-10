import { createAsyncThunk } from "@reduxjs/toolkit";
import { ApiService } from "@/lib/util/apiService";
import { ENDPOINTS } from "@/lib/constants/endpoints";
import { User } from "@/lib/types";
import { AxiosError } from "axios";

// Helper to extract error message
const getErrorMessage = (err: unknown, defaultMessage: string): string => {
    if (err instanceof AxiosError) {
        return err.response?.data?.detail || defaultMessage;
    }
    if (err instanceof Error) {
        return err.message;
    }
    return defaultMessage;
};

// Fetch Pending Users
export const fetchPendingUsers = createAsyncThunk<
    User[],
    void,
    { rejectValue: string }
>("admin/fetchPendingUsers", async (_, { rejectWithValue }) => {
    try {
        const res = await ApiService.get(ENDPOINTS.ADMIN_PENDING_USERS);
        const data = res.data as { users: User[] };
        return data.users || []; 
    } catch (err: unknown) {
        return rejectWithValue(getErrorMessage(err, "Failed to fetch pending users"));
    }
});

// Approve User
export const approveUser = createAsyncThunk<
    string, // userId
    string, // userId
    { rejectValue: string }
>("admin/approveUser", async (userId, { rejectWithValue }) => {
    try {
        await ApiService.post(ENDPOINTS.ADMIN_APPROVE_USER(userId));
        return userId;
    } catch (err: unknown) {
        return rejectWithValue(getErrorMessage(err, "Failed to approve user"));
    }
});

// Reject User
export const rejectUser = createAsyncThunk<
    string, // userId
    string, // userId
    { rejectValue: string }
>("admin/rejectUser", async (userId, { rejectWithValue }) => {
    try {
        await ApiService.post(ENDPOINTS.ADMIN_REJECT_USER(userId));
        return userId;
    } catch (err: unknown) {
        return rejectWithValue(getErrorMessage(err, "Failed to reject user"));
    }
});
