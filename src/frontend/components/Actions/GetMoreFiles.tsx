import { Button, Tooltip } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { ContentNode } from "$/declarations/backend/backend.did";
import {
  deserializeContents,
  SlateNode,
} from "@/DataProcessing/deserlize/deserializeContents";
import { RootState } from "@/redux/reducers";
import { backendActor } from "@/utils/backendUtils";
import { Dispatch } from "redux";

async function hanldeFetching(dispatch: Dispatch, page: number) {
  const res = await backendActor.get_more_files(page);
  const files = res[0];
  const rowContents: Array<[string, Array<ContentNode>]> = res[1];
  const contents: Record<string, Array<SlateNode>> = deserializeContents(
    rowContents,
  );

  dispatch({ type: "ADD_FILES_LIST", files });
  dispatch({ type: "ADD_CONTENTS_LIST", contents });
  return files.length > 0;
}

const GetMoreFiles: React.FC = () => {
  const { isNavOpen } = useSelector((state: RootState) => state.uiState);
  console.log({ isNavOpen });
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
  useEffect(() => {
    (async () => {
      if (
        files.length === 0 &&
        inited &&
        page === 1 &&
        (isNavOpen || lookingForFile === true)
      ) {
        console.log("xxx");
        await hanldeFetching(dispatch, page);
        setPage(page + 1);
      }
    })();
  }, [files, inited, page, isNavOpen, lookingForFile]);

  const handleCreateFile = async () => {
    const moreFiles = await hanldeFetching(dispatch, page);
    !moreFiles && setNoMoreToload(false);
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
