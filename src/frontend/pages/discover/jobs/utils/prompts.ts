import { BUILD_JOB_PROMPT } from "./buildProfilePrompt";
import CALENDAR_PROMPT from "./calendar_prompt";
import { MAIN_CHAT_PROMPT } from "./mainChatProblm";

const PROMPTS = {
  MAIN: MAIN_CHAT_PROMPT,
  CALENDAR: CALENDAR_PROMPT,
  JOBS: BUILD_JOB_PROMPT,
};
export default PROMPTS;
