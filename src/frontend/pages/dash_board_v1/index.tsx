import React, { useEffect, useRef, useState } from "react";
import { Box } from "@mui/material";
import { JobMatchesCard } from "./jobs";
import { AIChatComponent } from "./aiChat";
import { CalendarCard } from "./calendar";
import { useDispatch, useSelector } from "react-redux";
import { Job } from "$/declarations/backend/backend.did";
import { useChatHandler } from "./useChathandler";
import { undoCalendarAction, undoJobAction } from "./reverseAction";

const Dashboard = () => {
  const dispatch = useDispatch();
  const [expandedCard, setExpandedCard] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [chatExpanded, setChatExpanded] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [messageCounter, setMessageCounter] = useState(0);

  const { calendar } = useSelector((state: any) => state.calendarState);
  const { currentJobId, jobs } = useSelector((state: any) => state.jobState);
  const currentJob = jobs.find((job: Job) => job.id === currentJobId);

  const { processMessage } = useChatHandler();

  const currentJobRef = useRef<Job | undefined>(undefined);

  useEffect(() => {
    currentJobRef.current = jobs.find((job: Job) => job.id === currentJobId);
  }, [currentJobId, jobs]);

  const { aiAgent } = useSelector((state) => state.AIState);

  // State for different dashboard components
  const [showJobMatch, setShowJobMatch] = useState(true);

  // Store action history for each message
  // const [actionHistory, setActionHistory] = useState({});

  const handleCardClick = (cardId) => {
    setExpandedCard(expandedCard === cardId ? null : cardId);
  };

  const handleCardHover = (cardId, isEntering) => {
    setHoveredCard(isEntering ? cardId : null);
  };

  const handleChatSend = async (message, isQuick = true) => {
    const messageId = messageCounter + 1;
    setMessageCounter(messageId);

    setChatHistory((prev) => [
      ...prev,
      {
        type: "user",
        message: message,
        id: messageId + "user",
      },
    ]);

    setIsLoading(true);

    try {
      // Save current state before making changes
      const currentState = {
        showJobMatch,
        // Add other relevant state properties here
      };

      // Process the message using the hook
      const perv_cal = calendar;
      const prev_job = currentJob;
      const result = await processMessage(message, messageId, isQuick);

      // Handle hover effects based on action_type
      if (result.action_type === "CALENDAR") {
        setHoveredCard("events");
      } else if (result.action_type === "JOBS") {
        setHoveredCard("job");
      }

      // Apply any state changes based on result
      const newState = { ...currentState };
      let hasStateChanges = false;

      // Example state changes based on action_type or actions
      if (result.action_type === "JOBS" && result.actions.length > 0) {
        // Example: if hiding jobs is one of the actions
        const hideJobsAction = result.actions.find(
          (action) =>
            action.field === "visibility" && action.value === "hidden",
        );
        if (hideJobsAction) {
          newState.showJobMatch = false;
          setShowJobMatch(false);
          hasStateChanges = true;
        }
      }

      // Store the action history for this specific message only if there are state changes
      if (hasStateChanges || result.actions.length > 0) {
        // setActionHistory((prev) => ({
        //   ...prev,
        //   [messageId]: {
        //     beforeState: currentState,
        //     afterState: newState,
        //     actionType: result.action_type,
        //     actions: result.actions,
        //     isUndone: false,
        //     canUndo: result.actions.length > 0, // Can undo if there are actions
        //   },
        // }));
      }

      // Determine button visibility
      // const hasRealFeedback =
      //   result.feedback &&
      //   !result.feedback.includes("will be implemented soon");

      // Check if there are real actions
      const hasActions = result.actions && result.actions.length > 0;

      // Add AI response
      setChatHistory((prev) => [
        ...prev,
        {
          type: "ai",
          action_type: result.action_type,
          actions: result.actions,
          message: result.feedback,
          id: messageId,
          canUndo: hasActions,
          canRedo: false,
          canRetry: hasActions, // Show retry only for placeholder responses
          done: result.done,
          curr_cal: result.action_type == "JOBS" ? null : calendar, // Will be updated after action
          curr_job: result.action_type == "JOBS" ? currentJob : null, // Will be updated after action
          prev_job: result.action_type == "JOBS" ? prev_job : null,
          perv_cal: result.action_type == "JOBS" ? null : perv_cal,
        },
      ]);
    } catch (error) {
      // Handle errors
      setChatHistory((prev) => [
        ...prev,
        {
          type: "ai",
          message: error.message || "An error occurred",
          id: messageId,
          canUndo: false,
          canRedo: false,
          canRetry: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUndoMessage = (messageId) => {
    const message = chatHistory.find((m) => m.id == messageId);
    if (!message) return;

    if (message.action_type === "CALENDAR") {
      const undoAction = undoCalendarAction(message);
      undoAction.forEach((action) => {
        dispatch(action);
      });
    } else if (message.action_type === "JOBS") {
      const undoAction = undoJobAction(message);
      dispatch(undoAction);
    }

    // // Update chat history to show redo instead of undo
    setChatHistory((prev) =>
      prev.map((msg) =>
        msg.id === messageId && msg.type === "ai"
          ? { ...msg, canUndo: false, canRedo: true }
          : msg,
      ),
    );
  };

  const handleRedoMessage = (messageId) => {
    const message = chatHistory.find((m) => m.id == messageId);
    if (!message) return;

    if (message.action_type === "CALENDAR") {
      message.actions.forEach((action) => {
        dispatch(action);
      });
    } else if (message.action_type === "JOBS") {
      const category = Object.keys(
        message.prev_job.category || message.curr_job.category,
      )[0];
      dispatch({
        type: "UPDATE_FIELDS",
        updates: message.actions,
        category,
        required_match_score:
          message.prev_job.required_match_score ||
          message.curr_job.required_match_score,
      });
    }

    // // Update chat history to show undo instead of redo
    setChatHistory((prev) =>
      prev.map((msg) =>
        msg.id === messageId && msg.type === "ai"
          ? { ...msg, canUndo: true, canRedo: false }
          : msg,
      ),
    );
  };

  const toggleChat = () => {
    setChatExpanded(!chatExpanded);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        p: 3,
      }}
    >
      <Box
        display="grid"
        gridTemplateColumns="repeat(auto-fit, minmax(300px, 1fr))"
        gap={3}
        mb={4}
      >
        <JobMatchesCard
          matches={[
            {
              name: "Senior React Developer",
              rate: "$85/hr",
              color: "#00d4ff",
            },
            { name: "Full Stack Engineer", rate: "$75/hr", color: "#ff6b6b" },
          ]}
          isHovered={hoveredCard === "job"}
          isExpanded={expandedCard === "job"}
          onMouseEnter={() => handleCardHover("job", true)}
          onMouseLeave={() => handleCardHover("job", false)}
          onClick={() => handleCardClick("job")}
          isVisible={showJobMatch}
        />
        <CalendarCard
          isHovered={hoveredCard === "events"}
          isExpanded={expandedCard === "events"}
          onMouseEnter={() => handleCardHover("events", true)}
          onMouseLeave={() => handleCardHover("events", false)}
          onClick={() => handleCardClick("events")}
        />
        {/* <PostsCard
          isHovered={hoveredCard === "PostsCard"}
          isExpanded={expandedCard === "PostsCard"}
          onMouseEnter={() => handleCardHover("PostsCard", true)}
          onMouseLeave={() => handleCardHover("PostsCard", false)}
          onClick={() => handleCardClick("PostsCard")}
        /> */}
        {/* <AchievementCard /> */}
      </Box>

      <AIChatComponent
        isExpanded={chatExpanded}
        onToggle={toggleChat}
        chatHistory={chatHistory}
        onSendMessage={handleChatSend}
        isLoading={isLoading}
        onUndoMessage={handleUndoMessage}
        onRedoMessage={handleRedoMessage}
      />
    </Box>
  );
};

export default Dashboard;
