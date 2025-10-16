import React, { useEffect, useState } from "react";
import { styled, keyframes } from "@mui/material/styles";
import { Box, Tooltip, Typography } from "@mui/material";

const appear = keyframes`
  0% { transform: scale(0.8); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
`;

const growCircle = keyframes`
  0% { stroke-dashoffset: 283; }
  100% { stroke-dashoffset: var(--final-offset); }
`;

const BadgeContainer = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 2,
});

const CircleContainer = styled(Box)({
  position: "relative",
  width: 120,
  height: 120,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  animation: `${appear} 0.6s ease`,
});

const LevelText = styled(Typography)(({ theme }) => ({
  position: "absolute",
  fontWeight: 700,
  fontSize: "1.1rem",
  color: theme.palette.text.primary,
  textAlign: "center",
  userSelect: "none",
}));

const LevelLabel = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  fontSize: "0.95rem",
  color: theme.palette.text.secondary,
  textAlign: "center",
}));

interface UserLevel {
  name: string;
  color: string;
  minScore: number;
  description: string;
}

const USER_LEVELS: UserLevel[] = [
  {
    name: "Rookie",
    color: "#9E9E9E",
    minScore: 0,
    description: "Just getting started on your journey",
  },
  {
    name: "Apprentice",
    color: "#FF9800",
    minScore: 1,
    description: "Learning the ropes",
  },
  {
    name: "Skilled",
    color: "#2196F3",
    minScore: 2,
    description: "Building solid experience",
  },
  {
    name: "Expert",
    color: "#9C27B0",
    minScore: 3,
    description: "Mastering your craft",
  },
  {
    name: "Master",
    color: "#4CAF50",
    minScore: 4,
    description: "Among the best",
  },
  {
    name: "Legend",
    color: "#FFD700",
    minScore: 4.5,
    description: "Elite status achieved",
  },
];

const getUserLevel = (score: number): UserLevel => {
  for (let i = USER_LEVELS.length - 1; i >= 0; i--) {
    if (score >= USER_LEVELS[i].minScore) {
      return USER_LEVELS[i];
    }
  }
  return USER_LEVELS[0];
};

interface UserLevelBadgeProps {
  actions_rate: number;
  size?: number;
  showLabel?: boolean;
}

const UserLevelBadge: React.FC<UserLevelBadgeProps> = ({
  actions_rate,
  size = 120,
  showLabel = true,
}) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(actions_rate), 300);
    return () => clearTimeout(timer);
  }, [actions_rate]);

  const level = getUserLevel(animatedScore);
  const percentage = Math.min((animatedScore / 5) * 100, 100);
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (percentage / 100) * circumference;

  const radius = size / 2;
  const strokeWidth = 8;
  const normalizedRadius = radius - strokeWidth / 2;

  return (
    <BadgeContainer>
      <Tooltip
        title={
          <Box sx={{ textAlign: "center", p: 0.5 }}>
            <Typography variant="body2" fontWeight={600}>
              {level.name}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              {level.description}
            </Typography>
            <Typography
              variant="caption"
              display="block"
              sx={{ mt: 0.5, opacity: 0.8 }}
            >
              Score: {animatedScore.toFixed(1)} / 5.0
            </Typography>
          </Box>
        }
        arrow
        placement="top"
      >
        <CircleContainer sx={{ width: size, height: size }}>
          <svg
            width={size}
            height={size}
            style={{ transform: "rotate(-90deg)" }}
          >
            {/* Background circle */}
            <circle
              cx={radius}
              cy={radius}
              r={normalizedRadius}
              fill="none"
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth={strokeWidth}
            />
            {/* Progress circle */}
            <circle
              cx={radius}
              cy={radius}
              r={normalizedRadius}
              fill="none"
              stroke={level.color}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              style={{
                transition: "stroke-dashoffset 1s ease, stroke 0.3s ease",
                filter: `drop-shadow(0 0 6px ${level.color}80)`,
              }}
            />
          </svg>
          <LevelText>{animatedScore.toFixed(1)}</LevelText>
        </CircleContainer>
      </Tooltip>
      {showLabel && (
        <LevelLabel sx={{ color: level.color }}>{level.name}</LevelLabel>
      )}
    </BadgeContainer>
  );
};

export default UserLevelBadge;
