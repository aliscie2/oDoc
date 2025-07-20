import { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { textToJson } from "../discover/jobs/utils/processResponseJobs";
import PROMPTS from "../discover/jobs/utils/prompts";
import { ActionProcessor, CalendarFormatter, TimeFormatter } from "./gemeniAi";

import compactMessage from "../discover/jobs/utils/compactMessage";
import { mockJobAIResponse } from "../discover/jobs/utils/mockJobAIRes";
import { useLocation, useNavigate } from "react-router-dom";
import { mockCalendarAIResponse } from "../discover/jobs/utils/mockCalendarAIRes";

export const useChatHandler = () => {
  const { calendar } = useSelector((state: any) => state.calendarState);
  const navigate = useNavigate();
  const location = useLocation();

  const dispatch = useDispatch();
  const [messageResponses, setMessageResponses] = useState({});

  const { aiAgent } = useSelector((state) => state.AIState);
  const { isChanged, currentJobId, jobs, matchingJobs } = useSelector(
    (state) => state.jobState,
  );

  const currentJobRef = useRef();
  currentJobRef.current = jobs.find((job) => job.id === currentJobId);

  const handleCalendarCase = async (message, parsed, isQuick) => {
    const now = Date.now() * 1e6;
    const prompt = `
      ${PROMPTS.CALENDAR}
      Current time: ${TimeFormatter.formatTime(now)} ${TimeFormatter.formatDate(now)}
      
      Current Calendar: ${CalendarFormatter.formatCalendarForPrompt(calendar)}
      
      User input: ${message}
    `;
    let eventRes = [];

    if (import.meta.env.VITE_DFX_NETWORK !== "ic") {
      eventRes = mockCalendarAIResponse(calendar, message.split("//")[1]);
    } else {
      const calendarRes = await aiAgent.sendMessage(prompt);
      eventRes = textToJson(calendarRes).extractedData;
    }

    eventRes?.forEach((action) => {
      if (action.data.type !== "CALENDAR_QUERY") {
        const parsedActions = ActionProcessor.processAction(action.data);
        dispatch(parsedActions);
      }
    });

    // Store the responses for later use
    // const responses = {
    //   parsed,
    //   actions: eventRes,
    // };
    // console.log({ eventRes, x: eventRes.map((e) => e.feedback).join(" ") });
    return {
      action_type: "CALENDAR",
      feedback:
        eventRes.map((e) => e.feedback).join(" ") ||
        "Calendar action completed",
      actions: eventRes?.map((e) => e.data) || [],
      done: true,
    };
  };

  const handleJobsCase = async (message, parsed, isQuick) => {
    const prompt = `
      ${PROMPTS.JOBS}
      User Input: ${message.trim()},
      Current Job Data: ${JSON.stringify(currentJobRef.current)}
    `;
    let parsedJob = {};

    if (import.meta.env.VITE_DFX_NETWORK !== "ic") {
      parsedJob = mockJobAIResponse(
        currentJobRef.current,
        jobs,
        message.split("//")[1],
      );
    } else {
      const jobRes = await aiAgent.sendMessage(prompt, false);
      parsedJob = textToJson(jobRes).extractedData;
    }
  
    if (parsedJob.done) {
      dispatch({ type: "IS_PROFILE_COMPELETE" });
    }
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
    if (parsedJob.type !== "JOBS_QUERY") {
      dispatch({
        type: "UPDATE_FIELDS",
        updates: parsedJob.updates,
        category: parsedJob.category,
        required_match_score: parsedJob.required_match_score,
      });
    }

    return {
      action_type: "JOBS",
      feedback: parsedJob.feedback,
      actions: parsedJob.updates || [],
      done: parsedJob.done || false,
    };
  };

  const handleQuestionsCase = async (message, parsed, isQuick) => {
    return {
      action_type: "QUESTIONS",
      feedback: "Questions functionality with RAG will be implemented soon",
      actions: [],
      done: true,
    };
  };

  const handleOtherCase = async (message, parsed, isQuick) => {
    return {
      action_type: "OTHER",
      feedback: parsed.feedback || "Task completed",
      actions: [],
      done: true,
    };
  };

  const processMessage = async (message, messageId, isQuick = true) => {
    const compact_message =
      message.length > 2000 ? compactMessage(message) : message;

    try {
      let parsed = {}
      if (import.meta.env.VITE_DFX_NETWORK !== "ic") {

        const classifyMessageRes = await aiAgent.sendMessage(`
        ${PROMPTS.CLASSIFY}
        Message:${compact_message}
        `);
          parsed = textToJson(classifyMessageRes).extractedData;
      } else {
          parsed = { type: "JOBS" };
      }

      
      

      if (!parsed.type) {
        return {
          action_type: "OTHER",
          feedback: parsed.feedback || "Unable to process request",
          actions: [],
          done: true,
        };
      }

      if (parsed.type === "JOBS" && location.pathname !== "/") {
        navigate("/");
      }
      if (parsed.type === "CALENDAR" && location.pathname !== "/calendar") {
        navigate("/calendar");
      }

      let result;

      switch (parsed.type) {
        case "CALENDAR":
          result = await handleCalendarCase(compact_message, parsed, isQuick);
          break;
        case "JOBS":
          result = await handleJobsCase(compact_message, parsed, isQuick);
          break;
        case "QUESTIONS":
          result = await handleQuestionsCase(compact_message, parsed, isQuick);
          break;
        default:
          result = await handleOtherCase(compact_message, parsed, isQuick);
          break;
      }

      // Store responses for retry/undo functionality
      setMessageResponses((prev) => ({
        ...prev,
        [messageId]: {
          parsed,
          result,
        },
      }));

      return result;
    } catch (error) {
      console.error("Error processing message:", error);
      throw error;
    }
  };

  return {
    processMessage,
    messageResponses,
  };
};
