import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  IconButton,
  TextField,
  Button,
  Avatar,
  Divider,
  Collapse,
  Fade,
} from "@mui/material";
import {
  Search,
  Event,
  Folder,
  Warning,
  Chat,
  Send,
  Refresh,
  Undo,
  Redo,
  Person,
} from "@mui/icons-material";

// Base Card Component

export const BaseCard = ({
  children,
  onMouseEnter,
  onMouseLeave,
  onClick,
  isVisible = true,
}) => {
  const cardStyle = {
    
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "16px",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    cursor: "pointer",
    "&:hover": {
      transform: "translateY(-4px)",
      boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
      border: "1px solid rgba(255,255,255,0.2)",
    },
  };

  if (!isVisible) return null;

  return (
    <Fade in={isVisible}>
      <Card
        sx={cardStyle}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onClick={onClick}
      >
        <CardContent>{children}</CardContent>
      </Card>
    </Fade>
  );
};

// Card Header Component
export const CardHeader = ({ icon, title, }) => (
  <Box display="flex" alignItems="center" mb={2}>
    {React.cloneElement(icon, { sx: { mr: 2 } })}
    <Typography variant="h6" sx={{ fontWeight: 600 }}>
      {title}
    </Typography>
  </Box>
);
