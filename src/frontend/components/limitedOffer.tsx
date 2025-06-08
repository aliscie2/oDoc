import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Alert,
  Box,
  Typography,
  IconButton,
  Link,
  Slide,
  Fade,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useBackendContext } from "../contexts/BackendContext";
import ODOCTokenImage from "@/assets/ODOCTOKEN.png";

const PromoNotification: React.FC = () => {
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [userCount, setUserCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const { isLoggedIn } = useSelector((state: any) => state.uiState);
  const navigate = useNavigate();
  const location = useLocation();
  const isOfferPage = location.pathname === "/offer";
  const { backendActor } = useBackendContext();
  const theme = useTheme();

  // Auto-dismiss after 15 seconds
  useEffect(() => {
    if (!isLoggedIn && isVisible) {
      const timer = setTimeout(() => setIsVisible(false), 15000);
      return () => clearTimeout(timer);
    }
  }, [isLoggedIn, isVisible]);

  // Fetch user data
  useEffect(() => {
    const fetchData = async () => {
      if (backendActor) {
        try {
          const snsStatus = await backendActor.get_sns_status();
          if ("Ok" in snsStatus) {
            setUserCount(snsStatus.Ok.active_users);
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchData();
  }, [backendActor]);

  // Don't show if logged in
  if (isLoggedIn) return null;

  const handleClaimReward = () => {
    navigate("/offer");
    setIsVisible(false);
  };

  // Enhanced background for better contrast
  const getNotificationBackground = () => {
    if (theme.palette.mode === 'dark') {
      return {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
      };
    }
    return {
      backgroundColor: theme.palette.background.paper,
      backdropFilter: 'blur(8px)',
      border: '1px solid',
      borderColor: theme.palette.divider,
    };
  };

  const getArrowColors = () => {
    if (theme.palette.mode === 'dark') {
      return {
        borderColor: 'rgba(255, 255, 255, 0.2)',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
      };
    }
    return {
      borderColor: theme.palette.divider,
      backgroundColor: theme.palette.background.paper,
    };
  };

  const arrowColors = getArrowColors();

  return (
    <Box
      sx={{
        position: "fixed",
        top: 16,
        left: 16,
        right: 16,
        zIndex: 9999,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Slide direction="down" in={isVisible} mountOnEnter unmountOnExit>
        <Box sx={{ position: "relative", display: "flex", alignItems: "center" }}>
          {/* Large ODOC Token - positioned outside */}
          <Box
            sx={{
              position: "absolute",
              left: -60,
              zIndex: 1,
              width: 120,
              height: 120,
            }}
          >
            <img
              src={ODOCTokenImage}
              alt="ODOC Token"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.3))",
              }}
            />
          </Box>

          <Alert
            severity="info"
            sx={{
              maxWidth: 600,
              width: "100%",
              ml: 8,
              ...getNotificationBackground(),
              boxShadow: theme.palette.mode === 'dark' 
                ? '0 8px 32px rgba(0, 0, 0, 0.5)' 
                : theme.shadows[2],
              position: "relative",
              '& .MuiAlert-icon': {
                display: 'none',
              },
              // Speech bubble arrow pointing to the coin
              '&::before': {
                content: '""',
                position: 'absolute',
                left: -10,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 0,
                height: 0,
                borderTop: '10px solid transparent',
                borderBottom: '10px solid transparent',
                borderRight: '10px solid',
                borderRightColor: arrowColors.borderColor,
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                left: -9,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 0,
                height: 0,
                borderTop: '10px solid transparent',
                borderBottom: '10px solid transparent',
                borderRight: '10px solid',
                borderRightColor: arrowColors.backgroundColor,
              },
            }}
            action={
              <IconButton
                size="small"
                onClick={() => setIsVisible(false)}
                sx={{ 
                  color: "text.secondary",
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'dark' 
                      ? 'rgba(255, 255, 255, 0.1)' 
                      : 'rgba(0, 0, 0, 0.04)',
                  },
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            }
          >
            <Box sx={{ pl: 2 }}>
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  fontWeight: 600, 
                  mb: 0.5,
                  color: "text.primary"
                }}
              >
                Earn tokens for your activity
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <Fade in={!isLoading}>
                  <span>
                    {isLoading ? "Loading..." : `${userCount}/100 active users`}
                  </span>
                </Fade>
                {!isOfferPage && (
                  <>
                    {" • "}
                    <Link
                      component="button"
                      variant="body2"
                      onClick={handleClaimReward}
                      sx={{
                        textDecoration: "underline",
                        cursor: "pointer",
                        border: "none",
                        background: "none",
                        padding: 0,
                        color: "primary.main",
                        fontWeight: 500,
                        "&:hover": {
                          color: "primary.dark",
                        },
                      }}
                    >
                      Claim your reward
                    </Link>
                  </>
                )}
              </Typography>
            </Box>
          </Alert>
        </Box>
      </Slide>
    </Box>
  );
};

export default PromoNotification;