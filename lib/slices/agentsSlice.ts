import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ApiService } from '@/lib/util/apiService';
import { ENDPOINTS } from '@/lib/constants/endpoints';
import {
    Agent,
    AgentsResponse,
    CreateAgentRequest,
    UpdateAgentRequest,
} from '@/lib/types';

// State interface
export interface AgentsState {
    agents: Agent[];
    selectedAgent: Agent | null;
    loading: boolean;
    error: string | null;
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
}

// Initial state
const initialState: AgentsState = {
    agents: [],
    selectedAgent: null,
    loading: false,
    error: null,
    total: 0,
    page: 1,
    pageSize: 20,
    hasMore: false,
};

// Async thunks
export const fetchAgents = createAsyncThunk<
    AgentsResponse,
    { page?: number; pageSize?: number } | void,
    { rejectValue: string }
>(
    'agents/fetchAgents',
    async (params, { rejectWithValue }) => {
        try {
            const queryParams = new URLSearchParams();
            if (params?.page) queryParams.append('page', params.page.toString());
            if (params?.pageSize) queryParams.append('page_size', params.pageSize.toString());

            const response = await ApiService.get(
                `${ENDPOINTS.AGENTS_LIST}?${queryParams.toString()}`
            );
            return response.data as AgentsResponse;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.detail || 'Failed to fetch agents');
        }
    }
);

export const fetchAgentById = createAsyncThunk<
    Agent,
    string,
    { rejectValue: string }
>(
    'agents/fetchAgentById',
    async (agentId, { rejectWithValue }) => {
        try {
            const response = await ApiService.get(
                ENDPOINTS.AGENTS_GET(agentId)
            );
            return response.data as Agent;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.detail || 'Failed to fetch agent');
        }
    }
);

export const createAgent = createAsyncThunk<
    Agent,
    CreateAgentRequest,
    { rejectValue: string }
>(
    'agents/createAgent',
    async (agentData, { rejectWithValue }) => {
        try {
            const response = await ApiService.post(
                ENDPOINTS.AGENTS_CREATE,
                agentData
            );
            return response.data as Agent;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.detail || 'Failed to create agent');
        }
    }
);

export const updateAgent = createAsyncThunk<
    Agent,
    { agentId: string; data: UpdateAgentRequest },
    { rejectValue: string }
>(
    'agents/updateAgent',
    async ({ agentId, data }, { rejectWithValue }) => {
        try {
            const response = await ApiService.patch(
                ENDPOINTS.AGENTS_UPDATE(agentId),
                data
            );
            return response.data as Agent;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.detail || 'Failed to update agent');
        }
    }
);

export const deleteAgent = createAsyncThunk<
    string,
    string,
    { rejectValue: string }
>(
    'agents/deleteAgent',
    async (agentId, { rejectWithValue }) => {
        try {
            await ApiService.delete(
                ENDPOINTS.AGENTS_DELETE(agentId)
            );
            return agentId;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.detail || 'Failed to delete agent');
        }
    }
);

// Slice
const agentsSlice = createSlice({
    name: 'agents',
    initialState,
    reducers: {
        setSelectedAgent: (state, action: PayloadAction<Agent | null>) => {
            state.selectedAgent = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
        resetAgents: (state) => {
            state.agents = [];
            state.selectedAgent = null;
            state.total = 0;
            state.page = 1;
            state.hasMore = false;
        },
    },
    extraReducers: (builder) => {
        // Fetch agents
        builder
            .addCase(fetchAgents.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAgents.fulfilled, (state, action) => {
                state.loading = false;
                state.agents = action.payload.agents;
                state.total = action.payload.total;
                state.page = action.payload.page;
                state.pageSize = action.payload.page_size;
                state.hasMore = action.payload.has_more;
            })
            .addCase(fetchAgents.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch agents';
            });

        // Fetch agent by ID
        builder
            .addCase(fetchAgentById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAgentById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedAgent = action.payload;
            })
            .addCase(fetchAgentById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch agent';
            });

        // Create agent
        builder
            .addCase(createAgent.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createAgent.fulfilled, (state, action) => {
                state.loading = false;
                state.agents.unshift(action.payload);
                state.total += 1;
            })
            .addCase(createAgent.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to create agent';
            });

        // Update agent
        builder
            .addCase(updateAgent.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateAgent.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.agents.findIndex(a => a.id === action.payload.id);
                if (index !== -1) {
                    state.agents[index] = action.payload;
                }
                if (state.selectedAgent?.id === action.payload.id) {
                    state.selectedAgent = action.payload;
                }
            })
            .addCase(updateAgent.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to update agent';
            });

        // Delete agent
        builder
            .addCase(deleteAgent.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteAgent.fulfilled, (state, action) => {
                state.loading = false;
                state.agents = state.agents.filter(a => a.id !== action.payload);
                state.total -= 1;
                if (state.selectedAgent?.id === action.payload) {
                    state.selectedAgent = null;
                }
            })
            .addCase(deleteAgent.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to delete agent';
            });
    },
});

export const { setSelectedAgent, clearError, resetAgents } = agentsSlice.actions;
export default agentsSlice.reducer;
