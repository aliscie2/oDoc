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

import { useSelector } from "react-redux";
import MarkdownMessage from "./markDownMessageRdnder"; // Import the new component
import AICreditsComponent from "./AICreditsCompnent";
import RunawayJellyfish from "@/components/creature/runAeayJellyFish";

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
  const [isFirstTime, setIsFirstTime] = useState(
    !localStorage.getItem("aiChatUsed"),
  );
  const [welcomeText, setWelcomeText] = useState("");
  const fullWelcomeText =
    "Hello, are you looking for a job, or you want to post a job, describe with details what you looking for.";
  const inputRef = React.useRef(null);

  const handleSend = async () => {
    if (!message.trim()) return;
    if (isFirstTime) {
      localStorage.setItem("aiChatUsed", "true");
      setIsFirstTime(false);
    }
    onSendMessage(message);
    setMessage("");
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleRetry = (msgId) => {
    const msg = chatHistory.find((m) => m.id === msgId);
    if (!msg) return;
    const userMsgIndex = chatHistory.findIndex((m) => m.id === msgId) - 1;
    const userMsg = chatHistory[userMsgIndex];
    if (msg.canUndo) onUndoMessage(msgId);
    if (userMsg?.message) onSendMessage(userMsg.message);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e) => {
    setMessage(e.target.value);
  };

  const chatContainerRef = React.useRef(null);
  const { aiAgent } = useSelector((state: any) => state.AIState);

  React.useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  React.useEffect(() => {
    if (isFirstTime && isExpanded) {
      let index = 0;
      const interval = setInterval(() => {
        if (index < fullWelcomeText.length) {
          setWelcomeText(fullWelcomeText.slice(0, index + 1));
          index++;
        } else {
          clearInterval(interval);
        }
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isFirstTime, isExpanded]);

  React.useEffect(() => {
    if (isFirstTime && !isExpanded) {
      onToggle();
    }
  }, []);

  React.useEffect(() => {
    if (isExpanded && !isFirstTime) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isExpanded, isFirstTime]);

  const isFullscreen = isFirstTime && isExpanded;

  return (
    <Card
      sx={{
        position: "fixed",
        ...(isFullscreen
          ? { top: 0, left: 0, right: 0, bottom: 0 }
          : {
              bottom: { xs: 80, sm: 20 },
              right: { xs: 10, sm: 20 },
            }),
        width: !isExpanded
          ? 60
          : isFullscreen
            ? "100vw"
            : { xs: "calc(100vw - 20px)", sm: 500, md: 600 },
        height: !isExpanded
          ? 60
          : isFullscreen
            ? "100vh"
            : { xs: "50vh", sm: 400, md: 500 },
        zIndex: 1000,
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: isFullscreen ? 0 : "16px",
        transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
          border: "1px solid rgba(255,255,255,0.2)",
        },
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
            {isFullscreen ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                  flexDirection: "column",
                  gap: 4,
                }}
              >
                <Typography
                  variant="h4"
                  sx={{
                    textAlign: "center",
                    color: "#00d4ff",
                    fontWeight: "bold",
                  }}
                >
                  {welcomeText}
                  <span
                    style={{
                      opacity:
                        welcomeText.length < fullWelcomeText.length ? 1 : 0,
                    }}
                  >
                    |
                  </span>
                </Typography>
                <Box
                  display="flex"
                  gap={1}
                  alignItems="flex-end"
                  sx={{ width: "100%", maxWidth: 600 }}
                >
                  <TextField
                    ref={inputRef}
                    size="small"
                    fullWidth
                    value={message}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    autoFocus
                  />
                  <IconButton onClick={handleSend} sx={{ flexShrink: 0 }}>
                    <Send />
                  </IconButton>
                </Box>
              </Box>
            ) : (
              <>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={1}
                >
                  <Box display="flex" alignItems="center" gap={1}>
                    <AICreditsComponent credits={aiAgent.remainingCredits()} />
                    <Typography variant="h6" sx={{ fontSize: "1rem" }}>
                      AI Assistant
                    </Typography>
                  </Box>
                  <IconButton size="small" onClick={onToggle}>
                    ×
                  </IconButton>
                </Box>
                <RunawayJellyfish
                  die={aiAgent.remainingCredits() == 0}
                  thinking={isLoading}
                  runaway={true}
                />
                <Box
                  ref={chatContainerRef}
                  sx={{ flex: 1, overflowY: "auto", mb: 2 }}
                >
                  {chatHistory.map((msg, idx) => (
                    <Box key={idx} mb={1}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent:
                            msg.type === "user" ? "flex-end" : "flex-start",
                          mb: 1,
                        }}
                      >
                        <Box sx={{ maxWidth: "80%", textAlign: "left" }}>
                          <MarkdownMessage
                            message={msg.message}
                            isUser={msg.type === "user"}
                          />
                        </Box>
                      </Box>
                      {msg.type === "ai" &&
                        (msg.canUndo || msg.canRedo || msg.canRetry) && (
                          <Box
                            display="flex"
                            gap={1}
                            justifyContent="flex-start"
                            flexWrap="wrap"
                          >
                            {msg.canRetry && (
                              <Button
                                size="small"
                                startIcon={<Refresh fontSize="small" />}
                                onClick={() => handleRetry(msg.id)}
                                sx={{
                                  color: "#00d4ff",
                                  minWidth: "auto",
                                  p: 0.5,
                                  fontSize: "0.75rem",
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
                                  fontSize: "0.75rem",
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
                                  color: "#4caf50",
                                  minWidth: "auto",
                                  p: 0.5,
                                  fontSize: "0.75rem",
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
                <Box display="flex" gap={1} alignItems="flex-end">
                  <TextField
                    ref={inputRef}
                    disabled={isLoading}
                    size="small"
                    fullWidth
                    multiline
                    minRows={1}
                    maxRows={6}
                    value={message}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                  />
                  <IconButton
                    disabled={isLoading}
                    onClick={handleSend}
                    sx={{ flexShrink: 0 }}
                  >
                    <Send />
                  </IconButton>
                </Box>
              </>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
