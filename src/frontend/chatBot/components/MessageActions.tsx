import { Box, Button, useTheme } from "@mui/material";
import { Redo, Refresh, Undo } from "@mui/icons-material";
import { MessageActionsProps } from "../types";

export const MessageActions = ({
  msg,
  onUndo,
  onRedo,
  onRetry,
}: MessageActionsProps) => {
  const theme = useTheme();

  if (msg.type !== "ai" || !(msg.canUndo || msg.canRedo || msg.canRetry))
    return null;

  const actions = [
    {
      show: msg.canRetry,
      icon: Refresh,
      label: "Retry",
      color: theme.palette.primary.main,
      onClick: () => onRetry(msg.id),
    },
    {
      show: msg.canUndo,
      icon: Undo,
      label: "Undo",
      color: theme.palette.warning.main,
      onClick: () => onUndo(msg.id),
    },
    {
      show: msg.canRedo,
      icon: Redo,
      label: "Redo",
      color: theme.palette.success.main,
      onClick: () => onRedo(msg.id),
    },
  ].filter((action) => action.show);

  return (
    <Box display="flex" gap={0.5} justifyContent="flex-start" mb={0.5}>
      {actions.map(({ icon: Icon, label, color, onClick }) => (
        <Button
          key={label}
          size="small"
          startIcon={<Icon sx={{ fontSize: "14px !important" }} />}
          onClick={onClick}
          sx={{
            color,
            minWidth: "auto",
            p: "2px 6px",
            fontSize: "0.65rem",
            textTransform: "none",
            "&:hover": { bgcolor: `${color}15` },
          }}
        >
          {label}
        </Button>
      ))}
    </Box>
  );
};
