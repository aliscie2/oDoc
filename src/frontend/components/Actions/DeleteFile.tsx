import { MouseEvent } from "react";
import { useDispatch } from "react-redux";
import { useSnackbar } from "notistack";
import DeleteIcon from "@mui/icons-material/Delete";

import { useBackendContext } from "../../contexts/BackendContext";
import ConformationMessage from "../MuiComponents/conformationButton";

interface DeleteFileProps {
  item: {
    id: string;
    name: string;
  };
}

const DeleteFile: React.FC<DeleteFileProps> = ({ item }) => {
  const { backendActor } = useBackendContext();
  const dispatch = useDispatch();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const handleDeleteFile = async (e: MouseEvent<HTMLSpanElement>) => {
    const res = await backendActor.delete_file(item.id);
    // if (!res[0]){
    //   return {Err:"File not found"}
    // }
    dispatch({ type: "REMOVE_FILE", id: item.id });
    // enqueueSnackbar(`${item.name} is deleted`, { variant: "success" });
    return { Ok: "File Deleted" };
  };

  return (
    <ConformationMessage
      color={"error"}
      message={"Yes delete it!"}
      conformationMessage={`Are you sure you want to delete this File`}
      onClick={handleDeleteFile}
    >
      <DeleteIcon fontSize="small" /> Delete
    </ConformationMessage>
  );
};

export default DeleteFile;
