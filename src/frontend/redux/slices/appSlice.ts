import { Principal } from "@dfinity/principal";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

// Consolidated initialization thunk
export const initializeApp = createAsyncThunk(
  "app/initialize",
  async (backendActor: any = null, { rejectWithValue, getState }) => {
    try {
      // Check if already initialized to prevent re-runs
      const state = getState() as any;
      if (state.filesState?.inited) {
        // Return a signal that initialization is already complete
        return { alreadyInitialized: true };
      }

      const [initialRes] = await Promise.allSettled([
        backendActor.get_initial_data(),
      ]);

      if (initialRes.status === "fulfilled" && "Ok" in initialRes.value) {
        const workspaces = await backendActor.get_work_spaces().catch(() => []);
        const profileRes = await backendActor
          .get_user_profile(Principal.fromText(initialRes.value.Ok.profile.id))
          .catch(() => initialRes.value.Ok.profile);

        return {
          Profile: initialRes.value.Ok.profile,
          ProfileHistory:
            profileRes && typeof profileRes === "object" && "Ok" in profileRes
              ? profileRes.Ok
              : profileRes,
          Files: initialRes.value.Ok.files || [],
          Friends: initialRes.value.Ok.friends || [],
          Wallet: initialRes.value.Ok.wallet || null,
          FilesContents: initialRes.value.Ok.files_contents || [],
          Contracts: initialRes.value.Ok.contracts || {},
          workspaces,
        };
      } else {
        // Fallback: fetch data individually
        const [workspaces, friends, files] = await Promise.allSettled([
          backendActor.get_work_spaces(),
          backendActor.get_friends(),
          backendActor.get_all_files(),
        ]);

        return {
          Profile: {},
          ProfileHistory: {},
          Files: files.status === "fulfilled" ? files.value : [],
          Friends: friends.status === "fulfilled" ? friends.value || [] : [],
          Wallet: null,
          workspaces: workspaces.status === "fulfilled" ? workspaces.value : [],
          FilesContents: [],
          Contracts: {},
        };
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
