import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Fade,
  Grow,
  Chip,
  useTheme,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";

// Using your existing JellyfishSVG component with stable tentacles
// Using your existing JellyfishSVG component with stable tentacles and dark shadow
const JellyfishSVG = ({
  scale = 1,
  eyePos = { x: 0, y: 0 },
  blink = false,
  glowIntensity = 0.6,
}) => {
  // Complete tentacle paths - restored to original shape
  const tentacles = [
    "M72.2162 213.056C71.0175 213.087 62.69 215.701 59.2797 222.986C55.8702 230.27 58.4838 238.598 52.6776 245.944C46.8699 253.291 38.3875 249.912 38.3875 249.912C38.3875 249.912 32.3588 248.713 32.1459 240.478C31.9331 232.244 39.9553 223.485 39.9553 223.485C39.9553 223.485 49.489 209.706 44.3397 201.783",
    "M80.6827 219.037C80.6827 219.037 87.0725 223.684 87.0725 232.057C87.0725 240.431 87.3359 249.983 89.5672 251.987C91.7986 253.992 98.2363 262.039 106.791 254.518C115.346 246.998 104.865 235.356 104.865 235.356C104.865 235.356 102.041 229.913 102.041 225.695C102.041 221.476 104.865 216.146 104.865 216.146",
    "M119.504 209.577C119.504 209.577 131.351 213.529 132.912 219.038C134.472 224.545 141.957 234.524 141.957 234.524C141.957 234.524 151.304 242.616 157.856 236.907C164.409 231.198 162.982 228.308 162.982 228.308C162.982 228.308 163.664 221.051 154.474 216.145C145.283 211.24 143.62 202.624 143.62 202.624C143.62 202.624 141.909 190.458 141.888 190.529",
  ];

  const mainColor = "#F9F3E0";
  const lightColor = "#fcfcfc";

  return (
    <motion.svg
      width="100"
      height="100"
      viewBox="0 0 209 259"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{
        scale: scale,
        opacity: 1,
        filter: `drop-shadow(0 4px 20px rgba(249, 243, 224, ${glowIntensity})) drop-shadow(0 8px 25px rgba(0, 0, 0, 0.3))`,
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      {/* Glow lines */}
      <motion.g
        className="glow"
        animate={{ opacity: glowIntensity }}
        transition={{ duration: 0.3 }}
      >
        <line
          stroke={lightColor}
          strokeWidth="8"
          x1="83.7"
          y1="37.4"
          x2="82.1"
          y2="0.85"
        />
        <line
          stroke={lightColor}
          strokeWidth="8"
          x1="136.7"
          y1="49.2"
          x2="159.4"
          y2="23.3"
        />
        <line
          stroke={lightColor}
          strokeWidth="8"
          x1="175.2"
          y1="95.7"
          x2="203.5"
          y2="84.8"
        />
      </motion.g>

      {/* Body */}
      <ellipse fill={mainColor} cx="80.7" cy="138.4" rx="80.7" ry="80.7" />
      <ellipse fill="#ffffff" cx="78.6" cy="138" rx="64.6" ry="65" />

      {/* Eye */}
      <motion.ellipse
        fill="#024B6D"
        cx={78.2}
        cy={138.2}
        rx="43.2"
        ry={blink ? "3" : "43.2"}
        animate={{
          x: eyePos.x,
          y: eyePos.y,
          ry: blink ? "3" : "43.2",
        }}
        transition={{ duration: blink ? 0.1 : 0.3 }}
      />
      <motion.ellipse
        fill="#FFFFF3"
        cx={78.4}
        cy={138.4}
        rx="10.4"
        ry={blink ? "2" : "10.4"}
        animate={{
          x: eyePos.x * 0.7,
          y: eyePos.y * 0.7,
          ry: blink ? "2" : "10.4",
        }}
        transition={{ duration: blink ? 0.1 : 0.3 }}
      />

      {/* Tentacles - keeping original paths, no distorting animation */}
      {tentacles.map((path, i) => (
        <path key={i} d={path} fill={mainColor} />
      ))}
    </motion.svg>
  );
};
// Typewriter animation component
const TypewriterText = ({
  text,
  speed = 50,
  onComplete,
  variant = "body1",
}) => {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setDisplayText("");
    setCurrentIndex(0);
  }, [text]);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, speed);
      return () => clearTimeout(timer);
    } else if (onComplete && currentIndex === text.length && text.length > 0) {
      const timer = setTimeout(onComplete, 500);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, text, speed, onComplete]);

  return (
    <Typography variant={variant} component="span" sx={{ fontWeight: 500 }}>
      {displayText}
      <motion.span
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 0.8, repeat: Infinity }}
      >
        |
      </motion.span>
    </Typography>
  );
};

