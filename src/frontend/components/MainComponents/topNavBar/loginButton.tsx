import React from "react";
import { useSelector } from "react-redux";
import { Button, LinearProgress } from "@mui/material";
import { RootState } from "@/redux/reducers";
import { useAuth } from "@/hooks/useAuth";
import DfnIcon from "@/assets/dfn.svg";

interface LoginButtonProps {
  isMobile?: boolean;
  sx?: React.CSSProperties | any;
}

const LoginButton: React.FC<LoginButtonProps> = ({
  isMobile = false,
  sx = {},
  children = null,
}) => {
  const { login } = useAuth();
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
  const defualtText = isMobile ? "Get started" : "Login with Internet Identity";

  return (
    <Button
      variant="contained"
      onClick={login}
      startIcon={
        <img
          src={DfnIcon}
          alt="Internet Identity"
          style={{ width: 20, height: 20 }}
        />
      }
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
        boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
        "&:hover": {
          background: "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
          boxShadow: "0 6px 16px rgba(102, 126, 234, 0.4)",
          transform: "translateY(-1px)",
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
