import { buildContractPrompt } from "./buildContractPrompt";
import { BUILD_JOB_PROMPT } from "./buildProfilePrompt";
import CALENDAR_PROMPT from "./calendar_prompt";
import { CLASSSIFER_PRPT } from "./mainChatProblm";

const PROMPTS = {
  CLASSIFY: CLASSSIFER_PRPT,
  CALENDAR: CALENDAR_PROMPT,
  JOB: BUILD_JOB_PROMPT,
  CONTRACT: buildContractPrompt,
};
export default PROMPTS;
