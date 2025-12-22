import { createSlice } from '@reduxjs/toolkit'
import { loginUser, registerUser, logoutUser, fetchUserProfile, updateUserProfile } from './authThunk'

// Types
export interface User {
    id: string
    email: string
    name?: string
    full_name?: string
    role?: 'ADMIN' | 'USER'
    employment_type?: string
    management_level?: string
    capabilities?: string[]
    is_active?: boolean
    is_superuser?: boolean
    is_verified?: boolean
    is_approved?: boolean
}

export interface AuthState {
    user: User | null
    token: string | null
    loading: boolean
    error: string | null
    message: string | null
}

export interface LoginCredentials {
    email: string
    password: string
}

export interface RegisterCredentials {
    name: string
    email: string
    password: string
    employmentType: string
    managementLevel: string
}

export interface AuthResponse {
    access_token: string
    token_type: string
}

// Initial state
const initialState: AuthState = {
    user: null,
    token: null,
    loading: false,
    error: null,
    message: null,
}

// Auth slice
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null
        },
        clearMessage: (state) => {
            state.message = null
        },
        clearAuth: (state) => {
            state.user = null
            state.error = null
            state.message = null
        },
        logout: (state) => {
            state.user = null
            state.token = null
            state.loading = false
            state.error = null
            state.message = null
        },
    },
    extraReducers: (builder) => {
        // Login
        builder
            .addCase(loginUser.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false
                state.user = action.payload.user
                state.token = action.payload.token
                state.message = 'Login successful'
                state.error = null
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload || 'Login failed'
                state.user = null
                state.token = null
            })

        // Register
        builder
            .addCase(registerUser.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.loading = false
                state.message = 'Registration successful'
                state.error = null
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload || 'Registration failed'
            })

        // Logout
        builder
            .addCase(logoutUser.pending, (state) => {
                state.loading = true
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.loading = false
                state.user = null
                state.token = null
                state.error = null
                state.message = null
            })
            .addCase(logoutUser.rejected, (state, action) => {
                state.loading = false
                // Don't set error on logout rejection - user is being logged out anyway
                state.error = null
                state.user = null
                state.token = null
            })

        // Fetch user profile
        builder
            .addCase(fetchUserProfile.pending, (state) => {
                state.loading = true
            })
            .addCase(fetchUserProfile.fulfilled, (state, action) => {
                state.loading = false
                state.user = action.payload
                state.error = null
            })
            .addCase(fetchUserProfile.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload || 'Failed to fetch user profile'
                state.user = null
            })

        // Update user profile
        builder
            .addCase(updateUserProfile.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(updateUserProfile.fulfilled, (state, action) => {
                state.loading = false
                state.user = action.payload
                state.error = null
                state.message = 'Profile updated successfully'
            })
            .addCase(updateUserProfile.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload || 'Failed to update user profile'
            })
    },
})

export const { clearError, clearMessage, clearAuth, logout } = authSlice.actions
export default authSlice.reducer