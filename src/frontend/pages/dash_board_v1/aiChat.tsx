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
import { CalendarCard } from "./calendar";

// AI Chat Component
export const AIChatComponent = ({
  isExpanded,
  onToggle,
  chatHistory,
  onSendMessage,
  isLoading,
  onUndoMessage,
  onRedoMessage,
}) => {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (!message.trim()) return;
    onSendMessage(message);
    setMessage("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  const cardStyle = {

    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "16px",
    transition: "all 0.3s ease",
    "&:hover": {
      boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
      border: "1px solid rgba(255,255,255,0.2)",
    },
  };

  return (
    <Card
      sx={{
        ...cardStyle,
        position: "fixed",
        bottom: 20,
        right: 20,
        width: isExpanded ? 400 : 60,
        height: isExpanded ? 300 : 60,
        zIndex: 1000,
      }}
    >
      <CardContent sx={{ p: 1, height: "100%" }}>
        {!isExpanded ? (
          <IconButton onClick={onToggle} sx={{ color: "#00d4ff" }}>
            <Chat />
          </IconButton>
        ) : (
          <Box
            sx={{ height: "100%", display: "flex", flexDirection: "column" }}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Typography
                variant="h6"
                sx={{ fontSize: "1rem" }}
              >
                AI Assistant
              </Typography>
              <IconButton
                size="small"
                onClick={onToggle}
                sx={{ color: "rgba(255,255,255,0.6)" }}
              >
                ×
              </IconButton>
            </Box>

            <Box sx={{ flex: 1, overflowY: "auto", mb: 2 }}>
              {chatHistory.map((msg, idx) => (
                <Box key={idx} mb={1}>
                  <Typography
                    variant="body2"
                    sx={{
                      textAlign: msg.type === "user" ? "right" : "left",
                    }}
                  >
                    {msg.message}
                  </Typography>
                  {msg.type === "ai" && (msg.canUndo || msg.canRedo) && (
                    <Box display="flex" gap={1} mt={1}>
                      <Button
                        size="small"
                        startIcon={<Refresh fontSize="small" />}
                        sx={{ color: "#00d4ff", minWidth: "auto", p: 0.5 }}
                      >
                        Retry
                      </Button>
                      {msg.canUndo && (
                        <Button
                          size="small"
                          startIcon={<Undo fontSize="small" />}
                          onClick={() => onUndoMessage(msg.id)}
                          sx={{ color: "#ff9800", minWidth: "auto", p: 0.5 }}
                        >
                          Undo
                        </Button>
                      )}
                      {msg.canRedo && (
                        <Button
                          size="small"
                          startIcon={<Redo fontSize="small" />}
                          onClick={() => onRedoMessage(msg.id)}
                          sx={{ color: "#f44336", minWidth: "auto", p: 0.5 }}
                        >
                          Redo
                        </Button>
                      )}
                    </Box>
                  )}
                </Box>
              ))}
              {isLoading && (
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(255,255,255,0.6)" }}
                >
                  Loading...
                </Typography>
              )}
            </Box>

            <Box display="flex" gap={1}>
              <TextField
                size="small"
                fullWidth
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "rgba(255,255,255,0.3)" },
                    "&:hover fieldset": {
                      borderColor: "rgba(255,255,255,0.5)",
                    },
                  },
                }}
              />
              <IconButton onClick={handleSend} >
                <Send />
              </IconButton>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
