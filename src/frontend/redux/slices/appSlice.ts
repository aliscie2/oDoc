import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

// Consolidated initialization thunk
export const initializeApp = createAsyncThunk(
  "app/initialize",
  async (
    {
      backendActor,
      force = false,
    }: { backendActor: unknown; force?: boolean },
    { rejectWithValue, getState },
  ) => {
    try {
      // Check if already initialized to prevent re-runs (unless force is true)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const state = getState() as any;
      if (!force && state.filesState?.inited) {
        // Return a signal that initialization is already complete
        return { alreadyInitialized: true };
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const initialRes = await (backendActor as any).get_initial_data();

      if ("Ok" in initialRes) {
        return { ...initialRes.Ok, files: [], files_content: {} };
      }
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

const appSlice = createSlice({
  name: "app",
  initialState: {
    status: "idle" as "idle" | "loading" | "succeeded" | "failed",
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(initializeApp.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(initializeApp.fulfilled, (state) => {
        state.status = "succeeded";
        // The actual data will be handled by the filesReducer
      })
      .addCase(initializeApp.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export default appSlice.reducer;
