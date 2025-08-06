import React, { memo, useCallback, useState } from "react";
import { IconButton, Tooltip } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ShareIcon from "@mui/icons-material/Share";
interface CopyButtonProps {
  value: string;
  title?: string;
  onError?: (message: string) => void;
}

const CopyButton = memo<CopyButtonProps>(({ value, title, onError }) => {
  const [showCheck, setShowCheck] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      setShowCheck(true);
      setTimeout(() => setShowCheck(false), 2000);
    } catch {
      onError?.("Failed to copy link");
    }
  }, [value, onError]);

  const tooltipTitle = showCheck ? "✅ Link is copied" : title || "Copy";

  return (
    <Tooltip title={tooltipTitle}>
      <IconButton onClick={handleCopy} size="small" color="primary">
        {showCheck ? <CheckCircleIcon /> : <ShareIcon fontSize="small" />}
      </IconButton>
    </Tooltip>
  );
});
export default CopyButton;