// Enhanced Chat bubble component with better positioning
const ChatBubble = ({
  children,
  isVisible,
  jellyfishPos,
  containerSize,
  onClose,
}) => {
  const theme = useTheme();
  const [bubblePosition, setBubblePosition] = useState({
    top: 0,
    left: 0,
    position: "top",
  });

  useEffect(() => {
    if (!jellyfishPos || !containerSize) return;

    const bubbleWidth = 350;
    const bubbleHeight = 120; // Estimated bubble height
    const margin = 20; // Margin from screen edges
    const jellyfishBuffer = 150; // Keep distance from jellyfish

    // Calculate available space in all directions, avoiding jellyfish
    const spaceTop = jellyfishPos.y - jellyfishBuffer;
    const spaceBottom = containerSize.height - jellyfishPos.y - jellyfishBuffer;
    const spaceLeft = jellyfishPos.x - jellyfishBuffer;
    const spaceRight = containerSize.width - jellyfishPos.x - jellyfishBuffer;

    let position = "top"; // Default to top
    let top = jellyfishPos.y - bubbleHeight - 60; // Default above jellyfish with more space
    let left = jellyfishPos.x - bubbleWidth / 2; // Centered on jellyfish

    // Determine best vertical position to avoid covering jellyfish
    if (
      spaceTop < bubbleHeight + margin &&
      spaceBottom > bubbleHeight + margin
    ) {
      // Not enough space above, show below
      position = "bottom";
      top = jellyfishPos.y + jellyfishBuffer; // Below jellyfish with buffer
    } else if (
      spaceTop < bubbleHeight + margin &&
      spaceBottom < bubbleHeight + margin
    ) {
      // Not enough space above or below, show to the side with most space
      if (spaceLeft > spaceRight && spaceLeft > bubbleWidth + margin) {
        position = "left";
        top = jellyfishPos.y - bubbleHeight / 2;
        left = jellyfishPos.x - bubbleWidth - jellyfishBuffer;
      } else if (spaceRight > bubbleWidth + margin) {
        position = "right";
        top = jellyfishPos.y - bubbleHeight / 2;
        left = jellyfishPos.x + jellyfishBuffer;
      } else {
        // Force it above or below, whichever has more space
        if (spaceTop > spaceBottom) {
          position = "top";
          top = margin;
        } else {
          position = "bottom";
          top = jellyfishPos.y + jellyfishBuffer;
        }
      }
    }

    // Ensure bubble stays within screen bounds horizontally
    if (left < margin) {
      left = margin;
    } else if (left + bubbleWidth > containerSize.width - margin) {
      left = containerSize.width - bubbleWidth - margin;
    }

    // Ensure bubble stays within screen bounds vertically
    if (top < margin) {
      top = margin;
    } else if (top + bubbleHeight > containerSize.height - margin) {
      top = containerSize.height - bubbleHeight - margin;
    }

    setBubblePosition({ top, left, position });
  }, [jellyfishPos, containerSize]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          style={{
            position: "fixed",
            top: bubblePosition.top,
            left: bubblePosition.left,
            zIndex: 9998, // Lower than jellyfish
            minWidth: "280px",
            maxWidth: "350px",
            pointerEvents: "auto",
          }}
        >
          <Paper
            elevation={12}
            sx={{
              p: 2.5,
              backgroundColor: theme.palette.background.paper,
              border: `2px solid ${theme.palette.primary.light}`,
              borderRadius: 3,
              position: "relative",
              height: "auto", // Remove maxHeight to prevent scrolling
              overflow: "visible", // Change from auto to visible
              backdropFilter: "blur(10px)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
              "&::before": {
                content: '""',
                position: "absolute",
                ...(bubblePosition.position === "top" && {
                  top: "100%",
                  left: "50%",
                  transform: "translateX(-50%)",
                  borderLeft: "12px solid transparent",
                  borderRight: "12px solid transparent",
                  borderTop: `12px solid ${theme.palette.primary.light}`,
                }),
                ...(bubblePosition.position === "bottom" && {
                  bottom: "100%",
                  left: "50%",
                  transform: "translateX(-50%)",
                  borderLeft: "12px solid transparent",
                  borderRight: "12px solid transparent",
                  borderBottom: `12px solid ${theme.palette.primary.light}`,
                }),
                ...(bubblePosition.position === "left" && {
                  left: "100%",
                  top: "50%",
                  transform: "translateY(-50%)",
                  borderTop: "12px solid transparent",
                  borderBottom: "12px solid transparent",
                  borderLeft: `12px solid ${theme.palette.primary.light}`,
                }),
                ...(bubblePosition.position === "right" && {
                  right: "100%",
                  top: "50%",
                  transform: "translateY(-50%)",
                  borderTop: "12px solid transparent",
                  borderBottom: "12px solid transparent",
                  borderRight: `12px solid ${theme.palette.primary.light}`,
                }),
                width: 0,
                height: 0,
              },
              "&::after": {
                content: '""',
                position: "absolute",
                ...(bubblePosition.position === "top" && {
                  top: "100%",
                  left: "50%",
                  transform: "translateX(-50%)",
                  borderLeft: "10px solid transparent",
                  borderRight: "10px solid transparent",
                  borderTop: `10px solid ${theme.palette.background.paper}`,
                  marginTop: "-1px",
                }),
                ...(bubblePosition.position === "bottom" && {
                  bottom: "100%",
                  left: "50%",
                  transform: "translateX(-50%)",
                  borderLeft: "10px solid transparent",
                  borderRight: "10px solid transparent",
                  borderBottom: `10px solid ${theme.palette.background.paper}`,
                  marginBottom: "-1px",
                }),
                ...(bubblePosition.position === "left" && {
                  left: "100%",
                  top: "50%",
                  transform: "translateY(-50%)",
                  borderTop: "10px solid transparent",
                  borderBottom: "10px solid transparent",
                  borderLeft: `10px solid ${theme.palette.background.paper}`,
                  marginLeft: "-1px",
                }),
                ...(bubblePosition.position === "right" && {
                  right: "100%",
                  top: "50%",
                  transform: "translateY(-50%)",
                  borderTop: "10px solid transparent",
                  borderBottom: "10px solid transparent",
                  borderRight: `10px solid ${theme.palette.background.paper}`,
                  marginRight: "-1px",
                }),
                width: 0,
                height: 0,
              },
            }}
          >
            {/* Close button on chat bubble */}
            <IconButton
              onClick={onClose}
              size="small"
              sx={{
                position: "absolute",
                top: -12,
                right: -12,
                width: 24,
                height: 24,
                backgroundColor: "error.main",
                color: "white",
                zIndex: 1,
                "&:hover": {
                  backgroundColor: "error.dark",
                },
              }}
            >
              <CloseIcon sx={{ fontSize: 14 }} />
            </IconButton>

            {children}
          </Paper>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Main helper component
function GetStartedHelper() {
  const [step, setStep] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [jellyfishPos, setJellyfishPos] = useState({ x: 0, y: 0 });
  const [eyePos, setEyePos] = useState({ x: 0, y: 0 });
  const [blink, setBlink] = useState(false);
  const [glowIntensity, setGlowIntensity] = useState(0.6);
  const [scale, setScale] = useState(1);
  const [isVisible, setIsVisible] = useState(true);
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageComplete, setMessageComplete] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  const jellyfishRef = useRef(null);
  const containerRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Track container size for responsive positioning
  useEffect(() => {
    const updateSize = () => {
      setContainerSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Prevent multiple instances
  useEffect(() => {
    const helperExists = document.querySelector("[data-jellyfish-helper]");
    if (helperExists && !helperExists.contains(containerRef.current)) {
      setIsVisible(false);
      return;
    }
  }, []);

  // Messages for each step
  const messages = {
    1: "Hi! I will help you get started 🎉",
    2: "Click the menu button to explore the navigation",
    3: "Great! Now click 'Create Document' to begin creating",
    4: "Perfect! Now type your text and use '/ custom contract' command",
  };

  // Initialize position
  useEffect(() => {
    if (typeof window !== "undefined" && !isInitialized) {
      setJellyfishPos({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      });
      setIsInitialized(true);
      // Start the sequence after initialization
      setTimeout(() => {
        setStep(1);
      }, 500);
    }
  }, [isInitialized]);

  // Mouse tracking with throttling and jellyfish avoidance
  // Mouse tracking with throttling and jellyfish avoidance
  useEffect(() => {
    let lastTime = 0;
    const handleMouseMove = (e) => {
      const now = Date.now();
      if (now - lastTime < 16) return; // Throttle to ~60fps
      lastTime = now;

      setMousePos({ x: e.clientX, y: e.clientY });

      // Move jellyfish away from mouse when too close
      const jellyfishRect = jellyfishRef.current?.getBoundingClientRect();
      if (jellyfishRect) {
        const centerX = jellyfishRect.left + jellyfishRect.width / 2;
        const centerY = jellyfishRect.top + jellyfishRect.height / 2;

        const distance = Math.sqrt(
          Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2),
        );

        if (distance < 100) {
          // Calculate direction away from mouse
          const angle = Math.atan2(centerY - e.clientY, centerX - e.clientX);
          const pushDistance = 30;
          const newX = centerX + Math.cos(angle) * pushDistance;
          const newY = centerY + Math.sin(angle) * pushDistance;

          // Keep within bounds
          const boundedX = Math.max(
            100,
            Math.min(containerSize.width - 100, newX),
          );
          const boundedY = Math.max(
            100,
            Math.min(containerSize.height - 100, newY),
          );

          setJellyfishPos((prev) => ({
            x: prev.x + (boundedX - prev.x) * 0.1,
            y: prev.y + (boundedY - prev.y) * 0.1,
          }));
        }
      }
    };

    if (isVisible) {
      window.addEventListener("mousemove", handleMouseMove);
      return () => window.removeEventListener("mousemove", handleMouseMove);
    }
  }, [isVisible, containerSize]);

  // Mouse tracking with throttling and jellyfish avoidance
  useEffect(() => {
    let lastTime = 0;
    const handleMouseMove = (e) => {
      const now = Date.now();
      if (now - lastTime < 16) return; // Throttle to ~60fps
      lastTime = now;

      setMousePos({ x: e.clientX, y: e.clientY });

      // Move jellyfish away from mouse when too close
      const jellyfishRect = jellyfishRef.current?.getBoundingClientRect();
      if (jellyfishRect) {
        const centerX = jellyfishRect.left + jellyfishRect.width / 2;
        const centerY = jellyfishRect.top + jellyfishRect.height / 2;

        const distance = Math.sqrt(
          Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2),
        );

        if (distance < 100) {
          // Calculate direction away from mouse
          const angle = Math.atan2(centerY - e.clientY, centerX - e.clientX);
          const pushDistance = 30;
          const newX = centerX + Math.cos(angle) * pushDistance;
          const newY = centerY + Math.sin(angle) * pushDistance;

          // Keep within bounds
          const boundedX = Math.max(
            100,
            Math.min(containerSize.width - 100, newX),
          );
          const boundedY = Math.max(
            100,
            Math.min(containerSize.height - 100, newY),
          );

          setJellyfishPos((prev) => ({
            x: prev.x + (boundedX - prev.x) * 0.1,
            y: prev.y + (boundedY - prev.y) * 0.1,
          }));
        }
      }
    };

    if (isVisible) {
      window.addEventListener("mousemove", handleMouseMove);
      return () => window.removeEventListener("mousemove", handleMouseMove);
    }
  }, [isVisible, containerSize]);

  // Mouse tracking with throttling and jellyfish avoidance
  useEffect(() => {
    let lastTime = 0;
    const handleMouseMove = (e) => {
      const now = Date.now();
      if (now - lastTime < 16) return; // Throttle to ~60fps
      lastTime = now;

      setMousePos({ x: e.clientX, y: e.clientY });

      // Move jellyfish away from mouse when too close
      const jellyfishRect = jellyfishRef.current?.getBoundingClientRect();
      if (jellyfishRect) {
        const centerX = jellyfishRect.left + jellyfishRect.width / 2;
        const centerY = jellyfishRect.top + jellyfishRect.height / 2;

        const distance = Math.sqrt(
          Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2),
        );

        if (distance < 100) {
          // Calculate direction away from mouse
          const angle = Math.atan2(centerY - e.clientY, centerX - e.clientX);
          const pushDistance = 30;
          const newX = centerX + Math.cos(angle) * pushDistance;
          const newY = centerY + Math.sin(angle) * pushDistance;

          // Keep within bounds
          const boundedX = Math.max(
            100,
            Math.min(containerSize.width - 100, newX),
          );
          const boundedY = Math.max(
            100,
            Math.min(containerSize.height - 100, newY),
          );

          setJellyfishPos((prev) => ({
            x: prev.x + (boundedX - prev.x) * 0.1,
            y: prev.y + (boundedY - prev.y) * 0.1,
          }));
        }
      }
    };

    if (isVisible) {
      window.addEventListener("mousemove", handleMouseMove);
      return () => window.removeEventListener("mousemove", handleMouseMove);
    }
  }, [isVisible, containerSize]);

  // Eye movement animation - look at target then mouse in a loop
  useEffect(() => {
    if (!isVisible || !isInitialized) return;

    const animateEyes = () => {
      const jellyfishRect = jellyfishRef.current?.getBoundingClientRect();
      if (!jellyfishRect) return;

      const centerX = jellyfishRect.left + jellyfishRect.width / 2;
      const centerY = jellyfishRect.top + jellyfishRect.height / 2;

      // Find target elements based on current step
      let targetElements = [];
      if (step === 2) {
        targetElements = [
          ...document.querySelectorAll('[role="toggleNav"]'),
          ...document.querySelectorAll(".toggleNav"),
          ...document.querySelectorAll('button[aria-label*="menu"]'),
          ...document.querySelectorAll(
            'button:has(svg[data-testid="MenuIcon"])',
          ),
        ];
      } else if (step === 3) {
        targetElements = [
          ...document.querySelectorAll('[aria-label*="Create"]'),
          ...document.querySelectorAll(
            'button:has(svg[data-testid="AddBoxIcon"])',
          ),
          ...Array.from(document.querySelectorAll("button")).filter((btn) =>
            btn.textContent?.includes("Create Document"),
          ),
        ];
      }

      // Animation loop: look at target for 2 seconds, then mouse for 3 seconds
      const cycleTime = 5000; // 5 seconds total
      const lookAtTargetTime = 2000; // 2 seconds looking at target

      const animate = (timestamp) => {
        const elapsed = timestamp % cycleTime;
        const isLookingAtTarget = elapsed < lookAtTargetTime;

        let targetX, targetY;

        if (isLookingAtTarget && targetElements.length > 0) {
          // Look at the first available target
          const targetRect = targetElements[0].getBoundingClientRect();
          targetX = targetRect.left + targetRect.width / 2;
          targetY = targetRect.top + targetRect.height / 2;
        } else {
          // Look at mouse
          targetX = mousePos.x;
          targetY = mousePos.y;
        }

        // Calculate smooth eye position
        const deltaX = (targetX - centerX) / 8;
        const deltaY = (targetY - centerY) / 8;
        const newEyePos = {
          x: Math.max(-20, Math.min(20, deltaX)),
          y: Math.max(-20, Math.min(20, deltaY)),
        };

        // Smooth transition between positions
        setEyePos((prev) => ({
          x: prev.x + (newEyePos.x - prev.x) * 0.1,
          y: prev.y + (newEyePos.y - prev.y) * 0.1,
        }));

        requestAnimationFrame(animate);
      };

      requestAnimationFrame(animate);
    };

    animateEyes();
  }, [isVisible, isInitialized, step, mousePos]);
  // Blink animation
  useEffect(() => {
    if (!isVisible) return;

    const blinkInterval = setInterval(
      () => {
        setBlink(true);
        setTimeout(() => setBlink(false), 150);
      },
      2000 + Math.random() * 3000,
    );

    return () => clearInterval(blinkInterval);
  }, [isVisible]);

  // Proximity detection and glow effects
  useEffect(() => {
    if (!isVisible || step < 2) return;

    const checkProximity = () => {
      let targetElements = [];

      if (step === 2) {
        targetElements = [
          ...document.querySelectorAll('[role="toggleNav"]'),
          ...document.querySelectorAll(".toggleNav"),
          ...document.querySelectorAll('button[aria-label*="menu"]'),
          ...document.querySelectorAll(
            'button:has(svg[data-testid="MenuIcon"])',
          ),
        ];
      } else if (step === 3) {
        targetElements = [
          ...document.querySelectorAll('[aria-label*="Create"]'),
          ...document.querySelectorAll(
            'button:has(svg[data-testid="AddBoxIcon"])',
          ),
          ...document.querySelectorAll('button:contains("Create Document")'),
        ];
      }

      let minDistance = Infinity;
      targetElements.forEach((element) => {
        if (element) {
          const rect = element.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          const distance = Math.sqrt(
            Math.pow(mousePos.x - centerX, 2) +
              Math.pow(mousePos.y - centerY, 2),
          );
          minDistance = Math.min(minDistance, distance);
        }
      });

      if (minDistance < 80) {
        setGlowIntensity(1.4);
        setScale(1.15);
      } else if (minDistance < 150) {
        setGlowIntensity(1.1);
        setScale(1.08);
      } else {
        setGlowIntensity(0.6);
        setScale(1);
      }
    };

    animationFrameRef.current = requestAnimationFrame(checkProximity);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [mousePos, step, isVisible]);

  // Move jellyfish to target positions - keeping within bounds
  useEffect(() => {
    if (!isVisible || !isInitialized || !containerSize.width) return;

    let targetPos = { x: containerSize.width / 2, y: containerSize.height / 2 };

    // Only set target positions for guided steps, otherwise let mouse avoidance handle movement
    if (step === 2) {
      targetPos = {
        x: Math.max(150, Math.min(containerSize.width - 150, 150)),
        y: Math.max(100, Math.min(containerSize.height - 200, 100)),
      };
    } else if (step === 3) {
      targetPos = {
        x: containerSize.width / 2,
        y: Math.max(
          200,
          Math.min(containerSize.height - 200, containerSize.height / 2 + 50),
        ),
      };
    } else if (step === 4) {
      targetPos = {
        x: Math.max(
          200,
          Math.min(containerSize.width - 200, containerSize.width / 2 - 100),
        ),
        y: Math.max(
          200,
          Math.min(containerSize.height - 100, containerSize.height - 200),
        ),
      };
    } else {
      // For other steps, don't force movement to specific positions
      return;
    }

    const moveJellyfish = () => {
      setJellyfishPos((prev) => ({
        x: prev.x + (targetPos.x - prev.x) * 0.02, // Slower movement
        y: prev.y + (targetPos.y - prev.y) * 0.02,
      }));
    };

    const moveInterval = setInterval(moveJellyfish, 16);
    return () => clearInterval(moveInterval);
  }, [step, isVisible, isInitialized, containerSize]);

  // Handle step progression
  useEffect(() => {
    if (!isVisible) return;

    const handleClick = (e) => {
      const target = e.target.closest('button, [role="button"]');
      if (!target) return;

      if (step === 2) {
        // Check for menu button
        if (
          target.querySelector('[data-testid="MenuIcon"]') ||
          target.getAttribute("role") === "toggleNav" ||
          target.classList.contains("toggleNav")
        ) {
          setTimeout(() => setStep(3), 1000);
        }
      } else if (step === 3) {
        // Check for create document button
        if (
          target.querySelector('[data-testid="AddBoxIcon"]') ||
          target.getAttribute("aria-label")?.includes("Create") ||
          target.textContent?.includes("Create Document")
        ) {
          setTimeout(() => setStep(4), 1000);
        }
      }
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [step, isVisible]);

  // Update message when step changes
  useEffect(() => {
    if (messages[step]) {
      setCurrentMessage(messages[step]);
      setMessageComplete(false);
    }
  }, [step]);

  const handleClose = useCallback(() => {
    localStorage.setItem("helper", "true");
    setIsVisible(false);
  }, []);

  const handleMessageComplete = useCallback(() => {
    setMessageComplete(true);
    if (step === 1) {
      setTimeout(() => setStep(2), 1500);
    }
  }, [step]);

  if (!isVisible || !isInitialized) return null;

  return (
    <>
      {/* Overlay container */}
      <Box
        ref={containerRef}
        data-jellyfish-helper
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 9999,
          pointerEvents: "none",
          overflow: "hidden", // Prevent any overflow
        }}
      >
        {/* Chat bubble - positioned independently and never covers jellyfish */}
        {currentMessage && (
          <ChatBubble
            isVisible={true}
            jellyfishPos={jellyfishPos}
            containerSize={containerSize}
            onClose={handleClose}
          >
            <Box>
              <TypewriterText
                text={currentMessage}
                speed={30}
                onComplete={handleMessageComplete}
                variant="body1"
              />

              {/* Step 4 specific content */}
              {step === 4 && messageComplete && (
                <Grow in={true} timeout={500}>
                  <Box sx={{ mt: 2 }}>
                    <Chip
                      label="/ custom contract"
                      variant="outlined"
                      sx={{
                        fontFamily: "monospace",
                        fontSize: "0.875rem",
                        backgroundColor: "action.hover",
                      }}
                    />
                    <Typography
                      variant="body2"
                      sx={{ mt: 1, color: "text.secondary" }}
                    >
                      Then press Enter to execute
                    </Typography>
                  </Box>
                </Grow>
              )}
            </Box>
          </ChatBubble>
        )}

        {/* Jellyfish Helper - highest z-index to always be visible */}
        <motion.div
          ref={jellyfishRef}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{
            opacity: 1,
            scale: 1,
            x: Math.max(
              50,
              Math.min(containerSize.width - 150, jellyfishPos.x - 50),
            ),
            y: Math.max(
              50,
              Math.min(containerSize.height - 150, jellyfishPos.y - 50),
            ),
          }}
          transition={{
            opacity: { duration: 0.5 },
            scale: { duration: 0.5 },
            x: { duration: 0.8, ease: "easeOut" },
            y: { duration: 0.8, ease: "easeOut" },
          }}
          style={{
            position: "absolute",
            width: 100,
            height: 100,
            pointerEvents: "auto",
            zIndex: 10000, // Highest z-index
          }}
          whileHover={{ scale: 1.05 }}
        >
          {/* Jellyfish */}
          <Box sx={{ position: "relative" }}>
            <motion.div
              animate={{
                y: [0, -8, 0],
                rotate: [0, 1, -1, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <JellyfishSVG
                scale={scale}
                eyePos={eyePos}
                blink={blink}
                glowIntensity={glowIntensity}
              />
            </motion.div>
          </Box>
        </motion.div>
      </Box>
    </>
  );
}

export default GetStartedHelper;
