import DeleteIcon from "@mui/icons-material/Delete";
import { Button, CircularProgress } from "@mui/material";
import { useDispatch } from "react-redux";

import { useState } from "react";
import { useBackendContext } from "../../contexts/BackendContext";

interface DeleteFileProps {
  item: {
    id: string;
    name: string;
  };
}

const DeleteFile: React.FC<DeleteFileProps> = ({ item }) => {
  const [isLoading, setLoding] = useState(false);
  const { backendActor } = useBackendContext();
  const dispatch = useDispatch();

  const handleDeleteFile = async () => {
    setLoding(true);
    if (!window.confirm(`Are you sure you want to delete ${item.name}?`)) {
      return;
    }

    await backendActor?.delete_file(item.id);
    setLoding(false);
    dispatch({ type: "REMOVE_FILE", id: item.id });
    return { Ok: "File Deleted" };
  };

  return (
    <Button
      disabled={isLoading}
      color="error"
      variant="contained"
      onClick={handleDeleteFile}
      size="small"
      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
    >
      {isLoading ? (
        <CircularProgress />
      ) : (
        <>
          <DeleteIcon fontSize="small" /> Delete
        </>
      )}
    </Button>
  );
};

export default DeleteFile;
