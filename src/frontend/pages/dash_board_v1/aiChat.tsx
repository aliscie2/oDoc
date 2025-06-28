import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  TextField,
  Button,
} from "@mui/material";
import { Chat, Send, Refresh, Undo, Redo } from "@mui/icons-material";
import creature from '@/public/creature.gif';
import { useBackendContext } from "@/contexts/BackendContext";
import EmotionalAnimation from "@/components/creature";
import { JOB_MATCHING_PROMPT } from "../discover/jobs/utils/jobMatchingPrompt";
import { MAIN_CHAT_PROMPT } from "../discover/jobs/utils/mainChatProblm";
import { useSelector } from "react-redux";
import MarkdownMessage from "./MarkdownMessage"; // Import the new component
import { logger } from "@/DevUtils/logData";

export const AIChatComponent = ({
  isExpanded,
  onToggle,
  chatHistory,
  onSendMessage,
  isLoading,
  onUndoMessage,
  onRedoMessage,
  onRetryMessage,
}) => {
  logger({chatHistory})
  const [message, setMessage] = useState("");

  const handleSend = async () => {
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
        bottom: { xs: 10, sm: 20 },
        right: { xs: 10, sm: 20 },
        width: isExpanded ? { xs: "calc(100vw - 20px)", sm: 500, md: 600 } : 60,
        height: isExpanded ? { xs: "50vh", sm: 400, md: 500 } : 60,
        zIndex: 1000,
        maxWidth: isExpanded ? "90vw" : "auto",
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
              <Box display="flex" alignItems="center" gap={1}>
                <EmotionalAnimation type={isLoading ? "Loading" : "watch"} size={100} />
                <Typography variant="h6" sx={{ fontSize: "1rem" }}>
                  AI Assistant
                </Typography>
              </Box>
              <IconButton size="small" onClick={onToggle} sx={{}}>
                ×
              </IconButton>
            </Box>

            <Box sx={{ flex: 1, overflowY: "auto", mb: 2 }}>
              {chatHistory.map((msg, idx) => (
                <Box key={idx} mb={1}>
                  <MarkdownMessage 
                    message={msg.message} 
                    isUser={msg.type === "user"} 
                  />
                  {msg.type === "ai" && (msg.canUndo || msg.canRedo || msg.canRetry) && (
                    <Box display="flex" gap={1} mt={1} flexWrap="wrap">
                      {msg.canRetry && (
                        <Button
                          size="small"
                          startIcon={<Refresh fontSize="small" />}
                          onClick={() => onRetryMessage(msg.id)}
                          sx={{ 
                            color: "#00d4ff", 
                            minWidth: "auto", 
                            p: 0.5,
                            fontSize: { xs: "0.6rem", sm: "0.75rem" }
                          }}
                        >
                          Retry
                        </Button>
                      )}
                      {msg.canUndo && (
                        <Button
                          size="small"
                          startIcon={<Undo fontSize="small" />}
                          onClick={() => onUndoMessage(msg.id)}
                          sx={{ 
                            color: "#ff9800", 
                            minWidth: "auto", 
                            p: 0.5,
                            fontSize: { xs: "0.6rem", sm: "0.75rem" }
                          }}
                        >
                          Undo
                        </Button>
                      )}
                      {msg.canRedo && (
                        <Button
                          size="small"
                          startIcon={<Redo fontSize="small" />}
                          onClick={() => onRedoMessage(msg.id)}
                          sx={{ 
                            color: "#f44336", 
                            minWidth: "auto", 
                            p: 0.5,
                            fontSize: { xs: "0.6rem", sm: "0.75rem" }
                          }}
                        >
                          Redo
                        </Button>
                      )}
                    </Box>
                  )}
                </Box>
              ))}
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
              <IconButton onClick={handleSend}>
                <Send />
              </IconButton>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};