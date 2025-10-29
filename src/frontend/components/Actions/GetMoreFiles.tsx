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
  // Using direct backendActor import
  const dispatch = useDispatch();
  const { lookingForFile, files, inited } = useSelector(
    (state: RootState) => state.filesState,
  );
  const [page, setPage] = useState(1);
  const [isMore, setNoMoreToload] = useState(true);
  const [hasInitiallyFetched, setHasInitiallyFetched] = useState(false);
  
  useEffect(() => {
    (async () => {
      // 🚀 PERFORMANCE FIX: Only fetch once on mount, not on every nav toggle
      if (
        files.length === 0 &&
        inited &&
        page === 1 &&
        !hasInitiallyFetched &&
        (isNavOpen || lookingForFile === true)
      ) {
        await hanldeFetching(dispatch, page);
        setPage(page + 1);
        setHasInitiallyFetched(true);
      }
    })();
  }, [files.length, inited, hasInitiallyFetched, isNavOpen, lookingForFile]);

  const handleCreateFile = async () => {
    const moreFiles = await hanldeFetching(dispatch, page);
    if (!moreFiles) {
      setNoMoreToload(false);
    }
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
