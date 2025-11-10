import { AxiosRequestConfig, AxiosResponse } from "axios";
import { apiClient } from "./apiClient";

// Helper to merge tokenNeeded flag into headers
const withTokenFlag = (
    config: AxiosRequestConfig | undefined,
    tokenNeeded: boolean,
    signal?: AbortSignal
): AxiosRequestConfig => {
    return {
        ...config,
        headers: {
            ...config?.headers,
            "X-Token-Needed": String(tokenNeeded),
        },
        ...(signal ? { signal } : {}),
    };
};

// Expose a clean service API with tokenNeeded support
export const ApiService = {
    get: (url: string, config?: AxiosRequestConfig, tokenNeeded: boolean = true) =>
        apiClient.get(url, withTokenFlag(config, tokenNeeded)),

    getWithQuery: async (
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

        return apiClient.get(url, withTokenFlag(config, tokenNeeded, signal));
    },

    post: (url: string, body?: any, config?: AxiosRequestConfig, tokenNeeded: boolean = true) =>
        apiClient.post(url, body, withTokenFlag(config, tokenNeeded)),

    postWithQuery: async (
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

        return apiClient.post(url, body, withTokenFlag(config, tokenNeeded, signal));
    },

    patch: (url: string, body?: any, config?: AxiosRequestConfig, tokenNeeded: boolean = true) =>
        apiClient.patch(url, body, withTokenFlag(config, tokenNeeded)),

    put: (url: string, body?: any, config?: AxiosRequestConfig, tokenNeeded: boolean = true) =>
        apiClient.put(url, body, withTokenFlag(config, tokenNeeded)),

    delete: (url: string, body?: any, config?: AxiosRequestConfig, tokenNeeded: boolean = true) =>
        apiClient.delete(url, {
            ...withTokenFlag(config, tokenNeeded),
            data: body,
        }),

    uploadFile: (url: string, file: any, tokenNeeded: boolean = true) => {
        const formData = new FormData();
        formData.append("file", file);

        const config = withTokenFlag(
            {
                headers: {},
                transformRequest: (data: any) => {
                    return data;
                },
            },
            tokenNeeded
        );

        return apiClient.post(url, formData, config);
    },

    uploadFiles: (url: string, files: any[], tokenNeeded: boolean = true) => {
        const formData = new FormData();
        files.forEach((file) => formData.append("files", file));
        return apiClient.post(
            url,
            formData,
            withTokenFlag(
                {
                    headers: { "Content-Type": "multipart/form-data" },
                },
                tokenNeeded
            )
        );
    },
};