import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import {
    createGoal,
    fetchGoalById,
    fetchGoals,
    fetchUsersWithCapability,
    updateGoalStatus
} from "@/lib/features/goal/goalThunk";

// Define Person type locally since the import path doesn't exist
interface Person {
    id: string;
    name: string;
    email: string;
}

// ------------------------
// Types
// ------------------------

interface Standard {
    id: string;
    text: string;
    position: number;
    weight: number;
}
export interface Goal {
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

interface GoalsState {
    goals: Goal[];
    loading: boolean;
    selectedGoal: Goal | null;
    error: string | null;
    eligibleReviewers: Person[];
}

const initialState: GoalsState = {
    goals: [],
    loading: false,
    selectedGoal: null,
    error: null,
    eligibleReviewers: [], // initialize
};

const goalsSlice = createSlice({
    name: "goals",
    initialState,
    reducers: {},
    extraReducers: builder => {
        // Fetch goals
        builder.addCase(fetchGoals.pending, state => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchGoals.fulfilled, (state, action: PayloadAction<Goal[]>) => {
            state.loading = false;
            state.goals = action.payload;
        });
        builder.addCase(fetchGoals.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });


        builder.addCase(fetchUsersWithCapability.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchUsersWithCapability.fulfilled, (state, action: PayloadAction<Person[]>) => {
            state.loading = false;
            state.eligibleReviewers = action.payload;
        });
        builder.addCase(fetchUsersWithCapability.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
            state.eligibleReviewers = [];
        });


        builder.addCase(updateGoalStatus.pending, (state) => {
            state.loading = true;
            state.error = null;
        });

        builder.addCase(updateGoalStatus.fulfilled, (state, action: PayloadAction<Goal>) => {
            state.loading = false;
            // Replace the updated goal in the state
            const index = state.goals.findIndex(g => g.id === action.payload.id);
            if (index !== -1) state.goals[index] = action.payload;
        });

        builder.addCase(updateGoalStatus.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Create goal
        builder.addCase(createGoal.pending, state => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(createGoal.fulfilled, (state, action: PayloadAction<Goal>) => {
            state.loading = false;
            state.goals.unshift(action.payload); // Add new goal at the top
        });
        builder.addCase(createGoal.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });


        builder.addCase(fetchGoalById.pending, (state) => {
            state.loading = true;
            state.error = null;
            state.selectedGoal = null;
        });
        builder.addCase(fetchGoalById.fulfilled, (state, action: PayloadAction<Goal>) => {
            state.loading = false;
            state.selectedGoal = action.payload;
        });
        builder.addCase(fetchGoalById.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
            state.selectedGoal = null;
        });

    },
});

export default goalsSlice.reducer;
