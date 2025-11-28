// store.ts
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // localStorage for web
import { setAuthToken, apiClient, setStoreDispatch } from '@/lib/util/apiClient'
import { logout } from './slices/authSlice';

import authReducer from './slices/authSlice';
import gmailReducer from './features/gmail/gmailSlice';
import searchReducer from './features/search/searchSlice';
import chatReducer from './features/chat/chatSlice';
import realtimeChatReducer from './features/realTimeChat/realtimeChatSlice';
import channelsReducer from './features/channels/channelsSlice';
import notificationReducer from './features/notifications/notificationSlice';

// 1️⃣ Combine reducers
const appReducer = combineReducers({
    auth: authReducer,
    gmail: gmailReducer,
    search: searchReducer,
    chat: chatReducer,
    realtimeChat: realtimeChatReducer,
    channels: channelsReducer,
    notifications: notificationReducer,
});

const rootReducer = (state: any, action: any) => {
    if (action.type === logout.type || action.type === 'auth/logoutUser/fulfilled' || action.type === 'auth/logoutUser/rejected') {
        // Clear state on logout
        // We keep the persist key to ensure rehydration works correctly if needed, 
        // but effectively we want to wipe everything.
        // However, redux-persist might need some special handling if we want to keep the storage sync.
        // Setting state to undefined forces reducers to return their initial state.
        state = undefined;
    }
    return appReducer(state, action);
};

// 2️⃣ Persist config
const persistConfig = {
    key: 'root',
    storage,
    whitelist: ['auth'], // persist only auth slice
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// 3️⃣ Configure store
export const store = configureStore({
    reducer: persistedReducer as any,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE', 'persist/REGISTER'],
            },
        }),
});

// 4️⃣ Create persistor
export const persistor = persistStore(store);

// Set store dispatch for API client 401 handling
setStoreDispatch(store.dispatch, () => logout());

// 5️⃣ Token synchronization with Axios
// Initialize token from current state (handles rehydration)
const initializeToken = () => {
    const token = store.getState().auth?.token || null;
    console.log("Store: Initializing token on startup:", token ? "***" + token.slice(-10) : "null");
    setAuthToken(token);
};

// Set initial token
initializeToken();

// Subscribe to token changes
store.subscribe(() => {
    const token = store.getState().auth?.token || null;
    const currentAuthHeader = apiClient.defaults.headers.common["Authorization"];
    const currentToken = typeof currentAuthHeader === 'string' && currentAuthHeader.startsWith('Bearer ')
        ? currentAuthHeader.replace("Bearer ", "")
        : null;

    if (token !== currentToken) {
        console.log("Store: Token changed, updating axios:", token ? "***" + token.slice(-10) : "null");
        setAuthToken(token);
    }
});

// 6️⃣ Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

