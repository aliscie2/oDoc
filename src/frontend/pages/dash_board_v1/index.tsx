import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  IconButton,
  TextField,
  Button,
  Avatar,
  Divider,
  Collapse,
  Fade,
} from "@mui/material";
import {
  Search,
  Event,
  Folder,
  Warning,
  Chat,
  Send,
  Refresh,
  Undo,
  Redo,
  Person,
} from "@mui/icons-material";
import { JobMatchesCard } from "./jobs";
import { PostsCard } from "./postsCard";
import { AlertsCard } from "./alerts";
import { AIChatComponent } from "./aiChat";
import { CalendarCard } from "./calendar";
import AchievementCard from "@/components/userBadges";
import { useDispatch, useSelector } from "react-redux";
import PROMPTS from "../discover/jobs/utils/prompts";
import { textToJson } from "../discover/jobs/utils/processResponseJobs";
import { Job } from "$/declarations/backend/backend.did";
import { useChatHandler } from "./useChathandler";

// let parsedJob = {    "required_match_score": 7,    "feedback": "Thank you for sharing your skills! To help us find the best opportunities for you, please provide your contact email, your preferred hourly/monthly/yearly rate, and details about your education, work experience, and any certifications you hold. Given your expertise with Django, are you also proficient in Python?",    "updates": [      {        "field": "skills",        "values": [          "rust",          "icp",          "dfx",          "django"        ]      },      {        "field": "job_titles",        "values": [          "Software Developer",          "Backend Developer",          "Blockchain Developer",          "Web Developer"        ]      }    ],    "category": "Talent",    "done": false,    "isBreakingChanges": true  }
// let parsedJob2 = {    "required_match_score": 7,    "feedback": "Great! Could you please specify the name of the Google certificate (e.g., Google IT Support Professional Certificate, Google Project Management Certificate)? Also, remember to provide your contact email, your preferred hourly/monthly/yearly rate, and details about your education and work experience to complete your profile.",    "updates": [      {        "field": "certifications",        "values": [          "Google certificate"        ]      },      {        "field": "job_titles",        "values": [          "Software Developer",          "Backend Developer",          "Blockchain Developer",          "Web Developer"        ]      }    ],    "category": "Talent",    "done": false,    "isBreakingChanges": true  };
// let parsedJob3 = {    "required_match_score": 7,    "feedback": "Understood, ICP has been removed from your skills. Please remember to provide your contact email, your preferred hourly/monthly/yearly rate, and details about your education and work experience to ensure your profile is complete and we can connect you with relevant opportunities.",    "updates": [      {        "field": "skills",        "values": [          "rust",          "dfx",          "django"        ]      },      {        "field": "job_titles",        "values": [          "Software Developer",          "Backend Developer",          "Blockchain Developer",          "Web Developer"        ]      }    ],    "category": "Talent",    "done": false,    "isBreakingChanges": true  }

