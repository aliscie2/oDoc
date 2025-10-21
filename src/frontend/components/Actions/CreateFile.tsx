import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Tooltip, Box } from "@mui/material";
import { AddBox } from "@mui/icons-material";

import {
  fileContentSample,
  randomString,
} from "../../DataProcessing/dataSamples";
import { FileNode } from "../../../declarations/backend/backend.did";
import { useSnackbar } from "notistack";

interface FilesState {
  profile: { id: string } | null;
  currentWorkspace: { id: string } | null;
  files: FileNode[];
}

const CreateFile: React.FC = () => {
  const dispatch = useDispatch();
  const { profile, currentWorkspace, files } = useSelector(
    (state: { filesState: FilesState }) => state.filesState,
  );

  const { closeSnackbar, enqueueSnackbar } = useSnackbar();

  const handleCreateFile = async () => {
    const id = randomString();

    let workspaces: Array<string> = [];
    if (
      currentWorkspace?.id &&
      currentWorkspace.id.toLowerCase() !== "default"
    ) {
      workspaces = [currentWorkspace.id];
    }

    if (!profile?.id) {
      enqueueSnackbar("Error: User profile not loaded", { variant: "error" });
      return;
    }

    const new_file: FileNode = {
      id,
      permission: {
        None: null,
      },
      content_id: [],
      share_id: [],
      name: "Untitled",
      workspaces,
      children: [],
      author: profile.id,
      users_permissions: [],
      parent: [],
    };

    try {
      dispatch({
        type: "ADD_FILE",
        new_file,
      });

      dispatch({
        type: "ADD_CONTENT",
        id,
        content: fileContentSample,
      });

      closeSnackbar();
      enqueueSnackbar("New file created!", { variant: "success" });
    } catch (error) {
      console.error("Error creating file:", error);
      enqueueSnackbar("Failed to create file", { variant: "error" });
    }
  };
  let title = "Create a new document";
  if (files.length === 0) {
    title = "Create your first document";
  }
  return (
    <Box sx={{ maxWidth: "200px" }}>
      <Tooltip title={title} arrow>
        <Button
          onClick={handleCreateFile}
        >
          <AddBox
            sx={{
              mr: files.length === 0 ? 1 : 0,
              fontSize: files.length === 0 ? "20px" : "18px",
            }}
          />
          {files.length === 0 && "Create Document"}
        </Button>
      </Tooltip>
    </Box>
  );
};

export default CreateFile;
