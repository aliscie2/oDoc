import {
  Chat,
  CheckCircle,
  Close,
  PersonAdd,
  Send,
  Visibility,
  Star,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Fade,
  Grow,
  IconButton,
  Slide,
  TextField,
  Typography,
  Zoom,
  useTheme,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
const ProductTour = () => {
  const theme = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [chatExpanded, setChatExpanded] = useState(false);
  const [typingText, setTypingText] = useState("");
  const [showTyping, setShowTyping] = useState(false);
  const [messageHistory, setMessageHistory] = useState([]);
  const [showMatches, setShowMatches] = useState(false);
  const [showCursor, setShowCursor] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [showClick, setShowClick] = useState(false);
  const [showJobDetails, setShowJobDetails] = useState(false);
  const [connectClicked, setConnectClicked] = useState(false);
  const [showFinalPopup, setShowFinalPopup] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);
  const [sparkles, setSparkles] = useState([]);
  const [isMobile, setIsMobile] = useState(false);

  const containerRef = useRef(null);
  const timeoutRef = useRef(null);
  const typingIntervalRef = useRef(null);

  const messages = [
    "Looking for Rust/TypeScript roles in ICP",
    "Prefer startups, Asian timezones",
  ];

  const jobMatches = [
    {
      id: 1,
      title: "Senior Rust Developer",
      company: "Web3 Startup",
      score: 94,
      skills: ["Rust", "TypeScript", "ICP"],
    },
    {
      id: 2,
      title: "Full-Stack Developer",
      company: "Crypto Solutions",
      score: 90,
      skills: ["TypeScript", "React", "ICP"],
    },
  ];

  const steps = [
    { name: "showChat", duration: 1000 },
    { name: "expandChat", duration: 800 },
    { name: "startTyping1", duration: 300 },
    { name: "typeMessage1", duration: 2500 },
    { name: "sendMessage1", duration: 500 },
    { name: "wait1", duration: 1000 },
    { name: "startTyping2", duration: 300 },
    { name: "typeMessage2", duration: 2500 },
    { name: "sendMessage2", duration: 500 },
    { name: "wait2", duration: 1000 },
    { name: "hideChat", duration: 1000 },
    { name: "showMatches", duration: 1200 },
    { name: "showCursor", duration: 500 },
    { name: "moveCursorToView", duration: 1800 },
    { name: "clickView", duration: 800 },
    { name: "showDetails", duration: 1000 },
    { name: "moveCursorToClose", duration: 1500 },
    { name: "clickClose", duration: 800 },
    { name: "hideDetails", duration: 500 },
    { name: "moveCursorToConnect", duration: 1500 },
    { name: "clickConnect", duration: 800 },
    { name: "showConnectSuccess", duration: 2000 },
    { name: "showFinalPopup", duration: 3000 },
    { name: "reset", duration: 1000 },
  ];

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const getElementPosition = (selector) => {
    const element = containerRef.current?.querySelector(selector);
    if (!element || !containerRef.current) return { x: 0, y: 0 };

    const containerRect = containerRef.current.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();

    return {
      x: elementRect.left - containerRect.left + elementRect.width / 2,
      y: elementRect.top - containerRect.top + elementRect.height / 2,
    };
  };

  const typeMessage = (text) => {
    setTypingText("");
    setShowTyping(true);
    let index = 0;

    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }

    typingIntervalRef.current = setInterval(() => {
      if (index <= text.length) {
        setTypingText(text.slice(0, index));
        index++;
      } else {
        clearInterval(typingIntervalRef.current);
      }
    }, 50);
  };

  const sendMessage = (message) => {
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }
    setTypingText("");
    setShowTyping(false);
    setMessageHistory((prev) => [...prev, message]);
  };

  const showClickEffect = (position) => {
    setCursorPosition(position);
    setShowClick(true);
    setTimeout(() => setShowClick(false), 600);
  };

  const generateSparkles = (centerX, centerY) => {
    const newSparkles = [];
    for (let i = 0; i < 8; i++) {
      const angle = i * 45 * (Math.PI / 180);
      const distance = 30 + Math.random() * 20;
      newSparkles.push({
        id: i,
        x: centerX + Math.cos(angle) * distance,
        y: centerY + Math.sin(angle) * distance,
        delay: Math.random() * 0.3,
      });
    }
    setSparkles(newSparkles);
    setShowSparkles(true);

    setTimeout(() => {
      setShowSparkles(false);
      setSparkles([]);
    }, 1500);
  };

  const resetAllStates = () => {
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }
    setShowChat(false);
    setChatExpanded(false);
    setTypingText("");
    setShowTyping(false);
    setMessageHistory([]);
    setShowMatches(false);
    setShowCursor(false);
    setShowClick(false);
    setShowJobDetails(false);
    setConnectClicked(false);
    setShowFinalPopup(false);
    setShowSparkles(false);
    setSparkles([]);
    setCursorPosition({ x: 0, y: 0 });
  };

  const executeStep = (stepIndex) => {
    const stepName = steps[stepIndex].name;

    switch (stepName) {
      case "showChat":
        setShowChat(true);
        break;
      case "expandChat":
        setChatExpanded(true);
        break;
      case "startTyping1":
        break;
      case "typeMessage1":
        typeMessage(messages[0]);
        break;
      case "sendMessage1":
        sendMessage(messages[0]);
        break;
      case "wait1":
        break;
      case "startTyping2":
        break;
      case "typeMessage2":
        typeMessage(messages[1]);
        break;
      case "sendMessage2":
        sendMessage(messages[1]);
        break;
      case "wait2":
        break;
      case "hideChat":
        setChatExpanded(false);
        setTimeout(() => setShowChat(false), 400);
        break;
      case "showMatches":
        setShowMatches(true);
        break;
      case "showCursor":
        setShowCursor(true);
        setCursorPosition({ x: 100, y: 100 });
        break;
      case "moveCursorToView":
        setTimeout(() => {
          const eyePos = getElementPosition('[data-tour="view-job"]');
          setCursorPosition(eyePos);
        }, 200);
        break;
      case "clickView":
        const eyePos = getElementPosition('[data-tour="view-job"]');
        showClickEffect(eyePos);
        break;
      case "showDetails":
        setShowJobDetails(true);
        break;
      case "moveCursorToClose":
        setTimeout(() => {
          const closePos = getElementPosition('[data-tour="close-details"]');
          setCursorPosition(closePos);
        }, 200);
        break;
      case "clickClose":
        const closePos = getElementPosition('[data-tour="close-details"]');
        showClickEffect(closePos);
        break;
      case "hideDetails":
        setShowJobDetails(false);
        break;
      case "moveCursorToConnect":
        setTimeout(() => {
          const connectPos = getElementPosition('[data-tour="connect-job"]');
          setCursorPosition(connectPos);
        }, 200);
        break;
      case "clickConnect":
        const connectPos = getElementPosition('[data-tour="connect-job"]');
        showClickEffect(connectPos);
        generateSparkles(connectPos.x, connectPos.y);
        setTimeout(() => setConnectClicked(true), 300);
        break;
      case "showConnectSuccess":
        break;
      case "showFinalPopup":
        setShowFinalPopup(true);
        break;
      case "reset":
        resetAllStates();
        break;
    }
  };

  useEffect(() => {
    executeStep(currentStep);

    timeoutRef.current = setTimeout(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, steps[currentStep].duration);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    };
  }, [currentStep]);

  return (
    <Box
      ref={containerRef}
      sx={{
        position: "relative",
        width: "100%",
        maxWidth: { xs: "100%", sm: 700 },
        height: { xs: "100vh", sm: 500 },
        mx: { xs: 0, sm: "auto" },
        bgcolor: "background.default",
        borderRadius: { xs: 0, sm: 2 },
        overflow: "hidden",
        border: { xs: "none", sm: 1 },
        borderColor: "divider",
      }}
    >
      {/* Interaction Blocker */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          zIndex: 100,
          backgroundColor: "transparent",
          pointerEvents: "all",
          userSelect: "none",
        }}
      />

      {/* Chat Component */}
      <Zoom in={showChat} timeout={800}>
        <Card
          sx={{
            position: "absolute",
            bottom: { xs: 10, sm: 24 },
            right: { xs: 10, sm: 24 },
            width: chatExpanded ? { xs: 325, sm: 500 } : 60,
            height: chatExpanded ? { xs: 300, sm: 280 } : 60,
            transition: "all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            zIndex: 10,
            maxWidth: { xs: "calc(100vw - 20px)", sm: 440 },
            boxShadow: theme.shadows[8],
          }}
        >
          <CardContent sx={{ p: chatExpanded ? 2 : 1, height: "100%" }}>
            {!chatExpanded ? (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                }}
              >
                <Chat sx={{ fontSize: 36, color: "inherit" }} />
              </Box>
            ) : (
              <Box
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    mb: 2,
                    fontWeight: "bold",
                    fontSize: "1.1rem",
                    color: "inherit",
                  }}
                >
                  AI Job Assistant
                </Typography>

                <Box
                  sx={{ flex: 1, mb: 2, minHeight: 120, overflow: "hidden" }}
                >
                  {messageHistory.map((msg, index) => (
                    <Slide key={index} direction="left" in={true} timeout={500}>
                      <Box sx={{ mb: 1.5 }}>
                        <Typography
                          sx={{
                            bgcolor: "rgba(255,255,255,0.15)",
                            p: 1.5,
                            borderRadius: 2,
                            fontSize: "0.9rem",
                            lineHeight: 1.4,
                            color: "inherit",
                            wordBreak: "break-word",
                          }}
                        >
                          {msg}
                        </Typography>
                      </Box>
                    </Slide>
                  ))}
                </Box>

                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                  <TextField
                    fullWidth
                    size="small"
                    value={showTyping ? typingText : ""}
                    placeholder="Describe your ideal role..."
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        bgcolor: "rgba(255,255,255,0.15)",
                        color: "inherit",
                        fontSize: "0.9rem",
                        "& fieldset": { borderColor: "rgba(255,255,255,0.3)" },
                        "& input::placeholder": {
                          color: "rgba(255,255,255,0.7)",
                          opacity: 1,
                        },
                      },
                    }}
                    InputProps={{
                      endAdornment: showTyping && (
                        <Box
                          sx={{
                            width: 2,
                            height: 16,
                            bgcolor: "currentColor",
                            animation: "blink 1s infinite",
                            "@keyframes blink": {
                              "0%, 50%": { opacity: 1 },
                              "51%, 100%": { opacity: 0 },
                            },
                          }}
                        />
                      ),
                    }}
                  />
                  <IconButton size="small" sx={{ color: "inherit" }}>
                    <Send />
                  </IconButton>
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      </Zoom>

      {/* Job Matches */}
      <Slide direction="up" in={showMatches} timeout={1000}>
        <Box
          sx={{
            position: "absolute",
            top: { xs: 10, sm: 20 },
            left: { xs: 10, sm: 20 },
            right: { xs: 10, sm: 20 },
            bottom: { xs: 100, sm: 120 },
            overflow: "auto",
          }}
        >
          <Typography
            variant="h4"
            sx={{
              mb: 3,
              fontWeight: "bold",
              textAlign: "center",
              fontSize: { xs: "1.5rem", sm: "2rem" },
              color: "text.primary",
            }}
          >
            Perfect Matches Found!
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {jobMatches.map((match, index) => (
              <Grow key={match.id} in={showMatches} timeout={800 + index * 300}>
                <Card
                  sx={{
                    p: { xs: 1.5, sm: 2 },
                    borderRadius: 3,
                    bgcolor: "background.paper",
                    border: 1,
                    borderColor: "divider",
                    boxShadow: theme.shadows[2],
                    "&:hover": {
                      boxShadow: theme.shadows[4],
                    },
                  }}
                >
                  <Box
                    display="flex"
                    alignItems="center"
                    gap={2}
                    flexWrap="wrap"
                  >
                    {/* Match Score */}
                    <Box position="relative" sx={{ flexShrink: 0 }}>
                      <CircularProgress
                        variant="determinate"
                        value={match.score}
                        size={60}
                        thickness={6}
                        sx={{
                          color:
                            match.score >= 90 ? "success.main" : "warning.main",
                        }}
                      />
                      <Box
                        sx={{
                          position: "absolute",
                          inset: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Typography
                          variant="body1"
                          fontWeight="bold"
                          color="text.primary"
                        >
                          {match.score}%
                        </Typography>
                      </Box>
                    </Box>

                    {/* Job Info */}
                    <Box sx={{ flex: 1, minWidth: { xs: 150, sm: 200 } }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontSize: "1.1rem",
                          fontWeight: "bold",
                          color: "text.primary",
                          mb: 0.5,
                        }}
                      >
                        {match.title}
                      </Typography>
                      <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{ mb: 1 }}
                      >
                        {match.company}
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={0.5}>
                        {match.skills.map((skill, i) => (
                          <Chip
                            key={i}
                            label={skill}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ fontSize: "0.8rem" }}
                          />
                        ))}
                      </Box>
                    </Box>

                    {/* Action Buttons */}
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                        flexShrink: 0,
                        width: { xs: "100%", sm: "auto" },
                        justifyContent: { xs: "flex-end", sm: "flex-start" },
                      }}
                    >
                      <IconButton
                        data-tour={index === 0 ? "view-job" : ""}
                        size="small"
                        sx={{
                          bgcolor: "primary.main",
                          color: "primary.contrastText",
                          width: 40,
                          height: 40,
                          "&:hover": { bgcolor: "primary.dark" },
                        }}
                      >
                        <Visibility />
                      </IconButton>
                      <Button
                        data-tour={index === 0 ? "connect-job" : ""}
                        variant="contained"
                        size="small"
                        startIcon={
                          connectClicked && index === 0 ? (
                            <CheckCircle />
                          ) : (
                            <PersonAdd />
                          )
                        }
                        sx={{
                          bgcolor:
                            connectClicked && index === 0
                              ? "success.main"
                              : "primary.main",
                          fontSize: "0.85rem",
                          minWidth: { xs: 100, sm: 110 },
                          height: 40,
                          "&:hover": {
                            bgcolor:
                              connectClicked && index === 0
                                ? "success.dark"
                                : "primary.dark",
                          },
                        }}
                      >
                        {connectClicked && index === 0
                          ? "Connected!"
                          : "Connect"}
                      </Button>
                    </Box>
                  </Box>
                </Card>
              </Grow>
            ))}
          </Box>
        </Box>
      </Slide>

      {/* Custom Cursor */}
      {showCursor && (
        <Box
          sx={{
            position: "absolute",
            left: cursorPosition.x - 12,
            top: cursorPosition.y - 18,
            width: 24,
            height: 32,
            zIndex: 50,
            transition: "all 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            pointerEvents: "none",
            filter: "drop-shadow(2px 2px 4px rgba(0,0,0,0.3))",
          }}
        >
          <svg width="24" height="32" viewBox="0 0 24 32" fill="none">
            <path
              d="M4 2L20 14L14 16L16 26L13 27L10 17L3 19L4 2Z"
              fill={theme.palette.primary.main}
              stroke="#fff"
              strokeWidth="2"
            />
          </svg>
        </Box>
      )}

      {/* Click Effect */}
      {showClick && (
        <>
          <Box
            sx={{
              position: "absolute",
              left: cursorPosition.x - 30,
              top: cursorPosition.y - 30,
              width: 60,
              height: 60,
              border: "4px solid",
              borderColor: "primary.main",
              borderRadius: "50%",
              zIndex: 45,
              animation: "clickRipple 0.6s ease-out",
              "@keyframes clickRipple": {
                "0%": { transform: "scale(0.3)", opacity: 1 },
                "100%": { transform: "scale(1)", opacity: 0 },
              },
            }}
          />
          <Box
            sx={{
              position: "absolute",
              left: cursorPosition.x - 10,
              top: cursorPosition.y - 10,
              width: 20,
              height: 20,
              borderRadius: "50%",
              bgcolor: "primary.main",
              zIndex: 46,
              animation: "clickFlash 0.4s ease-out",
              "@keyframes clickFlash": {
                "0%": { transform: "scale(0)", opacity: 1 },
                "100%": { transform: "scale(1)", opacity: 0 },
              },
            }}
          />
        </>
      )}

      {/* Sparkle Effects */}
      {showSparkles &&
        sparkles.map((sparkle) => (
          <Box
            key={sparkle.id}
            sx={{
              position: "absolute",
              left: sparkle.x - 8,
              top: sparkle.y - 8,
              zIndex: 55,
              animation: `sparkleAnimation 1.5s ease-out ${sparkle.delay}s`,
              "@keyframes sparkleAnimation": {
                "0%": {
                  transform: "scale(0) rotate(0deg)",
                  opacity: 1,
                },
                "50%": {
                  transform: "scale(1) rotate(180deg)",
                  opacity: 1,
                },
                "100%": {
                  transform: "scale(0) rotate(360deg)",
                  opacity: 0,
                },
              },
            }}
          >
            <Star
              sx={{
                fontSize: 16,
                color: "warning.main",
                filter: "drop-shadow(0 0 4px rgba(255,193,7,0.5))",
              }}
            />
          </Box>
        ))}

      {/* Job Details Modal */}
      <Zoom in={showJobDetails} timeout={800}>
        <Box
          sx={{
            position: "absolute",

            right: { xs: "auto", sm: 50 },
            bottom: { xs: "auto", sm: 70 },
            transform: { xs: "translate(-50%, -50%)", sm: "none" },
            width: { xs: "calc(100vw - 30px)", sm: "auto" },
            maxWidth: { xs: 350, sm: "none" },
            height: { xs: "auto", sm: "auto" },
            maxHeight: { xs: "70vh", sm: "none" },
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: theme.shadows[12],
            zIndex: 40,
            display: "flex",
            flexDirection: "column",
            border: 1,
            borderColor: "divider",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              p: { xs: 1.2, sm: 2 },
              bgcolor: "primary.main",
              color: "primary.contrastText",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexShrink: 0,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: "bold",
                fontSize: { xs: "1rem", sm: "1.2rem" },
              }}
            >
              Job Details
            </Typography>
            <IconButton
              data-tour="close-details"
              size="small"
              sx={{
                color: "inherit",
                "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                p: 0.5,
              }}
            >
              <Close sx={{ fontSize: { xs: 20, sm: 24 } }} />
            </IconButton>
          </Box>

          <Box
            sx={{
              p: { xs: 1.5, sm: 2.5 },
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: { xs: 1.2, sm: 1.5 },
            }}
          >
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: "bold",
                  color: "text.primary",
                  fontSize: { xs: "1.1rem", sm: "1.3rem" },
                  lineHeight: 1.2,
                  mb: 0.3,
                }}
              >
                Senior Rust Developer
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "text.secondary",
                  fontSize: { xs: "0.9rem", sm: "1.1rem" },
                }}
              >
                Web3 Startup
              </Typography>
            </Box>

            <Typography
              variant="body2"
              sx={{
                lineHeight: 1.3,
                color: "text.primary",
                fontSize: { xs: "0.85rem", sm: "1rem" },
              }}
            >
              Build next-gen DeFi applications with blockchain technology.
            </Typography>

            <Box>
              <Typography
                variant="subtitle2"
                sx={{
                  mb: 0.8,
                  fontWeight: "bold",
                  color: "text.primary",
                  fontSize: { xs: "0.85rem", sm: "1rem" },
                }}
              >
                Skills
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={0.4}>
                {["Rust", "TypeScript", "ICP"].map((skill) => (
                  <Chip
                    key={skill}
                    label={skill}
                    color="primary"
                    size="small"
                    sx={{
                      fontSize: { xs: "0.75rem", sm: "0.85rem" },
                      height: { xs: 24, sm: 28 },
                      "& .MuiChip-label": { px: { xs: 1, sm: 1.5 } },
                    }}
                  />
                ))}
              </Box>
            </Box>

            <Box sx={{ "& > *": { mb: { xs: 0.3, sm: 0.5 } } }}>
              <Typography
                variant="body2"
                color="text.primary"
                sx={{
                  fontSize: { xs: "0.8rem", sm: "0.95rem" },
                }}
              >
                <strong>Remote</strong> • Asian Timezones
              </Typography>
              <Typography
                variant="body2"
                color="text.primary"
                sx={{
                  fontSize: { xs: "0.8rem", sm: "0.95rem" },
                }}
              >
                <strong>$80k-120k</strong> • Full-time
              </Typography>
              <Typography
                variant="body2"
                color="text.primary"
                sx={{
                  fontSize: { xs: "0.8rem", sm: "0.95rem" },
                }}
              >
                <strong>3-5 years</strong> experience
              </Typography>
            </Box>
          </Box>
        </Box>
      </Zoom>

      {/* Final Popup */}
      <Fade in={showFinalPopup} timeout={1000}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "calc(100% - 20px)", sm: "85%" },
            maxWidth: 450,
            bgcolor: "success.light",
            borderRadius: 4,
            p: { xs: 2, sm: 3 },
            textAlign: "center",
            zIndex: 60,
            boxShadow: theme.shadows[16],
            border: 2,
            borderColor: "success.main",
          }}
        >
          <Typography
            variant="h4"
            sx={{
              mb: 2,
              fontWeight: "bold",
              color: "success.dark",
              fontSize: { xs: "1.5rem", sm: "2rem" },
            }}
          >
            🎉 Pro Tip!
          </Typography>
          <Typography
            variant="h6"
            sx={{
              lineHeight: 1.6,
              color: "success.dark",
              fontSize: { xs: "1rem", sm: "1.1rem" },
            }}
          >
            Don't see perfect matches yet? No worries! Just wait an our system
            will Alert you via email 🔔.
          </Typography>
        </Box>
      </Fade>
    </Box>
  );
};

export default ProductTour;
