import * as React from "react";
import { useEffect, useState } from "react";
import { ContentNode, FileNode } from "../../declarations/backend/backend.did";
import { useSnackbar } from "notistack";
import { useDispatch, useSelector } from "react-redux";
import {
  deserializeContentTree,
  SlateNode,
} from "../DataProcessing/deserlize/deserializeContents";
import EditorComponent from "../components/EditorComponent";
import { useBackendContext } from "../contexts/BackendContext";
import { CircularProgress, Input, Typography } from "@mui/material";
import { Link } from "react-router-dom";

export type FileQuery =
  | undefined
  | { Ok: [FileNode, Array<[string, ContentNode]>] }
  | { Err: string };

function ShareFilePage(props: any) {
  const url = window.location.search;
  const id = url.split("=")[1];

  const { files, files_content } = useSelector(
    (state: any) => state.filesState,
  );
  const file_id: null | string = files.find(
    (file: FileNode) => file && file.share_id[0] == id,
  );

  const [file, setFile] = useState<null | FileNode>(files[file_id]);
  const [state, setState]: any = useState(file ? files_content[file.id] : null);
  const dispatch = useDispatch();

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const { backendActor } = useBackendContext();

  useEffect(() => {
    if (!file) {
      (async () => {
        const loading = enqueueSnackbar(
          <span>
            <span className={"loader"} />
          </span>,
        );

        const res: FileQuery = await backendActor.get_shared_file(id);

        closeSnackbar(loading);

        if ("Ok" in res) {
          const file: FileNode = res.Ok[0];
          const contentTree: Array<[string, ContentNode]> = res.Ok[1];
          const normalized_tree: Array<SlateNode> =
            deserializeContentTree(contentTree);
          setFile(file);
          setState(normalized_tree);
          dispatch({ type: "CURRENT_FILE", file });
          dispatch({
            type: "ADD_CONTENT",
            id: file.id,
            content: normalized_tree,
          });
          // dispatch({type:"ADD_FILE", data: file });
        } else {
          enqueueSnackbar(`Error: ${res.Err}`, { variant: "error" });
        }
      })();
    }
  }, [file]);

  if (!state) {
    <CircularProgress />;
  }

  return (
    <>
      <div style={{ marginTop: "3px", marginLeft: "10%", marginRight: "10%" }}>
        <Input
          key={file && file.name}
          inputProps={{
            style: {
              width: "100%",
              fontSize: "1.5rem",
              overflow: "visible",
              whiteSpace: "nowrap",
            },
          }}
          defaultValue={file && file.name}
          placeholder="Untitled"
          disabled={true}
        />
        {file && (
          <Typography
            to={`/user?id=${file?.author}`}
            component={Link}
            variant="body4"
            color={"primary"}
          >
            See the author
          </Typography>
        )}
        <EditorComponent
          key={state}
          id={"share-file-content"}
          editorKey={props.file_id}
          content={state || []}
          readOnly={true}
        />
      </div>
    </>
  );
}

export default ShareFilePage;
