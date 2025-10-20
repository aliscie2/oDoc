import React, { memo, useState, useCallback } from "react";
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
  Typography,
} from "@mui/material";
import { Principal } from "@dfinity/principal";
import { useSelector } from "react-redux";
import { Chat } from "$/declarations/backend/backend.did";
import { RootState } from "@/redux/reducers";

interface User {
  id: string;
  name: string;
  photo?: Uint8Array;
}

interface Workspace {
  id: string;
  name: string;
}



interface ChatSettingsDialogProps {
  open: boolean;
  onClose: () => void;
  chat: Chat;
  allFriends: User[];
  workspaces: Workspace[];
  onSave: (updatedChat: Chat) => Promise<boolean>;
  onDelete: () => void;
}

export const ChatSettingsDialog = memo<ChatSettingsDialogProps>(
  ({ open, onClose, chat, allFriends, onSave, onDelete }) => {
    const { profile, all_friends, workspaces } = useSelector(
      (state: RootState) => state.filesState,
    );
    console.log({ chat, profile });
    const [formData, setFormData] = useState({
      name: chat.name,
      members: chat.members.map((m) => m.toString()),
      admins: chat.admins.map((a) => a.toString()),
      workspaces: chat.workspaces,
    });
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const isPrivateChat = chat.name === "private_chat";

    const isCreator = chat?.admins.some(a=>a.toString()==profile?.id)

    const handleSave = useCallback(async () => {
      setIsSaving(true);
      try {
        const updatedChat = {
          ...chat,
          name:
            formData.name === "private_chat" ? "private chat" : formData.name,
          members: formData.members.map((m) => Principal.fromText(m)),
          admins: formData.admins.map((a) => Principal.fromText(a)),
          workspaces: formData.workspaces,
        };

        const success = await onSave(updatedChat);
        if (success) {
          setSaveSuccess(true);
          setTimeout(() => {
            setSaveSuccess(false);
            onClose();
          }, 1000);
        }
      } finally {
        setIsSaving(false);
      }
    }, [formData, chat, onSave, onClose]);

    const handleDelete = useCallback(() => {
      if (
        window.confirm(
          "Are you sure you want to delete this chat? This action cannot be undone.",
        )
      ) {
        onDelete();
        onClose();
      }
    }, [onDelete, onClose]);

    if (!isCreator) {
      return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
          <DialogTitle>Chat Settings</DialogTitle>
          <DialogContent>
            <Typography color="error" variant="body2">
              Only the chat creator can modify settings
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>Close</Button>
          </DialogActions>
        </Dialog>
      );
    }

    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Chat Settings</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            {/* Chat Name */}
            <TextField
              label="Chat Name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
              fullWidth
              disabled={isPrivateChat}
              helperText={
                isPrivateChat ? "Private chat names cannot be changed" : ""
              }
            />

            {/* Workspaces */}
            <Autocomplete
              multiple
              options={workspaces}
              getOptionLabel={(option) => option.name}
              value={workspaces.filter((w) =>
                formData.workspaces.includes(w.id),
              )}
              onChange={(_, newValue) =>
                setFormData((prev) => ({
                  ...prev,
                  workspaces: newValue.map((w) => w.id),
                }))
              }
              renderInput={(params) => (
                <TextField {...params} label="Workspaces" />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    key={option.id}
                    label={option.name}
                    {...getTagProps({ index })}
                  />
                ))
              }
            />

            {/* Members */}
            <Autocomplete
              multiple
              options={allFriends}
              getOptionLabel={(option) => option.name}
              value={allFriends.filter((f) => formData.members.includes(f.id))}
              onChange={(_, newValue) =>
                setFormData((prev) => ({
                  ...prev,
                  members: newValue.map((u) => u.id),
                }))
              }
              renderInput={(params) => (
                <TextField {...params} label="Members" />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    key={option.id}
                    label={option.name}
                    {...getTagProps({ index })}
                  />
                ))
              }
              disabled={isPrivateChat}
            />

            {/* Admins */}
            <Autocomplete
              multiple
              options={allFriends.filter((f) =>
                formData.members.includes(f.id),
              )}
              getOptionLabel={(option) => option.name}
              value={allFriends.filter((f) => formData.admins.includes(f.id))}
              onChange={(_, newValue) =>
                setFormData((prev) => ({
                  ...prev,
                  admins: newValue.map((u) => u.id),
                }))
              }
              renderInput={(params) => <TextField {...params} label="Admins" />}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    key={option.id}
                    label={option.name}
                    {...getTagProps({ index })}
                  />
                ))
              }
              disabled={isPrivateChat}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          {!isPrivateChat && (
            <Button onClick={handleDelete} color="error">
              Delete Chat
            </Button>
          )}
          <Box sx={{ flex: 1 }} />
          <Button onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={isSaving || !formData.name.trim()}
            startIcon={isSaving ? <CircularProgress size={16} /> : null}
            color={saveSuccess ? "success" : "primary"}
          >
            {saveSuccess ? "Saved!" : isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>
    );
  },
);

ChatSettingsDialog.displayName = "ChatSettingsDialog";
