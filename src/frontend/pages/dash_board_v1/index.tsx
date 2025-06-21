import React, { useState } from "react";
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

// Main Dashboard Component
const Dashboard = () => {
  const [expandedCard, setExpandedCard] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [chatExpanded, setChatExpanded] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [messageCounter, setMessageCounter] = useState(0);

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

  const handleChatSend = async (message) => {
    const messageId = messageCounter + 1;
    setMessageCounter(messageId);

    setChatHistory((prev) => [
      ...prev,
      { type: "user", message, id: messageId },
    ]);
    setIsLoading(true);

    // Save current state before making changes
    const currentState = {
      showJobMatch,
    };

    setTimeout(() => {
      setIsLoading(false);

      const lowerMessage = message.toLowerCase();
      let aiResponse = "";
      let actionType = "";
      let newState = { ...currentState };

      // Command: Hide/stop job search
      if (
        lowerMessage.includes("stop") &&
        (lowerMessage.includes("search") || lowerMessage.includes("job"))
      ) {
        aiResponse = "Okay I stopped the search for a developer";
        actionType = "hideJobs";
        newState.showJobMatch = false;
        setShowJobMatch(false);
      }
      // Default response for unrecognized commands
      else {
        aiResponse =
          "I can help you with:\n• Stopping job searches\nWhat would you like me to do?";
        actionType = "info";
      }

      // Store the action history for this specific message
      if (actionType !== "info") {
        setActionHistory((prev) => ({
          ...prev,
          [messageId]: {
            beforeState: currentState,
            afterState: newState,
            actionType,
            isUndone: false,
          },
        }));
      }

      // Add AI response with undo/redo capabilities
      setChatHistory((prev) => [
        ...prev,
        {
          type: "ai",
          message: aiResponse,
          id: messageId,
          canUndo: actionType !== "info",
          canRedo: false,
        },
      ]);
    }, 1000);
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
        {/* <AlertsCard
          alerts={[
            {
              title: "Payment Dispute - Project Alpha",
              description: "Client disputed milestone payment",
            },
          ]}
          isHovered={hoveredCard === "alerts"}
          isExpanded={expandedCard === "alerts"}
          onMouseEnter={() => handleCardHover("alerts", true)}
          onMouseLeave={() => handleCardHover("alerts", false)}
          onClick={() => handleCardClick("alerts")}
        /> */}
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
      />
    </Box>
  );
};

export default Dashboard;
