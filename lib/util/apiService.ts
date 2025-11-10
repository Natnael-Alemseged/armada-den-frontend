/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosRequestConfig } from "axios";
import { apiClient } from "./apiClient";

/**
 * Helper function to create request config with token flag
 * This flag tells the interceptor whether to include the Authorization header
 */
const createConfig = (
    config?: AxiosRequestConfig,
    tokenNeeded: boolean = true,
    signal?: AbortSignal
): AxiosRequestConfig => {
    return {
        ...config,
        headers: {
            ...config?.headers,
            // This flag is used by the request interceptor to decide whether to include the token
            "X-Token-Needed": String(tokenNeeded),
        },
        ...(signal ? { signal } : {}),
    };
};

/**
 * API Service - Wrapper around axios client with token management
 * All methods support a tokenNeeded parameter (default: true)
 * When tokenNeeded is false, the Authorization header will be excluded from that specific request
 */
export const ApiService = {
    /**
     * GET request
     * @param url - The endpoint URL
     * @param config - Optional axios config
     * @param tokenNeeded - Whether to include the bearer token (default: true)
     */
    get: (url: string, config?: AxiosRequestConfig, tokenNeeded: boolean = true) => {
        console.log(`ApiService.get: ${url}, tokenNeeded: ${tokenNeeded}`);
        return apiClient.get(url, createConfig(config, tokenNeeded));
    },

    /**
     * GET request with query parameters
     * @param endpoint - The endpoint URL
     * @param queryProps - Query parameters as key-value pairs
     * @param tokenNeeded - Whether to include the bearer token (default: true)
     * @param config - Optional axios config
     * @param signal - Optional abort signal
     */
    getWithQuery: (
        endpoint: string,
        queryProps?: Record<string, any>,
        tokenNeeded: boolean = true,
        config?: AxiosRequestConfig,
        signal?: AbortSignal
    ) => {
        let url = endpoint;
        if (queryProps) {
            const query = new URLSearchParams(queryProps).toString();
            url += `?${query}`;
        }
        console.log(`ApiService.getWithQuery: ${url}, tokenNeeded: ${tokenNeeded}`);
        return apiClient.get(url, createConfig(config, tokenNeeded, signal));
    },

    /**
     * POST request
     * @param url - The endpoint URL
     * @param body - Request body
     * @param config - Optional axios config
     * @param tokenNeeded - Whether to include the bearer token (default: true)
     */
    post: (url: string, body?: any, config?: AxiosRequestConfig, tokenNeeded: boolean = true) => {
        console.log(`ApiService.post: ${url}, tokenNeeded: ${tokenNeeded}`);
        return apiClient.post(url, body, createConfig(config, tokenNeeded));
    },

    /**
     * POST request with query parameters
     * @param endpoint - The endpoint URL
     * @param body - Request body
     * @param queryProps - Query parameters as key-value pairs
     * @param tokenNeeded - Whether to include the bearer token (default: true)
     * @param config - Optional axios config
     * @param signal - Optional abort signal
     */
    postWithQuery: (
        endpoint: string,
        body: any,
        queryProps?: Record<string, any>,
        tokenNeeded: boolean = true,
        config?: AxiosRequestConfig,
        signal?: AbortSignal
    ) => {
        let url = endpoint;
        if (queryProps) {
            const query = new URLSearchParams(queryProps).toString();
            url += `?${query}`;
        }
        console.log(`ApiService.postWithQuery: ${url}, tokenNeeded: ${tokenNeeded}`);
        return apiClient.post(url, body, createConfig(config, tokenNeeded, signal));
    },

    /**
     * PATCH request
     * @param url - The endpoint URL
     * @param body - Request body
     * @param config - Optional axios config
     * @param tokenNeeded - Whether to include the bearer token (default: true)
     */
    patch: (url: string, body?: any, config?: AxiosRequestConfig, tokenNeeded: boolean = true) => {
        console.log(`ApiService.patch: ${url}, tokenNeeded: ${tokenNeeded}`);
        return apiClient.patch(url, body, createConfig(config, tokenNeeded));
    },

    /**
     * PUT request
     * @param url - The endpoint URL
     * @param body - Request body
     * @param config - Optional axios config
     * @param tokenNeeded - Whether to include the bearer token (default: true)
     */
    put: (url: string, body?: any, config?: AxiosRequestConfig, tokenNeeded: boolean = true) => {
        console.log(`ApiService.put: ${url}, tokenNeeded: ${tokenNeeded}`);
        return apiClient.put(url, body, createConfig(config, tokenNeeded));
    },

    /**
     * DELETE request
     * @param url - The endpoint URL
     * @param body - Optional request body
     * @param config - Optional axios config
     * @param tokenNeeded - Whether to include the bearer token (default: true)
     */
    delete: (url: string, body?: any, config?: AxiosRequestConfig, tokenNeeded: boolean = true) => {
        console.log(`ApiService.delete: ${url}, tokenNeeded: ${tokenNeeded}`);
        return apiClient.delete(url, {
            ...createConfig(config, tokenNeeded),
            data: body,
        });
    },

    /**
     * Upload a single file
     * @param url - The endpoint URL
     * @param file - The file to upload
     * @param tokenNeeded - Whether to include the bearer token (default: true)
     */
    uploadFile: (url: string, file: any, tokenNeeded: boolean = true) => {
        console.log(`ApiService.uploadFile: ${url}, tokenNeeded: ${tokenNeeded}`);
        const formData = new FormData();
        formData.append("file", file);

        const config = createConfig(
            {
                transformRequest: (data: any) => data, // Don't transform FormData
            },
            tokenNeeded
        );

        return apiClient.post(url, formData, config);
    },

    /**
     * Upload multiple files
     * @param url - The endpoint URL
     * @param files - Array of files to upload
     * @param tokenNeeded - Whether to include the bearer token (default: true)
     */
    uploadFiles: (url: string, files: any[], tokenNeeded: boolean = true) => {
        console.log(`ApiService.uploadFiles: ${url}, tokenNeeded: ${tokenNeeded}`);
        const formData = new FormData();
        files.forEach((file) => formData.append("files", file));

        return apiClient.post(url, formData, createConfig({}, tokenNeeded));
    },
};