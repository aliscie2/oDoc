import React, { useRef, useState, useEffect } from "react";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  Paper,
  Container,
  useTheme,
  useMediaQuery,
  alpha,
  Divider,
  IconButton,
  Collapse,
  Fade,
} from "@mui/material";
import { tutorials } from "./landingPageData";
import {
  PlayArrow,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
} from "@mui/icons-material";
import VideoPlayer from "../videoTutorial/videoPlayer";
import { useSelector } from "react-redux";

interface TutorialsSectionProps {
  // Remove state prop since we're using Redux selectors directly
}

const TutorialsSection: React.FC<TutorialsSectionProps> = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [selectedTutorial, setSelectedTutorial] = useState(0);
  const [videoHeight, setVideoHeight] = useState<number>(0);
  const [showOverlay, setShowOverlay] = useState(true);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const isDragging = useRef<boolean>(false);
  const overlayTimeoutRef = useRef<NodeJS.Timeout>();

  // Get state from Redux store
  const state = {
    uiState: useSelector((state: any) => state.uiState),
    filesState: useSelector((state: any) => state.filesState),
  };

  const currentTutorial = tutorials[selectedTutorial] || tutorials[0];

  // Calculate video height based on aspect ratio (16:9)
  useEffect(() => {
    const calculateVideoHeight = () => {
      const screenWidth = window.innerWidth;
      // 16:9 aspect ratio
      const calculatedHeight = (screenWidth * 9) / 16;
      // Limit height to viewport height minus some padding
      const maxHeight = window.innerHeight * 0.8;
      setVideoHeight(Math.min(calculatedHeight, maxHeight));
    };

    calculateVideoHeight();
    window.addEventListener("resize", calculateVideoHeight);
    return () => window.removeEventListener("resize", calculateVideoHeight);
  }, []);

  // Auto-hide overlay after 3 seconds, show on interaction
  useEffect(() => {
    const resetOverlayTimer = () => {
      setShowOverlay(true);
      if (overlayTimeoutRef.current) {
        clearTimeout(overlayTimeoutRef.current);
      }
      overlayTimeoutRef.current = setTimeout(() => {
        setShowOverlay(false);
      }, 3000);
    };

    resetOverlayTimer();
    return () => {
      if (overlayTimeoutRef.current) {
        clearTimeout(overlayTimeoutRef.current);
      }
    };
  }, [selectedTutorial]);

  // Show overlay on mouse move or touch
  const handleInteraction = () => {
    setShowOverlay(true);
    if (overlayTimeoutRef.current) {
      clearTimeout(overlayTimeoutRef.current);
    }
    overlayTimeoutRef.current = setTimeout(() => {
      setShowOverlay(false);
    }, 3000);
  };

  // Enhanced touch handling for better swipe detection
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isDragging.current = false;
    handleInteraction();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) {
      const deltaX = Math.abs(e.touches[0].clientX - touchStartX.current);
      const deltaY = Math.abs(e.touches[0].clientY - touchStartY.current);

      // Start dragging if horizontal movement is greater than vertical
      if (deltaX > deltaY && deltaX > 10) {
        isDragging.current = true;
        e.preventDefault(); // Prevent scrolling
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging.current) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchStartX.current - touchEndX;
    const deltaY = touchStartY.current - touchEndY;

    // Only trigger swipe if horizontal movement is greater than vertical and exceeds threshold
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      if (deltaX > 0 && selectedTutorial < tutorials.length - 1) {
        // Swipe left - next video
        setSelectedTutorial(selectedTutorial + 1);
      } else if (deltaX < 0 && selectedTutorial > 0) {
        // Swipe right - previous video
        setSelectedTutorial(selectedTutorial - 1);
      }
    }

    isDragging.current = false;
  };

  const goToPrevious = () => {
    if (selectedTutorial > 0) {
      setSelectedTutorial(selectedTutorial - 1);
    }
  };

  const goToNext = () => {
    if (selectedTutorial < tutorials.length - 1) {
      setSelectedTutorial(selectedTutorial + 1);
    }
  };

  if (tutorials.length === 0) {
    return (
      <Container maxWidth="xl" sx={{ py: { xs: 4, md: 8 } }}>
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h6" sx={{ color: "text.secondary", mb: 2 }}>
            No tutorials available
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Complete the prerequisites to unlock tutorial content
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <>
      {/* Header */}
      <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
        <Box sx={{ mb: { xs: 2, md: 4 }, textAlign: "center" }}>
          <Typography
            variant="h4"
            component="h2"
            sx={{
              fontWeight: 600,
              mb: 1,
              fontSize: { xs: "1.5rem", md: "2.125rem" },
            }}
          >
            Tutorials
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "text.secondary",
              maxWidth: "500px",
              mx: "auto",
              fontSize: { xs: "0.875rem", md: "1rem" },
            }}
          >
            Swipe left or right to navigate through tutorials
          </Typography>
        </Box>

        {/* Current Video Info */}
        <Fade in={true} key={selectedTutorial} timeout={300}>
          <Box
            sx={{
              textAlign: "center",
              mb: { xs: 3, md: 4 },
              px: { xs: 2, md: 0 },
            }}
          >
            <Paper
              elevation={2}
              sx={{
                px: { xs: 3, md: 4 },
                py: { xs: 2, md: 3 },
                maxWidth: "600px",
                mx: "auto",
                backgroundColor: alpha(theme.palette.primary.main, 0.04),
                borderLeft: `4px solid ${theme.palette.primary.main}`,
                borderRadius: 2,
                transition: "all 0.3s ease",
                "&:hover": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  transform: "translateY(-2px)",
                  boxShadow: theme.shadows[4],
                },
              }}
            >
              <Typography
                variant="h5"
                component="h3"
                sx={{
                  fontWeight: 600,
                  mb: 1.5,
                  color: theme.palette.primary.main,
                  fontSize: { xs: "1.25rem", md: "1.5rem" },
                  lineHeight: 1.3,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1,
                }}
              >
                {currentTutorial?.title}
                {currentTutorial?.checkCondition &&
                  currentTutorial.checkCondition(state) && (
                    <CheckCircle
                      color="success"
                      sx={{
                        fontSize: { xs: "1.25rem", md: "1.5rem" },
                        animation: "fadeIn 0.5s ease-in",
                        "@keyframes fadeIn": {
                          "0%": {
                            opacity: 0,
                            transform: "scale(0.8)",
                          },
                          "100%": {
                            opacity: 1,
                            transform: "scale(1)",
                          },
                        },
                      }}
                    />
                  )}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "text.secondary",
                  lineHeight: 1.6,
                  fontSize: { xs: "0.875rem", md: "1rem" },
                  maxWidth: "500px",
                  mx: "auto",
                }}
              >
                {currentTutorial?.description}
              </Typography>

              {/* Tutorial counter with navigation arrows */}
              <Box
                sx={{
                  mt: 2,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <IconButton
                  onClick={goToPrevious}
                  disabled={selectedTutorial === 0}
                  sx={{
                    color:
                      selectedTutorial === 0
                        ? "text.disabled"
                        : theme.palette.primary.main,
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    "&:hover": {
                      backgroundColor: alpha(theme.palette.primary.main, 0.2),
                    },
                    "&:disabled": {
                      backgroundColor: alpha(
                        theme.palette.action.disabled,
                        0.1,
                      ),
                    },
                    width: { xs: 36, md: 40 },
                    height: { xs: 36, md: 40 },
                  }}
                >
                  <ChevronLeft sx={{ fontSize: { xs: 20, md: 24 } }} />
                </IconButton>

                <Typography
                  variant="caption"
                  sx={{
                    color: "text.secondary",
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    px: 2,
                    py: 0.5,
                    borderRadius: 2,
                    fontSize: { xs: "0.75rem", md: "0.8rem" },
                    fontWeight: 500,
                    minWidth: { xs: "60px", md: "70px" },
                    textAlign: "center",
                  }}
                >
                  {selectedTutorial + 1} of {tutorials.length}
                </Typography>

                <IconButton
                  onClick={goToNext}
                  disabled={selectedTutorial === tutorials.length - 1}
                  sx={{
                    color:
                      selectedTutorial === tutorials.length - 1
                        ? "text.disabled"
                        : theme.palette.primary.main,
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    "&:hover": {
                      backgroundColor: alpha(theme.palette.primary.main, 0.2),
                    },
                    "&:disabled": {
                      backgroundColor: alpha(
                        theme.palette.action.disabled,
                        0.1,
                      ),
                    },
                    width: { xs: 36, md: 40 },
                    height: { xs: 36, md: 40 },
                  }}
                >
                  <ChevronRight sx={{ fontSize: { xs: 20, md: 24 } }} />
                </IconButton>
              </Box>
            </Paper>
          </Box>
        </Fade>
      </Container>

      {/* Full Width Video Player - Fixed positioning */}
      <Box
        sx={{
          width: "100vw",
          height: videoHeight || { xs: "60vh", sm: "70vh", md: "80vh" },
          position: "relative",
          // Better approach to break out of container
          marginLeft: "calc(50% - 50vw)",
          marginRight: "calc(50% - 50vw)",
          mb: { xs: 2, md: 4 },
          overflow: "hidden",
        }}
      >
        <Box
          ref={videoContainerRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseMove={handleInteraction}
          onMouseEnter={handleInteraction}
          sx={{
            position: "relative",
            width: "100%",
            height: "100%",
            cursor: "grab",
            touchAction: "pan-y", // Allow vertical scrolling but capture horizontal
            "&:active": {
              cursor: "grabbing",
            },
          }}
        >
          {/* Video Cards Stack */}
          {tutorials.map((tutorial, index) => {
            const offset = index - selectedTutorial;
            const isActive = index === selectedTutorial;
            const isVisible = Math.abs(offset) <= 1;
            const isCompleted =
              tutorial.checkCondition && tutorial.checkCondition(state);

            return (
              <Paper
                key={tutorial.id || index}
                elevation={isActive ? 8 : 2}
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  display: isVisible ? "flex" : "none", // Hide distant cards for performance
                  flexDirection: "column",
                  bgcolor: theme.palette.grey[900],
                  transform: `translateX(${offset * 100}%) scale(${
                    isActive ? 1 : 0.95
                  })`,
                  transition: isDragging.current
                    ? "none"
                    : "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  zIndex: tutorials.length - Math.abs(offset),
                  opacity: Math.abs(offset) > 1 ? 0 : 1,
                  pointerEvents: isActive ? "auto" : "none",
                  willChange: "transform", // Optimize for animations
                }}
              >
                {/* Video Container */}
                <Box
                  sx={{
                    width: "100%",
                    height: "100%",
                    position: "relative",
                    bgcolor: theme.palette.grey[900],
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    // Ensure no spacing issues
                    margin: 0,
                    padding: 0,
                  }}
                >
                  <VideoPlayer
                    video={tutorial}
                    startTime={tutorial.startTime}
                    style={{
                      width: "100%",
                      height: "100%",
                      position: "absolute",
                      top: 0,
                      left: 0,
                      margin: 0,
                      padding: 0,
                    }}
                  />

                  {/* Green Check Mark Overlay for Completed Videos */}
                  {isCompleted && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: 16,
                        right: 16,
                        zIndex: 10,
                        backgroundColor: alpha(theme.palette.success.main, 0.9),
                        borderRadius: "50%",
                        width: { xs: 40, md: 48 },
                        height: { xs: 40, md: 48 },
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                        animation: "checkmarkBounce 0.6s ease-out",
                        "@keyframes checkmarkBounce": {
                          "0%": {
                            transform: "scale(0)",
                            opacity: 0,
                          },
                          "50%": {
                            transform: "scale(1.2)",
                            opacity: 0.8,
                          },
                          "100%": {
                            transform: "scale(1)",
                            opacity: 1,
                          },
                        },
                      }}
                    >
                      <CheckCircle
                        sx={{
                          color: theme.palette.common.white,
                          fontSize: { xs: 24, md: 28 },
                        }}
                      />
                    </Box>
                  )}
                </Box>

                {/* Bottom Progress Bar - Always visible, minimal */}
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    bgcolor: alpha(theme.palette.common.black, 0.3),
                    zIndex: 5,
                  }}
                >
                  <Box sx={{ display: "flex", height: "100%" }}>
                    {tutorials.map((tutorialItem, idx) => {
                      const tutorialCompleted =
                        tutorialItem.checkCondition &&
                        tutorialItem.checkCondition(state);
                      return (
                        <Box
                          key={idx}
                          sx={{
                            flex: 1,
                            height: "100%",
                            bgcolor:
                              idx === selectedTutorial
                                ? theme.palette.primary.main
                                : tutorialCompleted
                                  ? theme.palette.success.main
                                  : alpha(theme.palette.common.white, 0.2),
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                            "&:hover": {
                              bgcolor:
                                idx === selectedTutorial
                                  ? theme.palette.primary.light
                                  : tutorialCompleted
                                    ? theme.palette.success.light
                                    : alpha(theme.palette.common.white, 0.3),
                            },
                          }}
                          onClick={() => setSelectedTutorial(idx)}
                        />
                      );
                    })}
                  </Box>
                </Box>

                {/* Swipe hint on first video */}
                {index === 0 && selectedTutorial === 0 && showOverlay && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      color: theme.palette.common.white,
                      textAlign: "center",
                      animation: "fadeInOut 4s ease-in-out infinite",
                      pointerEvents: "none",
                      zIndex: 15,
                      "@keyframes fadeInOut": {
                        "0%, 100%": { opacity: 0 },
                        "25%, 75%": { opacity: 0.9 },
                        "50%": { opacity: 1 },
                      },
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: { xs: "0.75rem", md: "0.875rem" },
                        textShadow: "0 2px 4px rgba(0,0,0,0.9)",
                        display: "block",
                        fontWeight: 500,
                        px: 2,
                        py: 1,
                        bgcolor: alpha(theme.palette.common.black, 0.5),
                        borderRadius: 1,
                      }}
                    >
                      ← Swipe to navigate →
                    </Typography>
                  </Box>
                )}
              </Paper>
            );
          })}
        </Box>
      </Box>
    </>
  );
};

export default TutorialsSection;
