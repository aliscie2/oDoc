import { backendActor } from "@/utils/backendUtils";
import { Button, CircularProgress } from "@mui/material";

import { useState } from "react";
import { useDispatch } from "react-redux";

import { useNavigate } from "react-router-dom";

function DeleteContractButton({ contractId }: { contractId: string }) {
  const [isDeleting, setDeleting] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete this contract? This will delete all promises.",
      )
    )
      return;

    try {
      setDeleting(true);
      await backendActor.delete_custom_contract(contractId);
      dispatch({ type: "DELETE_CUSTOM_CONTRACT", id: contractId });
      navigate("/contracts");
    } catch (error) {
      console.error("Failed to delete contract:", error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Button
      variant="outlined"
      color="error"
      disabled={isDeleting}
      onClick={handleDelete}
    >
      {isDeleting ? <CircularProgress /> : "Delete Contract"}
    </Button>
  );
}

export default DeleteContractButton;
