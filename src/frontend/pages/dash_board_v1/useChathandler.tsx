import { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { textToJson } from "../discover/jobs/utils/processResponseJobs";
import PROMPTS from "../discover/jobs/utils/prompts";
import { ActionProcessor, CalendarFormatter, TimeFormatter } from "./gemeniAi";
import { logger } from "@/DevUtils/logData";
import DUUMY_CALENDAR_RES from "../discover/jobs/utils/dummyCalendarResponse";

export const useChatHandler = () => {
  const { calendar } = useSelector((state: any) => state.calendarState);

  const dispatch = useDispatch();
  const [messageResponses, setMessageResponses] = useState({});

  const { geminiAgent } = useSelector((state) => state.AIState);
  console.log({ x: geminiAgent.remainingCredits() });
  const { isChanged, currentJobId, jobs, matchingJobs } = useSelector(
    (state) => state.jobState,
  );

  const currentJobRef = useRef();
  currentJobRef.current = jobs.find((job) => job.id === currentJobId);

  const handleCalendarCase = async (message, parsed, mainRes, isQuick) => {
    let now = Date.now() * 1e6;
    const prompt = `
      ${PROMPTS.CALENDAR}
      Current time: ${TimeFormatter.formatTime(now)} ${TimeFormatter.formatDate(now)}
      
      Current Calendar: ${CalendarFormatter.formatCalendarForPrompt(calendar)}
      
      User input: ${message}
    `;

    const calendarRes = await geminiAgent.sendMessage(prompt, false);

    const eventRes = textToJson(calendarRes).extractedData;
    // const  eventRes = DUUMY_CALENDAR_RES;

    // let actions = ActionProcessor.processAction(eventRes.data)
    // console.log({action})
    eventRes?.forEach((action) => {
      console.log({ action });
      let parsedActions = ActionProcessor.processAction(action.data);
      console.log({ parsedActions });
      dispatch(parsedActions);
    });
    // Store the responses for later use
    const responses = {
      parsed,
      mainRes,
      eventRes,
    };

    return {
      responses,
      feedback: eventRes[0].feedback,
      action: parsed.action,
    };
  };

  const handleJobsCase = async (message, parsed, mainRes, isQuick) => {
    const prompt = `
      ${PROMPTS.JOBS}
      User Input: ${message.trim()},
      Current Job Data: ${JSON.stringify(currentJobRef.current)}
    `;

    const jobRes = await geminiAgent.sendMessage(prompt, false);
    const parsedJob = textToJson(jobRes).extractedData;

    // Validation logic
    if (!currentJobId) {
      if (
        parsedJob.category == "Talent" &&
        jobs.some((j) => Object.keys(j.category)[0] === "Talent")
      ) {
        throw new Error("You can create only one talent profile");
      } else if (
        jobs.filter((j) => Object.keys(j.category)[0] === "Job").length >= 3
      ) {
        throw new Error("You can have max 3 job posts");
      }
    }

    if (!parsedJob || !parsedJob.updates) {
      console.error("Invalid response format:", parsedJob);
      throw new Error(
        "Something went wrong please try again. and report the issue on x.com/odoc_ic",
      );
    }

    // Dispatch updates

    dispatch({
      type: "UPDATE_FIELDS",
      updates: parsedJob.updates,
      category: parsedJob.category,
      required_match_score: parsedJob.required_match_score,
    });

    const responses = {
      parsed,
      mainRes,
      jobRes,
    };

    return {
      responses,
      feedback: parsedJob.feedback,
      action: parsed.action,
      done: parsedJob.done,
    };
  };

  const handleQuestionsCase = async (message, parsed, mainRes, isQuick) => {
    // Store the responses for later use
    const responses = {
      parsed,
      mainRes,
      quesRes: null, // Will be implemented later with RAG
    };

    return {
      responses,
      feedback: "Questions functionality with RAG will be implemented soon",
      action: parsed.action,
    };
  };

  const handleOtherCase = async (message, parsed, mainRes, isQuick) => {
    // Store the responses for later use
    const responses = {
      parsed,
      mainRes,
      otherRes: null, // Will be implemented later
    };

    return {
      responses,
      feedback: parsed.feedback || "Task completed",
      action: parsed.action,
    };
  };

  const processMessage = async (message, messageId, isQuick = true) => {
    try {
      const mainRes = await geminiAgent.sendMessage(
        `
        message: ${message.trim()},
        ${PROMPTS.MAIN}
      `,
        true,
      );
      // console.log({mainRes})
      const parsed = textToJson(mainRes).extractedData;
      let result;

      switch (parsed.type) {
        case "CALENDAR":
          result = await handleCalendarCase(message, parsed, mainRes, isQuick);
          break;
        case "JOBS":
          result = await handleJobsCase(message, parsed, mainRes, isQuick);
          break;
        case "QUESTIONS":
          result = await handleQuestionsCase(message, parsed, mainRes, isQuick);
          break;
        default: // 'Other'
          result = await handleOtherCase(message, parsed, mainRes, isQuick);
          break;
      }

      // Store all responses for this message
      setMessageResponses((prev) => ({
        ...prev,
        [messageId]: result.responses,
      }));

      return result;
    } catch (error) {
      console.error("Error processing message:", error);
      throw error;
    }
  };

  const handleRetry = (messageId) => {
    const responses = messageResponses[messageId];
    if (responses) {
      console.log("Retry:", {
        parsed: responses.parsed,
        res: responses.mainRes,
      });
    }
  };

  const handleUndo = (messageId) => {
    const responses = messageResponses[messageId];
    if (responses) {
      console.log("Undo:", {
        parsed: responses.parsed,
        res: responses.mainRes,
      });
    }
  };

  const handleRedo = (messageId) => {
    const responses = messageResponses[messageId];
    if (responses) {
      console.log("Redo:", {
        parsed: responses.parsed,
        res: responses.mainRes,
      });
    }
  };

  return {
    processMessage,
    handleRetry,
    handleUndo,
    handleRedo,
    messageResponses,
  };
};
