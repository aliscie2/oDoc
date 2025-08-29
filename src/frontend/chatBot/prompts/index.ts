import { buildContractPrompt } from "./contract";
import { BUILD_JOB_PROMPT } from "./job";
import CALENDAR_PROMPT from "./calendar";
import { CLASSSIFER_PRPT } from "./classify";

const PROMPTS = {
  CLASSIFY: CLASSSIFER_PRPT,
  CALENDAR: CALENDAR_PROMPT,
  JOB: BUILD_JOB_PROMPT,
  CONTRACT: buildContractPrompt,
};
export default PROMPTS;
