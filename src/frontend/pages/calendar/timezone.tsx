import React, { useState, useEffect } from "react";

interface TimeZoneSelectorProps {
  onTimeZoneChange?: (newTimeZone: string) => void;
}

const TimeZoneSelector: React.FC<TimeZoneSelectorProps> = ({
  onTimeZoneChange,
}) => {
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

    updateTime();
    const timer = setInterval(updateTime, 1000);

    return () => clearInterval(timer);
  }, []);

  // const handleChange = (newZone: string | null) => {
  //   if (newZone && timeZones.includes(newZone)) {
  //     dispatch({ type: "SET_TIMEZONE", current_timezone: newZone });
  //     // setCurrent_timezone(newZone);
  //     onTimeZoneChange(newZone);
  //   }
  // };

  // return (
  //   <Autocomplete
  //     sx={{
  //       width: "350px",
  //     }}
  //     disabled={true}
  //     value={currentTime +" "+ current_timezone}
  //     onChange={(_, newValue) => handleChange(newValue)}
  //     options={timeZones}
  //     renderInput={(params) => (
  //       <TextField {...params} label="Select Time Zone" />
  //     )}
  //   />
  // );
  return (
    <span style={{ fontSize: "0.875rem", color: "text.secondary" }}>
      {currentTime} {Intl.DateTimeFormat().resolvedOptions().timeZone}
    </span>
  );
};

export default TimeZoneSelector;
