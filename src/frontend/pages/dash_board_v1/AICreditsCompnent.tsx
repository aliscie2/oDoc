import { useBackendContext } from "@/contexts/BackendContext";
import { Box, Typography, TextField } from "@mui/material";
import { Popover, Button } from "flowbite-react";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

const AICreditsComponent = ({ credits }) => {
  const { wallet } = useSelector((state: any) => state.filesState);
  const [showBuyPanel, setShowBuyPanel] = useState(false);
  const [buyAmount, setBuyAmount] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const { backendActor } = useBackendContext();
  const { aiAgent } = useSelector((state) => state.AIState);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".credits-container")) {
        setShowBuyPanel(false);
      }
    };

    if (showBuyPanel) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [showBuyPanel]);

  const getColor = (value) => {
    if (value < 1) return "#ff1744";
    if (value < 2.5) return "#ff5722";
    if (value < 3) return "#ff9800";
    if (value < 4) return "#ffb74d";
    return "#4caf50";
  };

  const handleBuyCredits = async () => {
    setIsLoading(true);
    try {
      let res = await backendActor.buy_ai_credits(buyAmount);
      if (res.Ok) {
        await aiAgent.addCredits(buyAmount, true);
        dispatch({ type: "ADD_AI_CREDITS", credits: buyAmount, isFree: false });
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
    <div
      className="credits-container"
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: "8px",
      }}
    >
      <div
        style={{
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
            stroke="rgba(255,255,255,0.1)"
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
        <span
          style={{
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
        </span>
      </div>

      {showBuyPanel && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            marginTop: "8px",
            background: "rgba(0,0,0,0.95)",
            color: "white",
            padding: "16px",
            borderRadius: "8px",
            minWidth: "200px",
            border: "1px solid rgba(255,255,255,0.1)",
            zIndex: 1000,
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "12px",
            }}
          >
            <div style={{ fontSize: "14px", fontWeight: "600" }}>
              Credits: {credits.toFixed(1)}/5
            </div>
            <button
              onClick={() => setShowBuyPanel(false)}
              style={{
                background: "none",
                border: "none",
                color: "#ccc",
                fontSize: "16px",
                cursor: "pointer",
                padding: "0",
                lineHeight: "1",
              }}
            >
              ×
            </button>
          </div>
          <div
            style={{
              fontSize: "14px",
              fontWeight: "600",
              marginBottom: "12px",
            }}
          >
            Balance: {wallet.balance}$
          </div>
          <div style={{ fontSize: "12px", color: "#ccc", marginBottom: "8px" }}>
            Amount (1-5):
          </div>
          <input
            type="number"
            min="1"
            max="5"
            value={buyAmount}
            onChange={(e) =>
              setBuyAmount(
                Math.min(Math.max(parseInt(e.target.value) || 1, 1), 5),
              )
            }
            disabled={isLoading}
            style={{
              width: "100%",
              padding: "8px",
              marginBottom: "12px",
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: "4px",
              color: "white",
              fontSize: "14px",
            }}
          />
          {wallet.balance < buyAmount ? (
            <Link to="/wallet">You need to deposit.</Link>
          ) : (
            <Button
              onClick={handleBuyCredits}
              disabled={isLoading || wallet.balance < buyAmount}
              style={{
                width: "100%",
                padding: "10px",
                background: isLoading ? "#666" : "#00d4ff",
                border: "none",
                borderRadius: "4px",
                color: "white",
                fontSize: "14px",
                cursor: isLoading ? "not-allowed" : "pointer",
                fontWeight: "600",
              }}
            >
              {isLoading ? "Buying..." : `Buy ${buyAmount} Credits`}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
export default AICreditsComponent;
