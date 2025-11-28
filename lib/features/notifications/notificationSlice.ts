
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ApiService } from '@/lib/util/apiService';
import { ENDPOINTS } from '@/lib/constants/api_const';
import { notificationService } from '@/lib/services/notificationService';

interface NotificationState {
    isSubscribed: boolean;
    loading: boolean;
    error: string | null;
}

const initialState: NotificationState = {
    isSubscribed: false,
    loading: false,
    error: null,
};

export const subscribeToNotifications = createAsyncThunk(
    'notifications/subscribe',
    async (_, { rejectWithValue }) => {
        try {
            const hasPermission = await notificationService.requestPermission();
            if (!hasPermission) {
                return rejectWithValue('Permission denied');
            }

            const token = await notificationService.getFCMToken();
            if (!token) {
                return rejectWithValue('Failed to get FCM token');
            }

            // Send to backend
            const response = await ApiService.post(ENDPOINTS.SUBSCRIBE_NOTIFICATION, {
                endpoint: token,
            });

            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to subscribe');
        }
    }
);

export const unsubscribeFromNotifications = createAsyncThunk(
    'notifications/unsubscribe',
    async (_, { rejectWithValue }) => {
        try {
            // Get token first to send to backend
            const token = await notificationService.getFCMToken();

            if (token) {
                // Call backend to remove token via unsubscribe-by-endpoint route
                const url = `${ENDPOINTS.UNSUBSCRIBE_NOTIFICATION_BY_ENDPOINT}?endpoint=${encodeURIComponent(token)}`;
                await ApiService.delete(url);
            }

            // Remove from Firebase
            await notificationService.unsubscribe();
            return true;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to unsubscribe');
        }
    }
);

const notificationSlice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(subscribeToNotifications.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(subscribeToNotifications.fulfilled, (state) => {
                state.loading = false;
                state.isSubscribed = true;
            })
            .addCase(subscribeToNotifications.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(unsubscribeFromNotifications.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(unsubscribeFromNotifications.fulfilled, (state) => {
                state.loading = false;
                state.isSubscribed = false;
            })
            .addCase(unsubscribeFromNotifications.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export default notificationSlice.reducer;
