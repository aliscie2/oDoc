import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { TextField, Autocomplete } from "@mui/material";

const ChangeWorkSpace = ({ readOnly }: { readOnly?: boolean }) => {
  const dispatch = useDispatch();
  const { workspaces, files } = useSelector((state: any) => state.filesState);

  const fileId = window.location.pathname.split("/")[1];
  const currentFile = files.find((file: any) => file.id === fileId);

  if (!currentFile) return null;

  const filteredWorkspaces = currentFile.workspaces.filter(
    (w: string) => w === "default" || workspaces.find((ws: any) => ws.id === w),
  );

  const selectedWorkspaces = filteredWorkspaces.map((workspaceId: string) => {
    const workspace = workspaces.find((w: any) => w.id === workspaceId);
    return { title: workspace?.name, id: workspace?.id };
  });

  const workspaceOptions = workspaces.map((workspace: any) => ({
    title: workspace.name,
    id: workspace.id,
  }));

  const handleChange = (value: any) => {
    dispatch({
      type: "UPDATE_FILE_WORKSPACES",
      id: currentFile.id,
      workspaces: value.map((w: any) => w.id),
    });
  };

  return (
    <Autocomplete
      multiple
      disabled={readOnly}
      onChange={(_, value) => handleChange(value)}
      limitTags={3}
      options={workspaceOptions}
      getOptionLabel={(option) => option.title}
      value={selectedWorkspaces}
      renderInput={(params) => <TextField {...params} label="workspaces" />}
    />
  );
};

export default ChangeWorkSpace;
