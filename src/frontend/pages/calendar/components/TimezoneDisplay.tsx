import React, { useState, useEffect, memo } from "react";
import { Typography, useTheme } from "@mui/material";

interface TimezoneDisplayProps {
  onTimeZoneChange?: (newTimeZone: string) => void;
}

/**
 * TimezoneDisplay Component
 * Displays current time and timezone with real-time updates
 */
const TimezoneDisplay: React.FC<TimezoneDisplayProps> = memo(({
  onTimeZoneChange,
}) => {
  const theme = useTheme();
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      setCurrentTime(formatter.format(new Date()));
    };

    // Initial update
    updateTime();
    
    // Update every second
    const timer = setInterval(updateTime, 1000);

    // Cleanup on unmount
    return () => clearInterval(timer);
  }, []);

  return (
    <Typography 
      variant="caption" 
      sx={{ 
        color: "text.secondary",
        fontWeight: 500,
        letterSpacing: 0.3,
      }}
    >
      {currentTime} {Intl.DateTimeFormat().resolvedOptions().timeZone}
    </Typography>
  );
});

TimezoneDisplay.displayName = "TimezoneDisplay";

export default TimezoneDisplay;
