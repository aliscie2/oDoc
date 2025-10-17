import DeleteIcon from "@mui/icons-material/Delete";
import { Button, CircularProgress } from "@mui/material";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { backendActor } from "../../utils/backendUtils";

interface DeleteFileProps {
  item: {
    id: string;
    name: string;
  };
}

const DeleteFile: React.FC<DeleteFileProps> = ({ item }) => {
  const [isLoading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const handleDeleteFile = async () => {
    if (!window.confirm(`Delete ${item.name}?`)) return;

    setLoading(true);
    await backendActor?.delete_file(item.id);
    dispatch({ type: "REMOVE_FILE", id: item.id });
    setLoading(false);
  };

  return (
    <Button
      variant="outlined"
      color="error"
      size="small"
      onClick={handleDeleteFile}
      disabled={isLoading}
      startIcon={
        isLoading ? (
          <CircularProgress size={18} color="inherit" />
        ) : (
          <DeleteIcon fontSize="small" />
        )
      }
      sx={{
        textTransform: "none",
        "&:hover": { bgcolor: "error.dark", color: "white" },
      }}
    >
      Delete File
    </Button>
  );
};

export default DeleteFile;
