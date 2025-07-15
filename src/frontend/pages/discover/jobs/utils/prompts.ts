import { BUILD_JOB_PROMPT } from "./buildProfilePrompt";
import CALENDAR_PROMPT from "./calendar_prompt";
import { CLASSSIFER_PRPT } from "./mainChatProblm";

const PROMPTS = {
  CLASSIFY: CLASSSIFER_PRPT,
  CALENDAR: CALENDAR_PROMPT,
  JOBS: BUILD_JOB_PROMPT,
};
export default PROMPTS;
