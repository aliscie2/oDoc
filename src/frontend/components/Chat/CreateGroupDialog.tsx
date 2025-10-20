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
    workspace:
      currentWorkspace?.name !== "default" && currentWorkspace
        ? [currentWorkspace]
        : [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNameChange = useCallback((name: string) => {
    setFormData((prev) => ({ ...prev, name }));
  }, []);

  const handleMembersChange = useCallback((members: User[]) => {
    const validMembers = members.filter(
      (member): member is User => member && !!member.id && !!member.name,
    );
    setFormData((prev) => ({ ...prev, members: validMembers }));
  }, []);

  const handleAdminsChange = useCallback((admins: User[]) => {
    const validAdmins = admins.filter(
      (admin): admin is User => admin && !!admin.id && !!admin.name,
    );
    setFormData((prev) => ({ ...prev, admins: validAdmins }));
  }, []);

  const handleWorkspaceChange = useCallback((workspace: Workspace[]) => {
    const validWorkspaces = workspace.filter(
      (ws): ws is Workspace => ws && !!ws.id && !!ws.name,
    );
    setFormData((prev) => ({ ...prev, workspace: validWorkspaces }));
  }, []);

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      setFormData({
        name: "",
        members: [],
        admins: [],
        workspace:
          currentWorkspace?.name !== "default" && currentWorkspace
            ? [currentWorkspace]
            : [],
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
        workspace:
          currentWorkspace?.name !== "default" && currentWorkspace
            ? [currentWorkspace]
            : [],
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
            getOptionLabel={(option) => option?.name || "Unknown"}
            value={formData.members}
            onChange={(_, newValue) =>
              handleMembersChange(newValue.filter(Boolean))
            }
            renderInput={(params) => (
              <TextField {...params} label="Select Members" />
            )}
            renderTags={(value, getTagProps) =>
              value
                .filter((option) => option && option.id && option.name)
                .map((option, index) => {
                  const { key: _key, ...tagProps } = getTagProps({ index });
                  return (
                    <Chip
                      key={`member-${option.id}-${index}`}
                      label={option.name}
                      {...tagProps}
                    />
                  );
                })
            }
          />

          <Autocomplete
            multiple
            options={formData.members.length > 0 ? formData.members : users}
            getOptionLabel={(option) => option?.name || "Unknown"}
            value={formData.admins}
            onChange={(_, newValue) =>
              handleAdminsChange(newValue.filter(Boolean))
            }
            renderInput={(params) => (
              <TextField {...params} label="Select Admins" />
            )}
            renderTags={(value, getTagProps) =>
              value
                .filter((option) => option && option.id && option.name)
                .map((option, index) => {
                  const { key: _key, ...tagProps } = getTagProps({ index });
                  return (
                    <Chip
                      key={`admin-${option.id}-${index}`}
                      label={option.name}
                      {...tagProps}
                    />
                  );
                })
            }
            disabled={formData.members.length === 0}
          />

          <Autocomplete
            multiple
            options={workspaces}
            getOptionLabel={(option) => option?.name || "Unknown"}
            value={formData.workspace}
            onChange={(_, newValue) =>
              handleWorkspaceChange(newValue.filter(Boolean))
            }
            renderInput={(params) => (
              <TextField {...params} label="Workspaces" />
            )}
            renderTags={(value, getTagProps) =>
              value
                .filter((option) => option && option.id && option.name)
                .map((option, index) => {
                  const { key: _key, ...tagProps } = getTagProps({ index });
                  return (
                    <Chip
                      key={`workspace-${option.id}-${index}`}
                      label={option.name}
                      {...tagProps}
                    />
                  );
                })
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
