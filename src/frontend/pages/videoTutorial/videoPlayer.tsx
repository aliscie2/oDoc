import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player";
import useIsInViewport from "./useViewPort";

const VideoPlayer = ({ 
  video, 
  startTime, 
  style 
}: { 
  video: Tutorial; 
  startTime?: number;
  style?: React.CSSProperties;
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<ReactPlayer>(null);
  const isInViewport = useIsInViewport(containerRef, 0.5);
  const [isReady, setIsReady] = useState(false);

  const handleReady = () => {
    setIsReady(true);
  };

  useEffect(() => {
    if (!playerRef.current || !isReady) return;

    if (isInViewport) {
      playerRef.current.getInternalPlayer()?.playVideo?.() ||
        playerRef.current.getInternalPlayer()?.play?.();
    } else {
      // Use the pause method directly for better compatibility
      playerRef.current.getInternalPlayer()?.pauseVideo?.() ||
        playerRef.current.getInternalPlayer()?.pause?.();
    }
  }, [isInViewport, isReady]);

  return (
    <Box
      ref={containerRef}
      sx={{ 
        height: "100%", 
        width: "100%",
        display: "flex", 
        flexDirection: "column",
        position: "relative",
        // Remove any default margins/padding
        margin: 0,
        padding: 0,
        // Ensure full coverage
        overflow: "hidden",
        // Additional styles from parent
        ...style,
        // Override ReactPlayer container styles
        "& > div": {
          width: "100% !important",
          height: "100% !important",
        },
        // Target the actual video element
        "& video": {
          width: "100% !important",
          height: "100% !important",
          objectFit: "cover !important",
          margin: "0 !important",
          padding: "0 !important",
        },
        // Target YouTube iframe
        "& iframe": {
          width: "100% !important",
          height: "100% !important",
          margin: "0 !important",
          padding: "0 !important",
          border: "none !important",
        },
      }}
    >
      <ReactPlayer
        ref={playerRef}
        url={video.videoUrl}
        width="100%"
        height="100%"
        controls={true}
        playing={isInViewport}
        volume={1}
        onReady={handleReady}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          margin: 0,
          padding: 0,
        }}
        config={{
          youtube: {
            playerVars: {
              start: startTime,
              origin: window.location.origin,
              enablejsapi: 1,
              // Additional YouTube parameters for better fullscreen behavior
              modestbranding: 1,
              rel: 0,
              showinfo: 0,
              iv_load_policy: 3,
            },
          },
          // Add config for other video types if needed
          vimeo: {
            playerOptions: {
              responsive: true,
            }
          },
          file: {
            attributes: {
              style: {
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }
            }
          }
        }}
      />
    </Box>
  );
};

export default VideoPlayer;