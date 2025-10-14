import React, { useState, useEffect } from "react";
import { styled } from "@mui/material/styles";
import { Box } from "@mui/material";
import { Person } from "@mui/icons-material";

const Avatar = styled(Box)({
  width: 34,
  height: 34,
  borderRadius: "50%",
  overflow: "hidden",
  backgroundColor: "rgba(255, 255, 255, 0.1)",
  backdropFilter: "blur(8px)",
  border: "2px solid rgba(255, 255, 255, 0.3)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  transition: "transform 0.2s ease, border-color 0.2s ease",
  
  "&:hover": { 
    transform: "scale(1.05)",
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
});

const AvatarImage = styled("img")({
  width: "100%",
  height: "100%",
  objectFit: "cover",
});

const FallbackAvatar = styled(Box)({
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "linear-gradient(135deg, rgba(100, 100, 255, 0.3), rgba(150, 100, 255, 0.4))",
  color: "rgba(255, 255, 255, 0.9)",
  fontSize: "0.85rem",
  fontWeight: "600",
});

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
  photo?: string;
  email?: string;
  name?: string;
  style?: React.CSSProperties;
}

const EnhancedUserAvatar: React.FC<EnhancedUserAvatarProps> = ({
  photo,
  email,
  name,
  style,
}) => {
  const [imgError, setImgError] = useState(false);

  // Reset error state when photo changes
  useEffect(() => {
    setImgError(false);
  }, [photo]);

  const initials = generateInitials(email, name);

  return (
    <Avatar style={style}>
      {!imgError && photo ? (
        <AvatarImage
          src={photo}
          alt="Avatar"
          onError={() => setImgError(true)}
        />
      ) : (
        <FallbackAvatar>
          {initials !== "U" ? initials : <Person sx={{ fontSize: 18 }} />}
        </FallbackAvatar>
      )}
    </Avatar>
  );
};

// Memoize with custom comparison to prevent re-renders when style object changes
export default React.memo(EnhancedUserAvatar, (prevProps, nextProps) => {
  return (
    prevProps.photo === nextProps.photo &&
    prevProps.email === nextProps.email &&
    prevProps.name === nextProps.name &&
    prevProps.style?.width === nextProps.style?.width &&
    prevProps.style?.height === nextProps.style?.height
  );
});
