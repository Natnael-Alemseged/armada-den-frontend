import { createAsyncThunk } from '@reduxjs/toolkit'
import { ApiService } from '@/lib/util/apiService'
import { ENDPOINTS, BASE_URL } from '@/lib/constants/endpoints'
import { setAuthToken } from '@/lib/util/apiClient'
import { User, LoginCredentials, AuthResponse } from './authSlice'

// Async thunks
export const loginUser = createAsyncThunk<
    { token: string; user: User },
    LoginCredentials,
    { rejectValue: string }
>(
    'auth/loginUser',
    async (credentials, { rejectWithValue }) => {
        try {
            // Login with form data - backend expects OAuth2PasswordRequestForm format
            const formData = new URLSearchParams()
            formData.append('username', credentials.email)
            formData.append('password', credentials.password)

            const loginRes = await ApiService.post(
                ENDPOINTS.AUTH_LOGIN,
                formData,
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                },
                false
            )

            const authData: AuthResponse = loginRes.data

            // Set token in axios client
            setAuthToken(authData.access_token)

            // Fetch user profile to verify token works
            const userRes = await ApiService.get(ENDPOINTS.AUTH_ME, undefined, true)

            return {
                token: authData.access_token,
                user: userRes.data as User,
            }
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.detail || 'Login failed')
        }
    }
)

export const registerUser = createAsyncThunk<
    User,
    { email: string; password: string; full_name?: string },
    { rejectValue: string }
>(
    'auth/registerUser',
    async (credentials, { rejectWithValue }) => {
        try {
            const res = await ApiService.post(
                ENDPOINTS.AUTH_REGISTER,
                {
                    email: credentials.email,
                    password: credentials.password,
                    full_name: credentials.full_name,
                    is_active: true,
                    is_superuser: false,
                    is_verified: false,
                },
                undefined,
                false
            )
            return res.data as User
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.detail || 'Registration failed')
        }
    }
)

export const logoutUser = createAsyncThunk<
    void,
    void,
    { rejectValue: string }
>(
    'auth/logoutUser',
    async (_, { rejectWithValue }) => {
        try {
            await ApiService.post(ENDPOINTS.AUTH_LOGOUT, undefined, undefined, true)
            setAuthToken(null)
        } catch (err: any) {
            // Clear token even if logout fails
            setAuthToken(null)
            return rejectWithValue(err.response?.data?.detail || 'Logout failed')
        }
    }
)

export const fetchUserProfile = createAsyncThunk<
    User,
    void,
    { rejectValue: string }
>(
    'auth/fetchUserProfile',
    async (_, { rejectWithValue }) => {
        try {
            const res = await ApiService.get(ENDPOINTS.AUTH_ME, undefined, true)
            return res.data as User
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.detail || 'Failed to fetch user profile')
        }
    }
)

export const googleLogin = createAsyncThunk<
    void,
    void,
    { rejectValue: string }
>(
    'auth/googleLogin',
    async (_, { rejectWithValue }) => {
        try {
            // Redirect to Google OAuth endpoint
            window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002'}/api/auth/google/authorize`
            // This will redirect away from the page, so we don't return anything
        } catch (err: any) {
            return rejectWithValue('Failed to initiate Google login')
        }
    }
)