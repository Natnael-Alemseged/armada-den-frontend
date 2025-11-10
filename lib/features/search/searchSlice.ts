import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
    performSearch,
    getSearchHistory,
    connectSearch,
    getSearchStatus,
    handleSearchCallback,
    getSearchDetails,
    getSearchTools,
} from "./searchThunk";
import { SearchResult, SearchHistoryItem, Tool, SearchDetailsResponse } from "@/lib/types";

export interface SearchState {
    results: SearchResult[];
    history: SearchHistoryItem[];
    loading: boolean;
    error: string | null;
    connected: boolean;
    entityId: string | null;
    connectionUrl: string | null;
    currentQuery: string;
    totalHistory: number;
    currentPage: number;
    pageSize: number;
    tools: Tool[];
    callbackStatus: 'idle' | 'loading' | 'success' | 'error';
    searchDetails: SearchDetailsResponse | null;
}

const initialState: SearchState = {
    results: [],
    history: [],
    loading: false,
    error: null,
    connected: false,
    entityId: null,
    connectionUrl: null,
    currentQuery: "",
    totalHistory: 0,
    currentPage: 1,
    pageSize: 20,
    tools: [],
    callbackStatus: 'idle',
    searchDetails: null,
};

const searchSlice = createSlice({
    name: "search",
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearResults: (state) => {
            state.results = [];
            state.currentQuery = "";
        },
        setCurrentQuery: (state, action: PayloadAction<string>) => {
            state.currentQuery = action.payload;
        },
        setPage: (state, action: PayloadAction<number>) => {
            state.currentPage = action.payload;
        },
    },
    extraReducers: (builder) => {
        // Connect Search
        builder.addCase(connectSearch.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(connectSearch.fulfilled, (state, action) => {
            state.loading = false;
            state.connectionUrl = action.payload.connection_url;
            state.entityId = action.payload.entity_id;
        });
        builder.addCase(connectSearch.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || "Failed to connect search";
        });

        // Get Search Status
        builder.addCase(getSearchStatus.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(getSearchStatus.fulfilled, (state, action) => {
            state.loading = false;
            state.connected = action.payload.connected;
            state.entityId = action.payload.entity_id;
        });
        builder.addCase(getSearchStatus.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || "Failed to get search status";
        });

        // Perform Search
        builder.addCase(performSearch.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(performSearch.fulfilled, (state, action) => {
            state.loading = false;
            state.results = action.payload.results;
            state.currentQuery = action.payload.query;
        });
        builder.addCase(performSearch.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || "Failed to perform search";
        });

        // Get Search History
        builder.addCase(getSearchHistory.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(getSearchHistory.fulfilled, (state, action) => {
            state.loading = false;
            state.history = action.payload.searches;
            state.totalHistory = action.payload.total;
            state.currentPage = action.payload.page;
            state.pageSize = action.payload.page_size;
        });
        builder.addCase(getSearchHistory.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || "Failed to get search history";
        });

        // Handle Search Callback
        builder.addCase(handleSearchCallback.pending, (state) => {
            state.callbackStatus = 'loading';
            state.error = null;
        });
        builder.addCase(handleSearchCallback.fulfilled, (state) => {
            state.callbackStatus = 'success';
            state.connected = true;
        });
        builder.addCase(handleSearchCallback.rejected, (state, action) => {
            state.callbackStatus = 'error';
            state.error = action.payload || "Failed to handle search callback";
        });

        // Get Search Details
        builder.addCase(getSearchDetails.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(getSearchDetails.fulfilled, (state, action) => {
            state.loading = false;
            state.searchDetails = action.payload;
        });
        builder.addCase(getSearchDetails.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || "Failed to get search details";
        });

        // Get Search Tools
        builder.addCase(getSearchTools.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(getSearchTools.fulfilled, (state, action) => {
            state.loading = false;
            state.tools = action.payload.tools;
        });
        builder.addCase(getSearchTools.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || "Failed to get search tools";
        });
    },
});

export const { clearError, clearResults, setCurrentQuery, setPage } = searchSlice.actions;
export default searchSlice.reducer;