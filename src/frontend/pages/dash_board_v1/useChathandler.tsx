import { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { textToJson } from "../discover/jobs/utils/processResponseJobs";
import PROMPTS from "../discover/jobs/utils/prompts";
import { ActionProcessor, CalendarFormatter, TimeFormatter } from "./gemeniAi";
import { logger } from "@/DevUtils/logData";
import DUUMY_CALENDAR_RES from "../discover/jobs/utils/dummyCalendarResponse";
import { classifyMessage } from "../discover/jobs/utils/mainChatProblm";
import compactMessage from "../discover/jobs/utils/compactMessage";

export const useChatHandler = () => {
  const { calendar } = useSelector((state: any) => state.calendarState);

  const dispatch = useDispatch();
  const [messageResponses, setMessageResponses] = useState({});

  const { aiAgent } = useSelector((state) => state.AIState);
  const { isChanged, currentJobId, jobs, matchingJobs } = useSelector(
    (state) => state.jobState,
  );

  const currentJobRef = useRef();
  currentJobRef.current = jobs.find((job) => job.id === currentJobId);

  const handleCalendarCase = async (message, parsed, isQuick) => {
    let now = Date.now() * 1e6;
    const prompt = `
      ${PROMPTS.CALENDAR}
      Current time: ${TimeFormatter.formatTime(now)} ${TimeFormatter.formatDate(now)}
      
      Current Calendar: ${CalendarFormatter.formatCalendarForPrompt(calendar)}
      
      User input: ${message}
    `;

    let calendarRes = await aiAgent.sendMessage(prompt);
    //     let calendarRes = `"[
    //   {
    //     "feedback": "ADD_EVENT Meeting on 02-07-2025 from 09:00 to 10:00",
    //     "data": {
    //       "type": "ADD_EVENT",
    //       "event": {
    //         "id": "evt_[TIMESTAMP]",
    //         "title": "Meeting",
    //         "date": "02-07-2025",
    //         "start_time": "09:00",
    //         "end_time": "10:15", // Added 15 minutes as per rule
    //         "description": "",
    //         "attendees": [],
    //         "recurrence": []
    //       }
    //     }
    //   }
    // ]"`

    const eventRes = textToJson(calendarRes).extractedData;

    eventRes?.forEach((action) => {
      if (action.data.type !== "CALENDAR_QUERY") {
        let parsedActions = ActionProcessor.processAction(action.data);
        dispatch(parsedActions);
      }
    });

    // Store the responses for later use
    // const responses = {
    //   parsed,
    //   actions: eventRes,
    // };

    return {
      action_type: "CALENDAR",
      // feedback: eventRes[0]?.feedback || "Calendar action completed",
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

    const jobRes = await aiAgent.sendMessage(prompt, false);

    // const jobRes =`{
    //     "required_match_score": 7.0,
    //     "feedback": "Thank you for your request. To refine your search, please provide additional details such as your hourly/monthly/yearly rate, preferred contact email, and any specific certifications or educational background you require. Additionally, if you have any experience with Python, please mention it as it is often associated with Django development.",
    //     "updates": [
    //       {
    //         "field": "job_titles",
    //         "values": ["Rust Developer", "ICP Developer", "Django Developer"]
    //       },
    //       {
    //         "field": "skills",
    //         "values": ["Rust", "ICP", "Django"]
    //       },
    //       {
    //         "field": "experience",
    //         "values": ["3 years of experience"]
    //       }
    //     ],
    //     "category": "Job",
    //     "done": false,
    //     "isBreakingChanges": false
    //   }`
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
    let compact_message =
      message.length > 2000 ? compactMessage(message) : message;

    try {
      let parsed = classifyMessage(compact_message);

      if (!parsed.type) {
        return {
          action_type: "OTHER",
          feedback: parsed.feedback || "Unable to process request",
          actions: [],
          done: true,
        };
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
