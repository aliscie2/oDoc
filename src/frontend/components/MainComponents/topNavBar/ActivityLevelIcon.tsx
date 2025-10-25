import React from "react";
import { Box, Tooltip } from "@mui/material";
import SignalCellularAltIcon from "@mui/icons-material/SignalCellularAlt";
import SignalCellularAlt1BarIcon from "@mui/icons-material/SignalCellularAlt1Bar";
import SignalCellularAlt2BarIcon from "@mui/icons-material/SignalCellularAlt2Bar";

interface ActivityLevelIconProps {
  level: number;
  size?: number;
}

const getActivityLevel = (score: number) => {
  if (score >= 4)
    return {
      icon: SignalCellularAltIcon,
      label: "High Activity",
      color: "#4CAF50",
    };
  if (score >= 2.5)
    return {
      icon: SignalCellularAlt2BarIcon,
      label: "Medium Activity",
      color: "#FF9800",
    };
  if (score >= 1)
    return {
      icon: SignalCellularAlt1BarIcon,
      label: "Low Activity",
      color: "#2196F3",
    };
  return {
    icon: SignalCellularAlt1BarIcon,
    label: "Starter",
    color: "#F44336",
  };
};

const ActivityLevelIcon: React.FC<ActivityLevelIconProps> = ({
  level,
  size = 24,
}) => {
  const activity = getActivityLevel(level);
  const Icon = activity.icon;

  return (
    <Tooltip title={`${activity.label} (${level.toFixed(1)})`} arrow>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Icon sx={{ fontSize: size, color: activity.color }} />
      </Box>
    </Tooltip>
  );
};

export default ActivityLevelIcon;
