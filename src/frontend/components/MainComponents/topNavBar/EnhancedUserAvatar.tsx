import React, { useEffect, useState } from "react";
import { styled, keyframes } from "@mui/material/styles";
import { Box, Tooltip, tooltipClasses, TooltipProps } from "@mui/material";
import { Person } from "@mui/icons-material";
import ODOCTokenImage from "@/assets/ODOCTOKEN.png";

const appear = keyframes`
  0% { transform: scale(0.8); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
`;

const growCircle = keyframes`
  0% { clip-path: polygon(50% 0%, 50% 0%, 50% 0%, 50% 0%, 50% 0%); }
  100% { clip-path: var(--final-clip-path); }
`;

const TrustCircle = styled(Box)(({ score }) => {
  const finalClipPath =
    score === 5
      ? "circle(50%)"
      : score >= 4
        ? "polygon(50% 0%, 100% 0%, 100% 100%, 50% 100%, 50% 0)"
        : score >= 3
          ? "polygon(50% 0%, 100% 0%, 100% 75%, 50% 75%, 50% 0)"
          : score >= 2
            ? "polygon(50% 0%, 100% 0%, 100% 50%, 50% 50%, 50% 0)"
            : "polygon(50% 0%, 100% 0%, 100% 25%, 50% 25%, 50% 0)";

  return {
    position: "relative",
    width: 34,
    height: 34,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    "--final-clip-path": finalClipPath,

    "&:hover": { transform: "scale(1.05)" },

    "&::before": {
      content: '""',
      position: "absolute",
      width: "calc(100% + 6px)",
      height: "calc(100% + 6px)",
      borderRadius: "50%",
      border: `2px solid ${getTrustColor(score)}`,
      boxShadow: `0 0 8px ${getTrustColor(score)}`,
      animation: `${appear} 1s ease, ${growCircle} 1.2s ease forwards`,
      clipPath: "var(--final-clip-path)",
    },
  };
});

const Avatar = styled(Box)({
  width: 26,
  height: 26,
  borderRadius: "50%",
  overflow: "hidden",
  backgroundColor: "rgba(255, 255, 255, 0.1)",
  backdropFilter: "blur(8px)",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

const AvatarImage = styled("img")({
  width: "100%",
  height: "100%",
  objectFit: "cover",
});

const FallbackAvatar = styled(Box)(({ score }) => ({
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: `linear-gradient(135deg, ${getTrustColor(score)}20, ${getTrustColor(score)}40)`,
  color: getTrustColor(score),
  fontSize: "0.75rem",
  fontWeight: "bold",
}));

const getTrustColor = (score: number) => {
  if (score >= 4.5) return "#4CAF50";
  if (score >= 4) return "#8BC34A";
  if (score >= 3.5) return "#FFC107";
  if (score >= 3) return "#FF9800";
  return "#F44336";
};

const generateInitials = (email = "", name = "") => {
  if (name)
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  if (email) {
    const parts = email.split("@")[0].split(/[._-]/);
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : email[0].toUpperCase();
  }
  return "U";
};

interface EnhancedUserAvatarProps {
  actions_rate: number;
  photo?: string;
  email?: string;
  name?: string;
  style?: React.CSSProperties;
}

const EnhancedUserAvatar: React.FC<EnhancedUserAvatarProps> = ({
  actions_rate,
  photo,
  email,
  name,
  style,
}) => {
  const [imgError, setImgError] = useState(!photo);
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(actions_rate), 300);
    return () => clearTimeout(timer);
  }, [actions_rate]);

  useEffect(() => {
    setImgError(!photo);
  }, [photo]);

  const initials = generateInitials(email, name);

  return (
    <TrustCircle score={animatedScore} style={style}>
      <Avatar>
        {!imgError && photo ? (
          <AvatarImage
            src={photo}
            alt="Avatar"
            onError={() => setImgError(true)}
          />
        ) : (
          <FallbackAvatar score={actions_rate}>
            {initials !== "U" ? initials : <Person sx={{ fontSize: 16 }} />}
          </FallbackAvatar>
        )}
      </Avatar>
    </TrustCircle>
  );
};

export default EnhancedUserAvatar;
