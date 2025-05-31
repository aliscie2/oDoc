import { combineReducers } from "redux";

import { uiReducer } from "./uiReducer";
import { filesReducer } from "./filesReducer";
import { chatsReducer } from "./chatsReducer";
import { notificationReducer } from "./notificationReducer";
import { calendarReducer } from "./calendarReducer";
import { jobReducer } from "./jobReducer";
import { AIReducer } from "./AIReducer";

const rootReducer = combineReducers({
  ui: uiReducer,
  files: filesReducer,
  chats: chatsReducer,
  notification: notificationReducer,
  calendar: calendarReducer,
  jobs: jobReducer,
  Ai: AIReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
