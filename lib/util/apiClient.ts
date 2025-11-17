import axios from "axios";
import { BASE_URL } from "../constants/endpoints";
import type { AppDispatch } from "../store";
import type { AnyAction } from "@reduxjs/toolkit";

// Store reference will be set after store initialization
let storeDispatch: AppDispatch | null = null;
let logoutActionCreator: (() => AnyAction) | null = null;

export const setStoreDispatch = (dispatch: AppDispatch, logoutCreator: () => AnyAction) => {
    storeDispatch = dispatch;
    logoutActionCreator = logoutCreator;
};



// Create axios instance with base configuration
export const apiClient = axios.create({
    baseURL: BASE_URL,
    timeout: 60000,
    withCredentials: true,
});

// Helper to set/remove token globally
export const setAuthToken = (token: string | null) => {
    console.log("ApiClient: Setting auth token", token ? "***" + token.slice(-10) : "null");

    if (token) {
        // Set the Authorization header with Bearer token
        apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        console.log("ApiClient: Authorization header set to", apiClient.defaults.headers.common["Authorization"]);
    } else {
        // Remove the Authorization header
        delete apiClient.defaults.headers.common["Authorization"];
        console.log("ApiClient: Authorization header removed");
    }
};

// Request Interceptor - handles token inclusion/exclusion per request
apiClient.interceptors.request.use(
    (config) => {
        console.log("Request interceptor - URL:", config.url);
        console.log("Request interceptor - Headers before processing:", { ...config.headers });
        
        // Check if this specific request should NOT include the token
        const tokenNeeded = config.headers?.["X-Token-Needed"];
        
        if (tokenNeeded === "false") {
            // Explicitly remove Authorization for this request
            delete config.headers["Authorization"];
            console.log("Request interceptor - Token NOT needed, removed Authorization header");
        } else {
            // Ensure Authorization header is present from defaults
            if (apiClient.defaults.headers.common["Authorization"]) {
                config.headers["Authorization"] = apiClient.defaults.headers.common["Authorization"];
                console.log("Request interceptor - Token needed, Authorization header:", config.headers["Authorization"]);
            } else {
                console.warn("Request interceptor - Token needed but no token available in defaults");
            }
        }
        
        // Clean up the custom flag so it doesn't go to the server
        delete config.headers["X-Token-Needed"];
        
        // Set Content-Type for JSON requests
        if (config.data && !(config.data instanceof FormData) && !config.headers["Content-Type"]) {
            config.headers["Content-Type"] = "application/json";
        }
        
        // For FormData, let browser set Content-Type with boundary
        if (config.data instanceof FormData) {
            delete config.headers["Content-Type"];
        }
        
        console.log("Request interceptor - Final headers:", { ...config.headers });
        
        return config;
    },
    (error) => {
        console.error("Request interceptor error:", error);
        return Promise.reject(error);
    }
);

// Response Interceptor - handles errors
apiClient.interceptors.response.use(
    (response) => {
        console.log("Response received:", response.status, response.config.url);
        return response;
    },
    (error) => {
        // Handle different error types
        if (error.response) {
            // Server responded with error status
            console.error("API Error Response:", {
                status: error.response.status,
                url: error.config?.url,
                data: error.response.data,
                message: error.message,
            });

            // Handle 401 Unauthorized - logout user
            if (error.response.status === 401) {
                console.warn("401 Unauthorized - Logging out user");
                
                // Clear token immediately
                setAuthToken(null);
                
                // Dispatch logout action if store is available
                if (storeDispatch && logoutActionCreator) {
                    storeDispatch(logoutActionCreator());
                }
            }
        } else if (error.request) {
            // Request was made but no response received
            console.error("API Error - No Response:", {
                url: error.config?.url,
                message: error.message,
                code: error.code,
            });
        } else {
            // Error in request setup
            console.error("API Error - Request Setup:", {
                message: error.message,
                stack: error.stack,
            });
        }

        return Promise.reject(error);
    }
);