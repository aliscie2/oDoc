import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Tooltip } from "@mui/material";

import { ContentNode } from "../../../declarations/backend/backend.did";
import { useSnackbar } from "notistack";
import { backendActor, ckUSDCActor, logout } from "../../utils/backendUtils";

const GetMoreFiles: React.FC = () => {
  // Using direct backendActor import
  const dispatch = useDispatch();
  const { profile, currentWorkspace } = useSelector(
    (state: any) => state.filesState,
  );

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  let workspaces = [];
  if (currentWorkspace.id) {
    workspaces = [currentWorkspace.id];
  }
  const [page, setPage] = useState(2);
  const handleCreateFile = async () => {
    const res = await backendActor?.get_more_files(page);
    console.log(res[0]);
    const files = res[0];
    const contents: Array<[string, Array<ContentNode>]> = res[1];

    dispatch({ type: "ADD_FILES_LIST", files });
    dispatch({ type: "ADD_CONTENTS_LIST", contents });
    setPage(page + 1);
  };

  return (
    <Tooltip title="Load more files" arrow>
      <Button onClick={handleCreateFile}>More files</Button>
    </Tooltip>
  );
};

export default GetMoreFiles;
