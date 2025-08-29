import { backendActor } from "@/utils/backendUtils";
import {
  Button,
  Box,
  Typography,
  TextField,
  Paper,
  IconButton,
  CircularProgress,
  useTheme,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

const AICreditsComponent = () => {
  const theme = useTheme();
  const { wallet } = useSelector((state: any) => state.filesState);
  const { credits: aiCredits } = useSelector((state: any) => state.AIState);
  const [showBuyPanel, setShowBuyPanel] = useState(false);
  const [buyAmount, setBuyAmount] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [credits, setCredits] = useState(aiCredits);
  const [popoverPosition, setPopoverPosition] = useState({
    bottom: "100%",
    left: 0,
    right: "auto",
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();
  // Using direct backendActor import

  useEffect(() => {
    setCredits(aiCredits);
  }, [aiCredits]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as Element)?.closest(".credits-container")) {
        setShowBuyPanel(false);
      }
    };
    if (showBuyPanel) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [showBuyPanel]);

  useEffect(() => {
    if (showBuyPanel && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const popoverWidth = 200; // minWidth from Paper

      const newPosition = { bottom: "100%", left: 0, right: "auto" };

      // Check horizontal overflow
      if (rect.left + popoverWidth > window.innerWidth) {
        newPosition.right = 0;
        newPosition.left = "auto";
      }

      setPopoverPosition(newPosition);
    }
  }, [showBuyPanel]);

  const getColor = (value: number) =>
    value < 1
      ? theme.palette.error.main
      : value < 2.5
        ? theme.palette.warning.dark
        : value < 3
          ? theme.palette.warning.main
          : value < 4
            ? theme.palette.warning.light
            : theme.palette.success.main;

  const handleBuyCredits = async () => {
    setIsLoading(true);
    try {
      const res = await backendActor.buy_ai_credits(buyAmount);
      if ("Ok" in res) {
        dispatch({ type: "ADD_AI_CREDITS", credits: buyAmount });
        setCredits(aiCredits + buyAmount);
      } else {
        alert("Err" in res ? res.Err : "Unknown error");
      }
      setShowBuyPanel(false);
    } catch (error) {
      alert(error);
    } finally {
      setIsLoading(false);
    }
  };

  const normalizedValue = Math.min(Math.max(credits, 0), 5);
  const percentage = (normalizedValue / 5) * 100;
  const isIncreasing = credits > 0;

  return (
    <Box
      ref={containerRef}
      className="credits-container"
      sx={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: 1,
      }}
    >
      <Box
        sx={{
          position: "relative",
          width: 40,
          height: 40,
          cursor: "pointer",
          transform: isIncreasing ? "scale(1.1)" : "scale(1)",
          transition: "transform 0.3s ease",
        }}
        onMouseEnter={() => !showBuyPanel && setShowBuyPanel(true)}
      >
        <svg width="40" height="40" viewBox="0 0 40 40">
          <circle
            cx="20"
            cy="20"
            r="16"
            fill="none"
            stroke={theme.palette.divider}
            strokeWidth="3"
          />
          <circle
            cx="20"
            cy="20"
            r="16"
            fill="none"
            stroke={getColor(credits)}
            strokeWidth="3"
            strokeDasharray={`${percentage * 1.0} 100`}
            strokeDashoffset="25"
            transform="rotate(-90 20 20)"
            style={{
              transition: "stroke-dasharray 0.8s ease, stroke 0.3s ease",
              filter: isIncreasing
                ? "drop-shadow(0 0 8px currentColor)"
                : "none",
            }}
          />
        </svg>
        <Typography
          variant="caption"
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            fontSize: "10px",
            fontWeight: "bold",
            color: getColor(credits),
          }}
        >
          {credits.toFixed(1)}
        </Typography>
      </Box>

      {showBuyPanel && (
        <Paper
          elevation={8}
          sx={{
            position: "absolute",
            ...popoverPosition,
            mb: 1,
            p: 2,
            minWidth: 200,
            zIndex: 1000,
            bgcolor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1.5,
            }}
          >
            <Typography variant="body2" fontWeight="600">
              Credits: {credits.toFixed(1)}/5
            </Typography>
            <IconButton
              size="small"
              onClick={() => setShowBuyPanel(false)}
              sx={{ color: theme.palette.text.secondary }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          <Typography variant="body2" fontWeight="600" sx={{ mb: 1.5 }}>
            Balance: {wallet.balance}$
          </Typography>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mb: 1, display: "block" }}
          >
            Amount (1-5):
          </Typography>

          <TextField
            type="number"
            size="small"
            fullWidth
            inputProps={{ min: 1, max: 5 }}
            value={buyAmount}
            disabled={isLoading}
            onChange={(e) =>
              setBuyAmount(
                Math.min(Math.max(parseInt(e.target.value) || 1, 1), 5),
              )
            }
            sx={{ mb: 1.5 }}
          />

          {wallet.balance < buyAmount ? (
            <Typography
              component={Link}
              to="/wallet"
              color="primary"
              variant="body2"
              sx={{ textDecoration: "underline" }}
            >
              You need to deposit.
            </Typography>
          ) : (
            <Button
              variant="contained"
              fullWidth
              onClick={handleBuyCredits}
              disabled={isLoading || wallet.balance < buyAmount}
              startIcon={isLoading ? <CircularProgress size={16} /> : null}
            >
              {isLoading ? "Buying..." : `Buy ${buyAmount} Credits`}
            </Button>
          )}
        </Paper>
      )}
    </Box>
  );
};
export default AICreditsComponent;
