import { styled } from "@mui/material/styles";
import { ListItem } from "@mui/material";

const StyledNotificationItem = styled(ListItem)(
  ({ theme, isread, ispayment }) => ({
    padding: theme.spacing(2),
    margin: theme.spacing(1),
    borderRadius: 12,

    // Neumorphic effect
    background:
      isread === "true"
        ? "linear-gradient(145deg, #e6e6e6, #ffffff)"
        : "linear-gradient(145deg, #ffffff, #f5f5f5)",
    boxShadow:
      isread === "true"
        ? "inset 2px 2px 5px #d1d1d1, inset -2px -2px 5px #ffffff"
        : "4px 4px 8px #d1d1d1, -4px -4px 8px #ffffff",

    // Sunlight glow from right
    "&::after": {
      content: '""',
      position: "absolute",
      top: 0,
      right: 0,
      width: "30%",
      height: "100%",
      background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4))",
      borderRadius: "inherit",
      pointerEvents: "none",
    },

    // Payment highlight (blue accent)
    ...(ispayment === "true" && {
      borderLeft: `3px solid #3A8DFF`,
      background: "linear-gradient(145deg, #f0f7ff, #ffffff)",
    }),

    // Hover state
    "&:hover": {
      boxShadow: "6px 6px 12px #c5c5c5, -6px -6px 12px #ffffff",
      transform: "translateY(-1px)",
    },

    cursor: ispayment === "true" ? "pointer" : "default",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    position: "relative",
    border: "none",
    opacity: isread === "true" ? 0.8 : 1,
  }),
);

export default StyledNotificationItem;
