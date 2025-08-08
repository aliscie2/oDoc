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

    if (import.meta.env.VITE_DFX_NETWORK === "local") {
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
      ${PROMPTS.JOB}
      User Input: ${message.trim()},
      Current Job Data: ${JSON.stringify(currentJobRef.current)}
    `;
    let parsedJob = {};

    if (import.meta.env.VITE_DFX_NETWORK === "local") {
      parsedJob = mockJobAIResponse(
        currentJobRef.current,
        jobs,
        message.split("//")[1],
        message.split("//")[0],
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
      action_type: "JOB",
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
      feedback: parsed.feedback || "No feedback",
      actions: [],
      done: true,
    };
  };

  const processMessage = async (message, messageId, isQuick = true) => {
    const compact_message =
      message.length > 2000
        ? compactMessage(
            message +
              `current topic ${location.pathname == "/" ? "Job" : location.pathname}`,
          )
        : message;

    try {
      let parsed = {};
      if (import.meta.env.VITE_DFX_NETWORK === "local") {
        console.log({ x: compact_message.split("//") });
        if (compact_message.split("//").length > 1) {
          const type = compact_message.split("//")[0].toUpperCase();
          parsed = { type: type == "TALENT" ? "JOB" : type };
        } else {
          parsed = {
            feedback:
              "Locally you can make commands like:\n- Calendar commands: `calendar//aa>title>09:00>17:00>1,2,3,4,5>false` to (add availability - Mon-Fri, not blocked)\n- Job commands: `Job//as>skill1,skill2` (add skills)\n`Job//us>skill1,skill2` (update skills)\n`Job//ds>skill1` (remove skills)\n`Job//ud>description` (update description)\n`Job//ae>email@example.com` (add email)\n`Job//ue>email@example.com` (update emails)\n`Job//ac>contact` (add contact)\n`Job//ucon>contact` (update contacts)\n`Job//ax>experience` (add experience)\n`Job//ux>experience` (update experience)\n`Job//aj>job title` (add job titles)\n`Job//uj>job title` (update job titles)\n`Job//acer>certification` (add certifications)\n`Job//uc>certification` (update certifications)\n`Job//pl>level` (set proficiency level)\n`Job//ct>Job|Talent` (change category)",
          };
        }
      } else {
        const classifyMessageRes = await aiAgent.sendMessage(`
        ${PROMPTS.CLASSIFY}
        Message:${compact_message}
        `);
        parsed = textToJson(classifyMessageRes).extractedData;
      }

      if (!parsed.type) {
        return {
          action_type: "OTHER",
          feedback: parsed.feedback || "Unable to process request",
          actions: [],
          done: true,
        };
      }

      if (parsed.type === "JOB" && location.pathname !== "/") {
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
        case "JOB":
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