const Dashboard = () => {
  const dispatch = useDispatch();
  const [expandedCard, setExpandedCard] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [chatExpanded, setChatExpanded] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [messageCounter, setMessageCounter] = useState(0);

  const { processMessage, handleRetry, handleUndo, handleRedo } =
    useChatHandler();
  const { isChanged, currentJobId, jobs, matchingJobs } = useSelector(
    (state: any) => state.jobState,
  );

  const currentJobRef = useRef<Job | undefined>(undefined);

  useEffect(() => {
    currentJobRef.current = jobs.find((job: Job) => job.id === currentJobId);
  }, [currentJobId, jobs]);

  const { geminiAgent } = useSelector((state) => state.AIState);

  // State for different dashboard components
  const [showJobMatch, setShowJobMatch] = useState(true);

  // Store action history for each message
  const [actionHistory, setActionHistory] = useState({});

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
      { type: "user", message, id: messageId },
    ]);

    setIsLoading(true);

    try {
      // Save current state before making changes
      const currentState = {
        showJobMatch,
      };

      // Process the message using the hook
      const result = await processMessage(message, messageId, isQuick);

      // Handle hover effects based on type
      if (result.responses.parsed.type === "CALENDAR") {
        setHoveredCard("events");
      } else if (result.responses.parsed.type === "JOBS") {
        setHoveredCard("job");
      }

      let newState = { ...currentState };

      // Apply any state changes based on parsed response
      if (result.action) {
        if (result.action.type === "hideJobs") {
          newState.showJobMatch = false;
          setShowJobMatch(false);
        }
      }

      // Store the action history for this specific message
      if (result.action) {
        setActionHistory((prev) => ({
          ...prev,
          [messageId]: {
            beforeState: currentState,
            afterState: newState,
            actionType: result.action.type,
            isUndone: false,
            undoAction: { type: "test 1" },
            redoAction: { type: "test reDo" },
          },
        }));
      }

      // Determine button visibility based on parsed.feedback
      // Determine button visibility based on parsed.feedback
      const hasRealFeedback =
        result.responses.parsed.feedback &&
        !result.responses.parsed.feedback.includes("will be implemented soon");

      // Check if there's a real action (not empty or undefined)
      const hasAction = result.action && Object.keys(result.action).length > 0;

      // Add AI response with undo/redo capabilities
      setChatHistory((prev) => [
        ...prev,
        {
          type: "ai",
          message: result.feedback,
          id: messageId,
          canUndo: hasRealFeedback && hasAction,
          canRedo: false,
          canRetry: !hasRealFeedback,
        },
      ]);

      // Add AI response with undo/redo capabilities
      setChatHistory((prev) => [
        ...prev,
        {
          type: "ai",
          message: result.feedback,
          id: messageId,
          canUndo: hasRealFeedback && !!result.action,
          canRedo: false,
          canRetry: !hasRealFeedback, // Show retry only for placeholder responses
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
    const action = actionHistory[messageId];
    if (!action || action.isUndone) return;

    // Restore the before state
    setShowJobMatch(action.beforeState.showJobMatch);

    // Update action history
    setActionHistory((prev) => ({
      ...prev,
      [messageId]: { ...action, isUndone: true },
    }));

    // Update chat history to show redo instead of undo
    setChatHistory((prev) =>
      prev.map((msg) =>
        msg.id === messageId && msg.type === "ai"
          ? { ...msg, canUndo: false, canRedo: true }
          : msg,
      ),
    );
  };

  const handleRedoMessage = (messageId) => {
    const action = actionHistory[messageId];
    if (!action || !action.isUndone) return;

    // Restore the after state
    setShowJobMatch(action.afterState.showJobMatch);

    // Update action history
    setActionHistory((prev) => ({
      ...prev,
      [messageId]: { ...action, isUndone: false },
    }));

    // Update chat history to show undo instead of redo
    setChatHistory((prev) =>
      prev.map((msg) =>
        msg.id === messageId && msg.type === "ai"
          ? { ...msg, canUndo: true, canRedo: false }
          : msg,
      ),
    );
  };

  const handleRetryMessage = (messageId) => {
    console.log({ messageId, chatHistory });
    // const originalMessage = chatHistory.find(
    //   (msg) => msg.id === messageId - 1 && msg.type === "user"
    // );
    // if (originalMessage) {
    //   handleChatSend(originalMessage.message, false);
    // }
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
        <PostsCard
          isHovered={hoveredCard === "PostsCard"}
          isExpanded={expandedCard === "PostsCard"}
          onMouseEnter={() => handleCardHover("PostsCard", true)}
          onMouseLeave={() => handleCardHover("PostsCard", false)}
          onClick={() => handleCardClick("PostsCard")}
        />
        <AchievementCard />
      </Box>

      <AIChatComponent
        isExpanded={chatExpanded}
        onToggle={toggleChat}
        chatHistory={chatHistory}
        onSendMessage={handleChatSend}
        isLoading={isLoading}
        onUndoMessage={handleUndoMessage}
        onRedoMessage={handleRedoMessage}
        onRetryMessage={handleRetryMessage}
      />
    </Box>
  );
};

export default Dashboard;
