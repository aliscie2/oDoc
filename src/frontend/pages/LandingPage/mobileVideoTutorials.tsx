import React, { useRef, useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Container,
  useTheme,
  useMediaQuery,
  alpha,
  IconButton,
} from "@mui/material";
import { tutorials } from "./landingPageData";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
} from "@mui/icons-material";
import VideoPlayer from "../videoTutorial/videoPlayer";
import { useSelector } from "react-redux";

interface TutorialsSectionProps {
  // Remove state prop since we're using Redux selectors directly
}

const MobileTutrials: React.FC<TutorialsSectionProps> = () => {
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
      {/* Navigation Bar */}
      <Box
        sx={{
          width: "100vw",
          marginLeft: "calc(50% - 50vw)",
          marginRight: "calc(50% - 50vw)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
          py: 1,
          bgcolor: theme.palette.background.paper,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <IconButton
          onClick={goToPrevious}
          disabled={selectedTutorial === 0}
          sx={{ color: theme.palette.text.primary }}
        >
          <ChevronLeft />
        </IconButton>

        <Typography
          variant="h6"
          sx={{
            flex: 1,
            textAlign: "center",
            color: theme.palette.text.primary,
            fontWeight: 500,
          }}
        >
          {currentTutorial.title}
        </Typography>

        <IconButton
          onClick={goToNext}
          disabled={selectedTutorial === tutorials.length - 1}
          sx={{ color: theme.palette.text.primary }}
        >
          <ChevronRight />
        </IconButton>
      </Box>

      {/* Full Width Video Player */}
      <Box
        sx={{
          width: "100vw",
          height: videoHeight || { xs: "60vh", sm: "70vh", md: "80vh" },
          position: "relative",
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

export default MobileTutrials;
