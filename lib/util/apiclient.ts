import axios from "axios";
import { BASE_URL } from "../constants/endpoints";

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
        const status = error.response?.status;
        console.error("API Error:", {
            status,
            url: error.config?.url,
            data: error.response?.data,
        });

        // Removed automatic logout on 401 - let individual components handle auth errors

        return Promise.reject(error);
    }
);