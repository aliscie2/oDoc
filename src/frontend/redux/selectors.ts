import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "./reducers";

// Memoized selectors to prevent unnecessary re-renders
export const selectJobState = (state: RootState) => state.jobState;
export const selectFilesState = (state: RootState) => state.filesState;
export const selectUIState = (state: RootState) => state.uiState;

// Memoized job selectors
export const selectCurrentJobId = createSelector(
  [selectJobState],
  (jobState) => jobState.currentJobId,
);

export const selectJobs = createSelector(
  [selectJobState],
  (jobState) => jobState.jobs,
);

export const selectMatchingJobs = createSelector(
  [selectJobState],
  (jobState) => jobState.matchingJobs,
);

export const selectCurrentJob = createSelector(
  [selectJobs, selectCurrentJobId],
  (jobs, currentJobId) => jobs?.find((job) => job.id === currentJobId) || null,
);

// Memoized profile selector
export const selectProfile = createSelector(
  [selectFilesState],
  (filesState) => filesState.profile,
);

// Memoized UI selectors
export const selectAuthStatus = createSelector(
  [selectUIState],
  (uiState) => uiState.authStatus,
);

export const selectIsLoggedIn = createSelector(
  [selectUIState],
  (uiState) =>
    uiState.authStatus === "authenticated" ||
    uiState.authStatus === "registered",
);

export const selectIsRegistered = createSelector(
  [selectUIState],
  (uiState) => uiState.authStatus === "registered",
);

export const selectIsFetching = createSelector(
  [selectUIState],
  (uiState) => uiState.isFetching,
);
