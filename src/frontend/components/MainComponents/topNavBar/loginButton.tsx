import React from "react";
import { useSelector } from "react-redux";
import { Button, LinearProgress, useTheme } from "@mui/material";
import { RootState } from "@/redux/reducers";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router";

interface LoginButtonProps {
  isMobile?: boolean;
  sx?: React.CSSProperties | Record<string, unknown>;
  userType?: string;
  children?: React.ReactNode;
  variant?: "contained" | "outlined" | "text";
}

const LoginButton: React.FC<LoginButtonProps> = ({
  isMobile = false,
  sx = {},
  children = null,
  userType = null,
  variant = "contained",
}) => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const { isFetching } = useSelector((state: RootState) => state.uiState);

  if (isFetching) {
    return (
      <LinearProgress
        sx={{
          width: isMobile ? "100%" : 120,
          height: 10,
        }}
      />
    );
  }
  const defualtText = isMobile ? "Get started" : "Get Started";

  return (
    <Button
      variant={variant}
      onClick={async () => {
        if (userType) {
          localStorage.setItem("UserType", userType);

          // Navigate to specific pages for these userTypes and then login
          if (
            userType === "/" ||
            userType === "calendar" ||
            userType === "contracts" ||
            userType === "AFFILIATE"
          ) {
            navigate(`/${userType}`);
          }
        }
        await login();
      }}
      sx={{
        fontWeight: 600,
        textTransform: "none",
        minHeight: 48,
        px: isMobile ? 2 : 3,
        fontSize: isMobile ? "0.875rem" : "1rem",
        whiteSpace: "nowrap",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor:
          variant === "contained" ? theme.palette.primary.main : "transparent",
        color:
          variant === "contained"
            ? theme.palette.primary.contrastText
            : theme.palette.text.primary,
        border:
          variant === "outlined"
            ? `2px solid ${theme.palette.primary.main}`
            : "none",
        boxShadow:
          variant === "contained"
            ? `0 4px 12px ${theme.palette.mode === "dark" ? "rgba(0, 0, 0, 0.4)" : "rgba(0, 0, 0, 0.15)"}`
            : "none",
        "&:hover": {
          backgroundColor:
            variant === "contained"
              ? theme.palette.primary.dark
              : theme.palette.action.hover,
          boxShadow:
            variant === "contained"
              ? `0 6px 16px ${theme.palette.mode === "dark" ? "rgba(0, 0, 0, 0.5)" : "rgba(0, 0, 0, 0.2)"}`
              : "none",
          transform: "translateY(-1px)",
          borderColor:
            variant === "outlined" ? theme.palette.primary.dark : undefined,
        },
        transition: "all 0.2s ease-in-out",
        ...sx,
      }}
    >
      {children ? children : defualtText}
    </Button>
  );
};
export default LoginButton;
