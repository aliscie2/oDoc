import React from "react";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { ActionProps } from "../Action";
import { IconButton } from "@mui/material";

export function Handle(props: ActionProps) {
  return (
    <IconButton size="small" sx={{ cursor: "grab" }} {...props}>
      <DragIndicatorIcon />
    </IconButton>
  );
}
