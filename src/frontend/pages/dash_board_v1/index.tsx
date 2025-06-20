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
import { ProjectsCard } from "./projects";
import { AlertsCard } from "./alerts";
import { AIChatComponent } from "./aiChat";
import { CalendarCard } from "./calendar";

// Main Dashboard Component

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
  const [events, setEvents] = useState([
    { title: "Client Meeting - TechCorp", time: "Tomorrow, 2:00 PM" },
    { title: "Code Review Session", time: "Wednesday, 10:00 AM" },
    { title: "Project Demo", time: "Friday, 4:00 PM" },
  ]);
  const [projects, setProjects] = useState([
    { name: "Backend Auditing for ODOC", progress: 40, color: "#4caf50" },
    { name: "Backend Unit Testing", progress: 60, color: "#ff9800" },
    { name: "Automated Testing with AI", progress: 0, color: "#f44336" },
  ]);

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
      events: [...events],
      projects: [...projects],
    };

    setTimeout(() => {
      setIsLoading(false);

      const lowerMessage = message.toLowerCase();
      let aiResponse = "";
      let actionType = "";
      let newState = { ...currentState };

      // Command 1: Hide/stop job search
      if (
        lowerMessage.includes("stop") &&
        (lowerMessage.includes("search") || lowerMessage.includes("job"))
      ) {
        aiResponse = "Okay I stopped the search for a developer";
        actionType = "hideJobs";
        newState.showJobMatch = false;
        setShowJobMatch(false);
      }
      // Command 2: Add new event with David
      else if (
        lowerMessage.includes("add") &&
        lowerMessage.includes("event") &&
        lowerMessage.includes("david")
      ) {
        const newEvent = {
          title: "Meeting with David",
          time: "June 15, 9:00 AM",
        };
        aiResponse = "Added a new event with David for June 15 at 9:00 AM";
        actionType = "addEvent";
        newState.events = [...newState.events, newEvent];
        setEvents((prev) => [...prev, newEvent]);
      }
      // Command 3: Remove Automated Testing project
      else if (
        lowerMessage.includes("remove") &&
        lowerMessage.includes("automated testing")
      ) {
        aiResponse =
          'Removed the "Automated Testing with AI" project from your dashboard';
        actionType = "removeProject";
        newState.projects = newState.projects.filter(
          (project) =>
            !project.name.toLowerCase().includes("automated testing"),
        );
        setProjects((prev) =>
          prev.filter(
            (project) =>
              !project.name.toLowerCase().includes("automated testing"),
          ),
        );
      }
      // Default response for unrecognized commands
      else {
        aiResponse =
          "I can help you with:\n• Stopping job searches\n• Adding events with people\n• Removing projects\nWhat would you like me to do?";
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
    setEvents(action.beforeState.events);
    setProjects(action.beforeState.projects);

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
    setEvents(action.afterState.events);
    setProjects(action.afterState.projects);

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
          events={events}
          isHovered={hoveredCard === "events"}
          isExpanded={expandedCard === "events"}
          onMouseEnter={() => handleCardHover("events", true)}
          onMouseLeave={() => handleCardHover("events", false)}
          onClick={() => handleCardClick("events")}
        />
        <ProjectsCard
          projects={projects}
          isHovered={hoveredCard === "projects"}
          isExpanded={expandedCard === "projects"}
          onMouseEnter={() => handleCardHover("projects", true)}
          onMouseLeave={() => handleCardHover("projects", false)}
          onClick={() => handleCardClick("projects")}
        />
        <AlertsCard
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
        />
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
