# Architecture Documentation

## Overview
This application follows a Redux-based architecture with centralized state management, API service layer, and feature-based organization.

## Required Dependencies

You need to install the following packages:

```bash
pnpm add axios @reduxjs/toolkit react-redux redux-persist
```

## Architecture Components

### 1. API Layer (`lib/util/`)
- **`apiClient.ts`**: Axios instance with request/response interceptors
- **`apiService.ts`**: Service layer with helper methods for API calls
- **`queryBuilder.ts`**: Query parameter builder utilities
- **`parsedQueryHelper.ts`**: Query parsing helpers

### 2. Constants (`lib/constants/`)
- **`endpoints.ts`**: Centralized API endpoint definitions

### 3. Redux Store (`lib/`)
- **`store.ts`**: Redux store configuration with persistence
- **`hooks.ts`**: Typed Redux hooks (useAppDispatch, useAppSelector)

### 4. Features (`lib/features/`)
Each feature follows this structure:
- **`[feature]Slice.ts`**: Redux slice with state and reducers
- **`[feature]Thunk.ts`**: Async thunks for API calls
- **`types.ts`**: TypeScript types for the feature

Current features:
- `auth/` - Authentication
- `gmail/` - Gmail integration
- `search/` - Search functionality
- `project/` - Project management
- `role/` - Role management
- And more...

### 5. Toast Notifications (`components/`)
- **`Toast.tsx`**: Global toast notification helper
- **`ui/Toast.tsx`**: Toast UI component with provider

## Usage Examples

### Using Redux in Components

```typescript
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { loginUser } from '@/lib/slices/authSlice';

function LoginComponent() {
  const dispatch = useAppDispatch();
  const { user, loading, error } = useAppSelector((state) => state.auth);

  const handleLogin = async (email: string, password: string) => {
    await dispatch(loginUser({ email, password }));
  };

  return (
    // Your component JSX
  );
}
```

### Using API Service Directly

```typescript
import { ApiService } from '@/lib/util/apiService';
import { ENDPOINTS } from '@/lib/constants/endpoints';

// GET request
const response = await ApiService.get(ENDPOINTS.GMAIL_STATUS);

// POST request
const response = await ApiService.post(ENDPOINTS.GMAIL_SEND, emailData);

// GET with query parameters
const response = await ApiService.getWithQuery(
  ENDPOINTS.SEARCH_HISTORY,
  { page: 1, pageSize: 20 }
);
```

### Using Toast Notifications

```typescript
import { toastBar, ToastType } from '@/components/Toast';

// Success toast
toastBar('Operation successful!', ToastType.SUCCESS);

// Error toast
toastBar('Something went wrong', ToastType.DANGER);

// Info toast
toastBar('Information message', ToastType.INFO);

// Warning toast
toastBar('Warning message', ToastType.WARNING);
```

### Creating New Features

1. Create feature directory: `lib/features/[feature-name]/`
2. Create slice file: `[feature-name]Slice.ts`
3. Create thunk file: `[feature-name]Thunk.ts`
4. Add types if needed: `types.ts`
5. Register reducer in `lib/store.ts`

Example slice structure:
```typescript
import { createSlice } from "@reduxjs/toolkit";
import { fetchData } from "./featureThunk";

interface FeatureState {
  data: any[];
  loading: boolean;
  error: string | null;
}

const initialState: FeatureState = {
  data: [],
  loading: false,
  error: null,
};

const featureSlice = createSlice({
  name: "feature",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchData.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchData.fulfilled, (state, action) => {
      state.loading = false;
      state.data = action.payload;
    });
    builder.addCase(fetchData.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Failed to fetch data";
    });
  },
});

export const { clearError } = featureSlice.actions;
export default featureSlice.reducer;
```

Example thunk structure:
```typescript
import { createAsyncThunk } from "@reduxjs/toolkit";
import { ApiService } from "@/lib/util/apiService";
import { ENDPOINTS } from "@/lib/constants/endpoints";

export const fetchData = createAsyncThunk<
  DataType,
  RequestParams,
  { rejectValue: string }
>("feature/fetchData", async (params, { rejectWithValue }) => {
  try {
    const res = await ApiService.get(ENDPOINTS.FEATURE_ENDPOINT);
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.detail || "Failed to fetch data");
  }
});
```

## Key Patterns

1. **Centralized API Configuration**: All endpoints in `endpoints.ts`
2. **Token Management**: Automatic token injection via axios interceptors
3. **Error Handling**: Centralized in axios response interceptor
4. **State Persistence**: Auth state persisted via redux-persist
5. **Type Safety**: Full TypeScript support throughout
6. **Feature-Based Organization**: Each feature is self-contained

## Environment Variables

Create a `.env.local` file with:
```
NEXT_PUBLIC_API_URL=http://localhost:8002/api
```

## Notes

- The old `lib/api.ts` file can be deprecated in favor of the new architecture
- Components should use Redux hooks instead of the old AuthProvider context
- All API calls should go through ApiService for consistency
- Toast notifications are automatically integrated with the API error handling