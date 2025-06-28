import { useState, useEffect } from "react";
import {
  Handshake,
  Security,
  Analytics,
  Star,
  Warning,
  CheckCircle,
  TrendingUp,
  Speed,
  Shield,
  People,
  Email,
  LinkedIn,
  Twitter,
  GitHub,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { Box, Typography } from "@mui/material";
import {
  LogoSVG,
  MagnifierSVG,
  JellyfishSVG,
  AnimationStyles,
} from "./animations";
import { useSelector } from "react-redux";

// Animation configurations
const ANIMATIONS = {
  "404": { class: "wobble", eyePattern: "random" },
  Security: { class: "alert", eyePattern: "scan" },
  MultiTask: { class: "active", eyePattern: "switch" },
  Searching: { class: "float", eyePattern: "search" },
  Error: { class: "droop", eyePattern: "sad" },
  Celebrate: { class: "bounce", eyePattern: "excited" },
  handShake: { class: "gentle", eyePattern: "friendly" },
  watch: { class: "float", eyePattern: "follow" },
  Loading: { class: "pulse", eyePattern: "circle" },
  logo: { class: "float", eyePattern: "surprised" }, // Changed to surprised
};

// Icon mapping (excluding Search for creative implementation)
const ICONS = {
  Security: Security,
  MultiTask: Analytics,
  Error: Warning,
  Celebrate: Star,
  handShake: Handshake,
  watch: null,
  Loading: TrendingUp,
};

export default function EmotionalAnimation({
  absolute= false,
  type = "404",
  title = "",
  description = "",
  size = "md",
}) {
  const { isDarkMode } = useSelector((state: any) => state.uiState);

  const theme = useTheme();
  const [eyePos, setEyePos] = useState({ x: 0, y: 0 });
  const [blink, setBlink] = useState(false);
  const [scale, setScale] = useState(1);
  const [phase, setPhase] = useState(0);
  const [magnifierPos, setMagnifierPos] = useState({ x: 0, y: 0 });
  const [magnifierRotation, setMagnifierRotation] = useState(0);

  // Size configuration
  const getSizeConfig = (size) => {
    const configs = {
      xs: { width: 70, scale: 0.3, iconSize: 20 },
      sm: { width: 180, scale: 0.6, iconSize: 36 },
      md: { width: 300, scale: 1, iconSize: 48 },
      lg: { width: 420, scale: 1.4, iconSize: 64 },
      xl: { width: 540, scale: 1.8, iconSize: 80 },
    };
    return typeof size === "number"
      ? { width: size, scale: size / 300, iconSize: Math.max(28, size / 8) }
      : configs[size] || configs.md;
  };

  const config = getSizeConfig(size);
  const animation = ANIMATIONS[type] || ANIMATIONS["404"];

  // Get theme-based colors
  const getIconColor = () => {
    switch (type) {
      case "Error":
        return theme.palette.error.main;
      case "Security":
        return theme.palette.warning.main;
      case "Celebrate":
        return theme.palette.success.main;
      case "Loading":
        return theme.palette.info.main;
      default:
        return theme.palette.primary.main;
    }
  };

  // Jiggly tentacle animation
  const getTentaclePath = (basePath, index) => {
    const p = ((phase + index * 80) * Math.PI) / 180;
    const jiggle1 = Math.sin(p * 2) * 1.5;
    const jiggle2 = Math.sin(p * 2.5 + Math.PI / 4) * 1.2;
    const jiggle3 = Math.sin(p * 1.8 + Math.PI / 2) * 1.8;

    return basePath.replace(
      /C\s*([0-9.]+)\s*([0-9.]+)\s*([0-9.]+)\s*([0-9.]+)\s*([0-9.]+)\s*([0-9.]+)/g,
      (match, x1, y1, x2, y2, x3, y3) => {
        return `C ${parseFloat(x1) + jiggle1} ${parseFloat(y1) + jiggle2} ${parseFloat(x2) + jiggle2} ${parseFloat(y2) + jiggle3} ${x3} ${y3}`;
      },
    );
  };

  useEffect(() => {
    const intervals = [];

    // Blinking
    intervals.push(
      setInterval(
        () => {
          setBlink(true);
          setTimeout(() => setBlink(false), 150);
        },
        3000 + Math.random() * 4000,
      ),
    );

    // Breathing
    intervals.push(
      setInterval(() => {
        setScale((prev) => (prev === 1 ? 1.02 : 1));
      }, 2000),
    );

    // Tentacle animation
    intervals.push(
      setInterval(() => {
        setPhase((prev) => (prev + 1) % 360);
      }, 50),
    );

    // Eye movement patterns and magnifier animation
    let eyeInterval;
    let mouseHandler;

    switch (animation.eyePattern) {
      case "random":
        eyeInterval = setInterval(() => {
          setEyePos({
            x: (Math.random() - 0.5) * 40,
            y: (Math.random() - 0.5) * 30,
          });
        }, 500);
        break;

      case "scan":
        let scanPos = -25,
          scanDir = 1;
        eyeInterval = setInterval(() => {
          scanPos += scanDir * 5;
          if (scanPos > 25 || scanPos < -25) scanDir *= -1;
          setEyePos({ x: scanPos, y: -8 });
        }, 150);
        break;

      case "switch":
        const points = [
          { x: -20, y: -10 },
          { x: 20, y: -10 },
          { x: -15, y: 10 },
          { x: 15, y: 10 },
        ];
        let pointIndex = 0;
        eyeInterval = setInterval(() => {
          setEyePos(points[pointIndex]);
          pointIndex = (pointIndex + 1) % points.length;
        }, 400);
        break;

      case "search":
        // Special search animation with magnifier
        let searchAngle = 0;
        eyeInterval = setInterval(() => {
          const eyeRadius = 12;
          const eyeX = Math.cos(searchAngle) * eyeRadius;
          const eyeY = Math.sin(searchAngle) * eyeRadius;
          setEyePos({ x: eyeX, y: eyeY });

          // Magnifier follows the eye movement with offset
          const magnifierRadius = 60;
          const magnifierX =
            config.width * 0.3 + Math.cos(searchAngle + 0.3) * magnifierRadius;
          const magnifierY =
            config.width * 0.25 + Math.sin(searchAngle + 0.3) * magnifierRadius;
          setMagnifierPos({ x: magnifierX, y: magnifierY });
          setMagnifierRotation(searchAngle * 57.3 + 15); // Convert to degrees

          searchAngle += 0.08;
        }, 100);
        break;

      case "circle":
        let angle = 0;
        eyeInterval = setInterval(() => {
          setEyePos({
            x: Math.cos(angle) * 12,
            y: Math.sin(angle) * 8 - 5,
          });
          angle += 0.3;
        }, 100);
        break;

      case "excited":
        eyeInterval = setInterval(() => {
          setEyePos({
            x: (Math.random() - 0.5) * 25,
            y: -15 + Math.random() * 10,
          });
        }, 600);
        break;

      case "surprised":
        // New surprised pattern - look towards top left with small movements
        let surprisePhase = 0;
        eyeInterval = setInterval(() => {
          const baseX = -18; // Looking towards top left
          const baseY = -12;
          const wiggleX = Math.sin(surprisePhase * 0.1) * 3; // Small horizontal wiggle
          const wiggleY = Math.cos(surprisePhase * 0.15) * 2; // Small vertical wiggle

          setEyePos({
            x: baseX + wiggleX,
            y: baseY + wiggleY,
          });
          surprisePhase += 1;
        }, 100);
        break;

      case "follow":
        mouseHandler = (e) => {
          const rect = document
            .getElementById("jellyfish")
            ?.getBoundingClientRect();
          if (rect) {
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const mouseX = e.clientX - centerX;
            const mouseY = e.clientY - centerY;

            const maxDistance = 20;
            const distance = Math.sqrt(mouseX * mouseX + mouseY * mouseY);
            const scale = Math.min(distance / 120, 1) * maxDistance;

            setEyePos({
              x: (mouseX / distance) * scale || 0,
              y: (mouseY / distance) * scale || 0,
            });
          }
        };
        document.addEventListener("mousemove", mouseHandler);
        break;

      case "sad":
        setEyePos({ x: -5, y: 20 });
        break;

      case "friendly":
        setEyePos({ x: 0, y: -5 });
        break;

      default:
        setEyePos({ x: 0, y: 0 });
    }

    return () => {
      intervals.forEach(clearInterval);
      if (eyeInterval) clearInterval(eyeInterval);
      if (mouseHandler) document.removeEventListener("mousemove", mouseHandler);
    };
  }, [type, animation, config.width]);

  // Render icon
  const renderIcon = () => {
    const IconComponent = ICONS[type];
    if (!IconComponent) return null;

    return (
      <IconComponent
        sx={{
          fontSize: config.iconSize,
          color: getIconColor(),
          filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
        }}
      />
    );
  };

  return (
    <Box
      sx={{
        position: absolute?"absolute":"relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "inherit", // Inherit text color from parent
        backgroundColor: "inherit", // Inherit background from parent
      }}
    >
      <Box sx={{ textAlign: "center" }}>
        {/* Animation Container - Fixed spacing */}
        <Box
          sx={{
            mb: 4, // Increased margin bottom for better separation
            position: "relative",
            display: "flex", // Changed to flex
            justifyContent: "center", // Center the animation
            alignItems: "center",
            minHeight: `${config.width + 20}px`, // Ensure container has minimum height + padding
            width: "100%", // Ensure full width
          }}
        >
          <div className={`jellyfish-container anim-${animation.class}`}>
            {type === "logo" ? (
              <Box
                sx={{
                  position: "relative",
                  display: "block",
                  width: `${config.width}px`, // Set explicit width
                  height: `${config.width}px`, // Set explicit height
                  margin: "0 auto", // Center the animation
                }}
              >
                {" "}
                {/* Changed to block */}
                {/* Show both LogoSVG and JellyfishSVG for logo type */}
                <div className="logo-wrapper">
                  <LogoSVG size={config.width} />
                </div>
                <Box
                  sx={{
                    position: "absolute",
                    top: `${config.width * 0.3}px`, // Position vertically centered
                    left: `${config.width * 0.6}px`, // Position inside the C gap
                    transform: "scale(0.5)", // Make jellyfish slightly smaller to fit in gap
                    transformOrigin: "center center",
                  }}
                >
                  <JellyfishSVG
                    config={config}
                    scale={scale}
                    eyePos={eyePos}
                    blink={blink}
                    phase={phase}
                    getTentaclePath={getTentaclePath}
                    isSurprised={true} // Pass surprised state
                  />
                </Box>
                {/* Show icon alongside logo and jellyfish */}
                <Box
                  sx={{
                    position: "absolute",
                    top: `${config.width * 0.15}px`,
                    right: `${config.width * 0.15}px`,
                    zIndex: 2,
                  }}
                  className="icon-overlay"
                >
                  {renderIcon()}
                </Box>
              </Box>
            ) : (
              <Box
                sx={{
                  
                  position: absolute?"absolute":"relative",
                  display: "block",
                  width: `${config.width}px`, // Set explicit width
                  height: `${config.width}px`, // Set explicit height to prevent collapse
                  margin: "0 auto", // Center the animation
                }}
              >
                {" "}
                {/* Changed to block */}
                <JellyfishSVG
                  config={config}
                  scale={scale}
                  eyePos={eyePos}
                  blink={blink}
                  phase={phase}
                  getTentaclePath={getTentaclePath}
                />
                {/* Magnifier for search type */}
                {type === "Searching" && (
                  <MagnifierSVG
                    size={config.width * 0.25}
                    position={magnifierPos}
                    rotation={magnifierRotation}
                  />
                )}
                {/* Regular icon overlay for non-search types */}
                {type !== "Searching" && renderIcon() && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: `${config.width * 0.15}px`,
                      right: `${config.width * 0.15}px`,
                    }}
                    className="icon-overlay"
                  >
                    {renderIcon()}
                  </Box>
                )}
              </Box>
            )}
          </div>
        </Box>

        {/* Material-UI Typography Components */}
        {(title || description) && (
          <Box>
            {title && (
              <Typography
                variant="h4"
                component="h2"
                sx={{
                  fontWeight: 600,
                  mb: 2,
                  fontSize: `${config.scale * 2}rem`,
                  color: "text.primary", // Uses theme text color
                }}
              >
                {title}
              </Typography>
            )}
            {description && (
              <Typography
                variant="body1"
                sx={{
                  color: "text.secondary", // Uses theme secondary text color
                  fontSize: `${Math.max(config.scale * 1.25, 1.1)}rem`,
                  lineHeight: 1.6,
                  maxWidth: "450px",
                  mx: "auto",
                  fontWeight: 400,
                  letterSpacing: "0.02em",
                }}
              >
                {description}
              </Typography>
            )}
          </Box>
        )}
      </Box>

      <AnimationStyles />
    </Box>
  );
}
