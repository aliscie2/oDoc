import React from "react";
import { useSelector } from "react-redux";
import { Button, LinearProgress, BottomNavigationAction } from "@mui/material";
import { Person2 as Person2Icon } from "@mui/icons-material";
import { RootState } from "../../../redux/reducers";
import { useBackendContext } from "../../../contexts/BackendContext";
import DfnIcon from "@/assets/dfn.svg";

interface LoginButtonProps {
  isMobile?: boolean;
  sx?: React.CSSProperties | any;
}

const LoginButton: React.FC<LoginButtonProps> = ({
  isMobile = false,
  sx = {},
}) => {
  const { login } = useBackendContext();
  const { isFetching } = useSelector((state: RootState) => state.uiState);

  const handleLogin = async () => {
    await login();
  };

  if (isFetching) {
    return (
      <LinearProgress
        sx={{
          width: isMobile ? "100%" : 120,
          height: 10,
          borderRadius: 2,
        }}
      />
    );
  }

  if (isMobile) {
    return (
      <BottomNavigationAction
        label="Login"
        icon={
          <>
            <img
              src={DfnIcon}
              alt="Internet Identity"
              style={{ width: 20, height: 20 }}
            />
            <Person2Icon />
          </>
        }
        onClick={handleLogin}
        sx={{ height: "100%" }}
      />
    );
  }

  return (
    <Button
      variant="contained"
      onClick={handleLogin}
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
        borderRadius: 3,
        height: "100%",
        minHeight: 48,
        px: 3,
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
      Login with Internet Identity
    </Button>
  );
};

export default LoginButton;
