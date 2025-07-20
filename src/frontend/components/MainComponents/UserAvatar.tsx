import { Avatar, IconButton } from "@mui/material";
import ProgressCircle from "../MuiComponents/ProgressCircle";
import React from "react";

interface Props {
  photo: string;
  onAvatarClick?: () => void;
  style: React.CSSProperties;
  actions_rate: number;
  onClick?: () => void;
}

function UserAvatar(props: Props) {
  const photo = props.photo;

  return (
    <ProgressCircle progress={props.actions_rate}>
      <IconButton component="span" onClick={props.onClick}>
        <Avatar alt="Profile Photo" src={photo} style={props.style} />
      </IconButton>
    </ProgressCircle>
  );
}

export default UserAvatar;
