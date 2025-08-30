import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Tooltip } from "@mui/material";

import { ContentNode } from "../../../declarations/backend/backend.did";
import { backendActor } from "../../utils/backendUtils";
import { RootState } from "@/redux/reducers";

const GetMoreFiles: React.FC = () => {
  const { isNavOpen } = useSelector((state: RootState) => state.uiState);
  // Using direct backendActor import
  const dispatch = useDispatch();
  const { lookingForFile, files, inited, currentWorkspace } = useSelector(
    (state: any) => state.filesState,
  );

  let workspaces = [];
  if (currentWorkspace.id) {
    workspaces = [currentWorkspace.id];
  }
  const [page, setPage] = useState(1);
  const [isMore, setNoMoreToload] = useState(true);
  console.log({ lookingForFile });
  useEffect(() => {
    (async () => {
      if (
        files.length == 0 &&
        inited &&
        page == 1 &&
        (isNavOpen || lookingForFile === true)
      ) {
        const res = await backendActor?.get_more_files(page);
        console.log({ res });
        const files = res[0];
        const contents: Array<[string, Array<ContentNode>]> = res[1];

        dispatch({ type: "ADD_FILES_LIST", files });
        dispatch({ type: "ADD_CONTENTS_LIST", contents });
        setPage(page + 1);
      }
    })();
  }, [files, inited, page, isNavOpen, lookingForFile]);

  const handleCreateFile = async () => {
    const res = await backendActor?.get_more_files(page);
    const files = res[0];
    if (files.length === 0) {
      setNoMoreToload(false);
      return;
    }
    const contents: Array<[string, Array<ContentNode>]> = res[1];

    dispatch({ type: "ADD_FILES_LIST", files });
    dispatch({ type: "ADD_CONTENTS_LIST", contents });
    setPage(page + 1);
  };

  if (!isMore) {
    return null;
  }

  return (
    <Tooltip title="Load more files" arrow>
      <Button onClick={handleCreateFile}>More files</Button>
    </Tooltip>
  );
};

export default GetMoreFiles;
