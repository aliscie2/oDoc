import { useDispatch, useSelector } from "react-redux";
import { TextField, Autocomplete } from "@mui/material";
import type { RootState } from "../../redux/reducers";

interface UpdateFileWorkspacesPayload {
  id: string;
  workspaces: string[];
}

export const updateFileWorkspaces = (payload: UpdateFileWorkspacesPayload) => ({
  type: "UPDATE_FILE_WORKSPACES" as const,
  payload,
});

interface Workspace {
  id: string;
  name: string;
}

const ChangeWorkSpace = ({ readOnly }: { readOnly?: boolean }) => {
  const dispatch = useDispatch();
  const { workspaces, files } = useSelector(
    (state: RootState) => state.filesState,
  );

  const fileId = window.location.pathname.split("/")[1];
  const currentFile = files.find((file) => file.id === fileId);

  if (!currentFile) return null;

  const selectedWorkspaces = currentFile.workspaces
    .map((id) => workspaces.find((w) => w.id === id))
    .filter((w): w is Workspace => w !== undefined);

  return (
    <Autocomplete
      multiple
      disabled={readOnly}
      onChange={(_, value) =>
        dispatch(
          updateFileWorkspaces({
            id: fileId,
            workspaces: value.map((w) => w.id),
          }),
        )
      }
      limitTags={3}
      options={workspaces}
      getOptionLabel={(option) => option.name}
      value={selectedWorkspaces}
      size="small"
      sx={{
        minWidth: 200,
        "& .MuiChip-root": { height: 24, fontSize: "0.8125rem" },
      }}
      renderInput={(params) => <TextField {...params} label="Workspaces" />}
    />
  );
};

export default ChangeWorkSpace;
