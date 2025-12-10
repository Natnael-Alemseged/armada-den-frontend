import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { fetchPendingUsers, approveUser, rejectUser } from "./adminThunk";
import { User } from "@/lib/types";

export interface AdminState {
    pendingUsers: User[];
    loading: boolean;
    error: string | null;
}

const initialState: AdminState = {
    pendingUsers: [],
    loading: false,
    error: null,
};

const adminSlice = createSlice({
    name: "admin",
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        removeUserFromList: (state, action: PayloadAction<string>) => {
            state.pendingUsers = state.pendingUsers.filter(u => u.id !== action.payload);
        }
    },
    extraReducers: (builder) => {
        // Fetch Pending Users
        builder.addCase(fetchPendingUsers.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchPendingUsers.fulfilled, (state, action) => {
            state.loading = false;
            state.pendingUsers = action.payload;
        });
        builder.addCase(fetchPendingUsers.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || "Failed to fetch pending users";
        });

        // Approve User
        builder.addCase(approveUser.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(approveUser.fulfilled, (state, action) => {
            state.loading = false;
            state.pendingUsers = state.pendingUsers.filter(u => u.id !== action.payload);
        });
        builder.addCase(approveUser.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || "Failed to approve user";
        });

        // Reject User
        builder.addCase(rejectUser.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(rejectUser.fulfilled, (state, action) => {
            state.loading = false;
            state.pendingUsers = state.pendingUsers.filter(u => u.id !== action.payload);
        });
        builder.addCase(rejectUser.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || "Failed to reject user";
        });
    },
});

export const { clearError, removeUserFromList } = adminSlice.actions;

export default adminSlice.reducer;
