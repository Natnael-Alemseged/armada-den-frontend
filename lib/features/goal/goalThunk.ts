import {createAsyncThunk} from "@reduxjs/toolkit";
import {ApiService} from "@/lib/util/apiService";

// Define Goal type locally since the import path doesn't exist
interface Goal {
    points: any;
    status: string;
    rejection_reason?: string | null;
    id: string;
    title: string;
    description?: string;
    verb: string;
    quantity: number;
    object_or_metric: string;
    direction: "increase" | "decrease";
    unit_of_measure: string;
    slope_pts_per_unit?: number;
    threshold?: number;
    calculated_points?: number;
    due_date?: string | null;
    active: boolean;
    result?: number | null;
    measured_value?: number;
    measure_source?: string;
    impact_credit?: number;
    project_name: string;
    role_name?: string | null;
    owner?: Person;
    reviewer?: Person;
    standards?: Standard[];
    template_name?: string;
    created_at: string;
}

interface Standard {
    id: string;
    text: string;
    position: number;
    weight: number;
}

// Define Person type locally since the import path doesn't exist
interface Person {
    id: string;
    name: string;
    email: string;
}

interface UpdateGoalStatusPayload {
    goalId: string;
    status: "approved" | "rejected";
    rejection_reason?: string; // optional reason for rejection
}

export const updateGoalStatus = createAsyncThunk(
    "goals/updateGoalStatus",
    async (payload: UpdateGoalStatusPayload, { rejectWithValue }) => {
        try {
            // Map frontend status to backend status
            const backendStatus = payload.status === "approved" ? "active" : "rejected";
            const response = await ApiService.patch(`/goals/${payload.goalId}`, {
                status: backendStatus,
                rejection_reason: payload.rejection_reason,
            });
            return response.data.data as Goal; // unwrap data from response
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.error || "Failed to update goal status");
        }
    }
);




// Fetch all goals for logged-in user
export const fetchGoals = createAsyncThunk("goals/fetchGoals", async (_, { rejectWithValue }) => {
    try {
        const response = await ApiService.get("/goals");
        console.log(response.data)
        return response.data as Goal[];
    } catch (err: any) {
        return rejectWithValue(err.response?.data?.error || "Failed to fetch goals");
    }
});

// Create a new goal
interface CreateGoalPayload {
    project_id: string;
    goal_template_id: string;
    target_value: number;
    due_date?: string;
    role_id: string;
    reviewer_id?: string;
    immediacy: "immediate" | "delayed";
    standards?: Array<{ id?: string; text: string; position: number; weight?: number }>;
}

export const createGoal = createAsyncThunk(
    "goals/createGoal",
    async (payload: CreateGoalPayload, { rejectWithValue }) => {
        try {
            const response = await ApiService.post("/goals", payload);
            return response.data as Goal;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.error || "Failed to create goal");
        }
    }
);


export const fetchGoalById = createAsyncThunk(
    "goals/fetchGoalById",
    async (goalId: string, { rejectWithValue }) => {
        try {
            const response = await ApiService.get(`/goals/${goalId}`);
            return response.data.data as Goal; // unwrap the data
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.error || "Failed to fetch goal");
        }
    }
);


export const fetchUsersWithCapability = createAsyncThunk<
    Person[],        // Return type
    string,          // capability string
    { rejectValue: string }
>(
    "goals/fetchUsersWithCapability",
    async (capability: string, { rejectWithValue }) => {
        try {
            const response = await ApiService.get(`/people?capability=${capability}`);
            return response.data.data as Person[]; // extract `data` from API response
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.error || "Failed to fetch users with capability");
        }
    }
);


export const deleteGoal = createAsyncThunk(
    "goals/deleteGoal",
    async (goalId: string, { rejectWithValue }) => {
        try {
            const response = await ApiService.delete(`/goals/${goalId}`);
            return goalId;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.error || "Failed to delete goal");
        }
    }
);

export const updateGoal = createAsyncThunk(
    "goals/updateGoal",
    async (payload: { id: string; target_value: number; due_date: string; standards?: Array<any>; reviewer_id?: string }, { rejectWithValue }) => {
        try {
            const response = await ApiService.patch(`/goals/${payload.id}`, payload);
            return response.data as Goal;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.error || "Failed to update goal");
        }
    }
);



