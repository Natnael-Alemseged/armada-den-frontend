import { configureStore } from '@reduxjs/toolkit'
// 1. Imports for Redux Persist
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage' // defaults to localStorage for web
import { combineReducers } from '@reduxjs/toolkit'

// Assuming these reducers exist at these paths
import authReducer from './slices/authSlice'
import goalReducer from './features/goal/goalsSlice';
import gmailReducer from "./features/gmail/gmailSlice";
import searchReducer from "./features/search/searchSlice";

// 3. Combine reducers (required when using Redux Persist with configureStore)
const rootReducer = combineReducers({
    auth: authReducer,
    goal: goalReducer,
    gmail: gmailReducer,
    search: searchReducer,
})

// 4. Create the persisted reducer (only on client side)
const persistedReducer = typeof window !== 'undefined'
    ? persistReducer({
        key: 'root',
        storage,
        // Only the 'auth' slice will be persisted/rehydrated.
        // We keep 'role' out as it often contains API data that should be fetched fresh.
        whitelist: ['auth']
    }, rootReducer)
    : rootReducer

// 5. Configure the store using the persisted reducer
export const store = configureStore({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    reducer: persistedReducer as any, // Type assertion to handle Redux Persist types
    // 6. Middleware configuration to suppress serializability warnings
    // caused by Redux Persist's internal actions (PERSIST and REHYDRATE).
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE', 'persist/REGISTER'],
            },
        }),
})

// 7. Create the persistor object (needed for use in the root components)
export const persistor = persistStore(store)

// 8. Set up token synchronization with axios when store is rehydrated
import { setAuthToken } from './util/apiClient'

// Initialize token from current state (handles rehydration)
const currentState = store.getState()
if (currentState.auth?.token) {
    setAuthToken(currentState.auth.token)
}

// Listen for store changes to sync token with axios
store.subscribe(() => {
    const state = store.getState()
    const token = state.auth?.token
    setAuthToken(token || null)
})

// Define types for state and dispatch
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
