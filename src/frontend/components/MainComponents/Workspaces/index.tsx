import React, { useState, useCallback } from "react";
import {
  Button,
  Menu,
  MenuItem,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Divider,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  useTheme,
  Box,
} from "@mui/material";
import {
  KeyboardArrowDown as ChevronDown,
  Edit as Edit2,
  AddCircle as PlusCircle,
  Check,
  Close as X,
} from "@mui/icons-material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useDispatch, useSelector } from "react-redux";
import { backendActor } from "../../../utils/backendUtils";
import { Principal } from "@dfinity/principal";
import type { Workspace, FilesState } from "./WorkspaceTypes";
import { randomString } from "@/DataProcessing/dataSamples";

const useWorkspaceOperations = () => {
  const dispatch = useDispatch();
  const { workspaces, currentWorkspace, profile } = useSelector(
    (state: { filesState: FilesState }) => state.filesState,
  );
  console.log({currentWorkspace})

  const selectWorkspace = useCallback(
    (workspace: Workspace) => {
      dispatch({
        type: "CHANGE_CURRENT_WORKSPACE",
        currentWorkspace: workspace,
      });
    },
    [dispatch],
  );

  const createWorkspace = useCallback(
    async (name: string) => {
      if (!backendActor || !profile) return false;
      try {
        const creator = Principal.fromText(profile.id);
        const newWorkspace = {
          id: randomString(),
          name,
          files: [],
          creator,
          members: [creator],
          chats: [],
          admins: [creator],
        };
        if ("Ok" in (await backendActor.save_work_space(newWorkspace))) {
          dispatch({ type: "ADD_WORKSPACE", workspace: newWorkspace });
          dispatch({
            type: "CHANGE_CURRENT_WORKSPACE",
            currentWorkspace: newWorkspace,
          });
          return true;
        }
      } catch (error) {
        console.error("Failed to create workspace:", error);
      }
      return false;
    },
    [profile, dispatch],
  );

  const deleteWorkspace = useCallback(
    async (workspace: Workspace) => {
      if (!backendActor) return false;
      try {
        if ("Ok" in (await backendActor.delete_work_space(workspace))) {
          dispatch({ type: "DELETE_WORKSPACE", workspace });
          if (currentWorkspace?.id === workspace.id) {
            const defaultWs = { id: "default", name: "default" };
            dispatch({
              type: "CHANGE_CURRENT_WORKSPACE",
              currentWorkspace: defaultWs,
            });
          }
          return true;
        }
      } catch (error) {
        console.error("Failed to delete workspace:", error);
      }
      return false;
    },
    [dispatch, currentWorkspace?.id],
  );

  return {
    workspaces,
    currentWorkspace,
    createWorkspace,
    deleteWorkspace,
    selectWorkspace,
  };
};

const WorkspaceInput: React.FC<{
  value?: string;
  placeholder: string;
  onSave: (v: string) => void;
  onCancel: () => void;
  loading?: boolean;
}> = ({ value = "", placeholder, onSave, onCancel, loading }) => {
  const [input, setInput] = useState(value);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        width: "100%",
        gap: 1,
        px: 2,
        py: 1,
      }}
    >
      <TextField
        size="small"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={placeholder}
        variant="outlined"
        sx={{ flex: 1 }}
        autoFocus
        onKeyDown={(e) => {
          e.stopPropagation();
          if (e.key === "Enter") onSave(input.trim());
          if (e.key === "Escape") onCancel();
        }}
        onMouseDown={(e) => e.stopPropagation()}
      />
      <IconButton
        size="small"
        disabled={loading}
        onClick={() => onSave(input.trim())}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {loading ? <CircularProgress size={20} /> : <Check />}
      </IconButton>
      <IconButton
        size="small"
        onClick={onCancel}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <X />
      </IconButton>
    </Box>
  );
};

const WorkspaceManager: React.FC = () => {
  const theme = useTheme();
  const {
    workspaces,
    currentWorkspace,
    createWorkspace,
    deleteWorkspace,
    selectWorkspace,
  } = useWorkspaceOperations();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedName, setEditedName] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Workspace | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const displayName = currentWorkspace?.name || "default";

  const handleClose = () => {
    setAnchorEl(null);
    setShowCreate(false);
    setEditingId(null);
  };

  const handleSaveRename = async (name: string) => {
    if (!editingId || !name.trim()) return;
    const ws = workspaces.find((w) => w.id === editingId);
    if (!ws) return;
    setIsSaving(true);
    setEditingId(null);
    setEditedName("");
    setIsSaving(false);
  };

  const handleCreate = async (name: string) => {
    if (!name.trim()) return;
    setIsCreating(true);
    if (await createWorkspace(name)) {
      setShowCreate(false);
      handleClose();
    }
    setIsCreating(false);
  };

  return (
    <>
      <Button
        onClick={(e) => setAnchorEl(e.currentTarget)}
        endIcon={<ChevronDown />}
        sx={{
          textTransform: "none",
          minHeight: 40,
          backgroundColor: "transparent",
          border: `1px solid ${theme.palette.divider}`,
          "&:hover": { backgroundColor: theme.palette.action.hover },
        }}
      >
        {displayName}
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{ sx: { width: { xs: "90vw", sm: 320 } } }}
        disableAutoFocusItem
        MenuListProps={{
          onKeyDown: (e) => {
            if (editingId || showCreate) {
              e.preventDefault();
              e.stopPropagation();
            }
          },
        }}
      >
        {showCreate ? (
          <Box sx={{ px: 1, py: 0.5 }} onMouseDown={(e) => e.stopPropagation()}>
            <WorkspaceInput
              placeholder="New workspace name"
              onSave={handleCreate}
              onCancel={() => setShowCreate(false)}
              loading={isCreating}
            />
          </Box>
        ) : (
          <MenuItem onClick={() => setShowCreate(true)}>
            <ListItemIcon>
              <PlusCircle />
            </ListItemIcon>
            <ListItemText>New Workspace</ListItemText>
          </MenuItem>
        )}
        <Divider />
        {[{ id: "default", name: "default" }, ...workspaces].map((ws) =>
          editingId === ws.id ? (
            <Box
              key={ws.id}
              sx={{ px: 1, py: 0.5 }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <WorkspaceInput
                value={editedName}
                placeholder="Workspace name"
                onSave={handleSaveRename}
                onCancel={() => setEditingId(null)}
                loading={isSaving}
              />
            </Box>
          ) : (
            <MenuItem
              key={ws.id}
              selected={ws.id === (currentWorkspace?.id || "default")}
              onClick={() => {
                selectWorkspace(ws);
                handleClose();
              }}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <ListItemText primary={ws.name} sx={{ flex: 1 }} />
              {ws.id !== "default" && (
                <Box
                  sx={{
                    display: "flex",
                    gap: 0.5,
                    opacity: 0.6,
                    transition: "all 0.2s",
                    "&:hover": { opacity: 1 },
                  }}
                >
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingId(ws.id);
                      setEditedName(ws.name);
                    }}
                    sx={{ p: 0.5 }}
                  >
                    <Edit2 sx={{ fontSize: 18 }} />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteTarget(ws);
                    }}
                    sx={{ p: 0.5 }}
                  >
                    <DeleteIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Box>
              )}
            </MenuItem>
          ),
        )}
      </Menu>

      <Dialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
      >
        <DialogTitle>Delete Workspace</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Delete "{deleteTarget?.name}"? This cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button
            onClick={async () => {
              deleteTarget && (await deleteWorkspace(deleteTarget));
              setDeleteTarget(null);
            }}
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default WorkspaceManager;
