import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { AIReducer } from "./AIReducer";
import { calendarReducer } from "./calendarReducer";
import { chatsReducer } from "./chatsReducer";
import { filesReducer } from "./filesReducer";
import { jobReducer } from "./jobReducer";
import { notificationReducer } from "./notificationReducer";
import { uiReducer } from "./uiReducer";

const allStoreReducers = {
  uiState: uiReducer,
  filesState: filesReducer,
  chatsState: chatsReducer,
  notificationState: notificationReducer,
  calendarState: calendarReducer,
  jobState: jobReducer,
  AIState: AIReducer,
};
const rootReducer = combineReducers(allStoreReducers);

function setupStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: allStoreReducers,
    preloadedState,
    // middleware: (getDefaultMiddleware) =>
    //   getDefaultMiddleware({
    //     serializableCheck: false,
    //   }),
  });
}
const store = setupStore();
export default store;

// export interface RootState {

//   jobState:JobState;

// }

export type RootState = ReturnType<typeof rootReducer>;
// export default rootReducer;
