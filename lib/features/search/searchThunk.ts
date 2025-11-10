import { createAsyncThunk } from "@reduxjs/toolkit";
import { ApiService } from "@/lib/util/apiService";
import { ENDPOINTS } from "@/lib/constants/endpoints";
import {
    SearchConnectionResponse,
    SearchStatusResponse,
    WebSearchRequest,
    WebSearchResponse,
    SearchHistoryResponse,
} from "@/lib/types";

// Connect Search
export const connectSearch = createAsyncThunk<
    SearchConnectionResponse,
    { redirectUrl: string },
    { rejectValue: string }
>("search/connect", async (payload, { rejectWithValue }) => {
    try {
        const res = await ApiService.post(
            ENDPOINTS.SEARCH_CONNECT,
            { redirect_url: payload.redirectUrl },
            undefined,
            true
        );
        return res.data;
    } catch (err: any) {
        return rejectWithValue(err.response?.data?.detail || "Failed to connect search");
    }
});

// Get Search Status
export const getSearchStatus = createAsyncThunk<
    SearchStatusResponse,
    void,
    { rejectValue: string }
>("search/status", async (_, { rejectWithValue }) => {
    try {
        const res = await ApiService.get(ENDPOINTS.SEARCH_STATUS, undefined, true);
        return res.data;
    } catch (err: any) {
        return rejectWithValue(err.response?.data?.detail || "Failed to get search status");
    }
});

// Perform Search
export const performSearch = createAsyncThunk<
    WebSearchResponse,
    WebSearchRequest,
    { rejectValue: string }
>("search/performSearch", async (payload, { rejectWithValue }) => {
    try {
        const res = await ApiService.post(
            ENDPOINTS.SEARCH_QUERY,
            {
                query: payload.query,
                num_results: payload.num_results || 10,
                engine: payload.engine || "SERPAPI",
                save_to_db: payload.save_to_db !== false,
            },
            undefined,
            true
        );
        return res.data;
    } catch (err: any) {
        return rejectWithValue(err.response?.data?.detail || "Failed to perform search");
    }
});

// Get Search History
export const getSearchHistory = createAsyncThunk<
    SearchHistoryResponse,
    { page?: number; pageSize?: number },
    { rejectValue: string }
>("search/getHistory", async (payload, { rejectWithValue }) => {
    try {
        const res = await ApiService.getWithQuery(
            ENDPOINTS.SEARCH_HISTORY,
            {
                page: payload.page || 1,
                page_size: payload.pageSize || 20,
            },
            true
        );
        return res.data;
    } catch (err: any) {
        return rejectWithValue(err.response?.data?.detail || "Failed to get search history");
    }
});