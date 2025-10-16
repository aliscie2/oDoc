import React, { useState, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Autocomplete,
  Chip,
  CircularProgress,
} from "@mui/material";

interface User {
  id: string;
  name: string;
  photo?: Uint8Array;
}

interface Workspace {
  id: string;
  name: string;
}

interface CreateGroupDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
  users: User[];
  workspaces: Workspace[];
  currentWorkspace?: Workspace;
}

interface FormData {
  name: string;
  members: User[];
  admins: User[];
  workspace: Workspace[];
}

export const CreateGroupDialog: React.FC<CreateGroupDialogProps> = ({
  open,
  onClose,
  onSubmit,
  users,
  workspaces,
  currentWorkspace,
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    members: [],
    admins: [],
    workspace: currentWorkspace?.name !== "default" ? [currentWorkspace] : [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNameChange = useCallback((name: string) => {
    setFormData((prev) => ({ ...prev, name }));
  }, []);

  const handleMembersChange = useCallback((members: User[]) => {
    setFormData((prev) => ({ ...prev, members }));
  }, []);

  const handleAdminsChange = useCallback((admins: User[]) => {
    setFormData((prev) => ({ ...prev, admins }));
  }, []);

  const handleWorkspaceChange = useCallback((workspace: Workspace[]) => {
    setFormData((prev) => ({ ...prev, workspace }));
  }, []);

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      setFormData({
        name: "",
        members: [],
        admins: [],
        workspace: currentWorkspace?.name !== "default" ? [currentWorkspace] : [],
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, onSubmit, currentWorkspace]);

  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      onClose();
      setFormData({
        name: "",
        members: [],
        admins: [],
        workspace: currentWorkspace?.name !== "default" ? [currentWorkspace] : [],
      });
    }
  }, [isSubmitting, onClose, currentWorkspace]);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Group Chat</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
          <TextField
            label="Group Name"
            value={formData.name}
            onChange={(e) => handleNameChange(e.target.value)}
            fullWidth
            placeholder="Enter group name"
          />

          <Autocomplete
            multiple
            options={users}
            getOptionLabel={(option) => option.name}
            value={formData.members}
            onChange={(_, newValue) => handleMembersChange(newValue)}
            renderInput={(params) => <TextField {...params} label="Select Members" />}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip key={option.id} label={option.name} {...getTagProps({ index })} />
              ))
            }
          />

          <Autocomplete
            multiple
            options={formData.members.length > 0 ? formData.members : users}
            getOptionLabel={(option) => option.name}
            value={formData.admins}
            onChange={(_, newValue) => handleAdminsChange(newValue)}
            renderInput={(params) => <TextField {...params} label="Select Admins" />}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip key={option.id} label={option.name} {...getTagProps({ index })} />
              ))
            }
            disabled={formData.members.length === 0}
          />

          <Autocomplete
            multiple
            options={workspaces}
            getOptionLabel={(option) => option.name}
            value={formData.workspace}
            onChange={(_, newValue) => handleWorkspaceChange(newValue)}
            renderInput={(params) => <TextField {...params} label="Workspaces" />}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip key={option.id} label={option.name} {...getTagProps({ index })} />
              ))
            }
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={isSubmitting || !formData.name.trim()}
          startIcon={isSubmitting ? <CircularProgress size={16} /> : null}
        >
          {isSubmitting ? "Creating..." : "Create Group"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

CreateGroupDialog.displayName = "CreateGroupDialog";
