import { useDispatch } from "react-redux";
import { Button } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

import { useBackendContext } from "../../contexts/BackendContext";

interface DeleteFileProps {
  item: {
    id: string;
    name: string;
  };
}

const DeleteFile: React.FC<DeleteFileProps> = ({ item }) => {
  const { backendActor } = useBackendContext();
  const dispatch = useDispatch();

  const handleDeleteFile = async () => {
    if (!window.confirm(`Are you sure you want to delete ${item.name}?`)) {
      return;
    }

    await backendActor?.delete_file(item.id);
    dispatch({ type: "REMOVE_FILE", id: item.id });
    return { Ok: "File Deleted" };
  };

  return (
    <Button
      color="error"
      variant="contained"
      onClick={handleDeleteFile}
      size="small"
      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
    >
      <DeleteIcon fontSize="small" /> Delete
    </Button>
  );
};

export default DeleteFile;
