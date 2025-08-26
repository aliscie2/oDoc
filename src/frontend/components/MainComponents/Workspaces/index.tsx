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
import { getWorkspaceStyles } from "./WorkspaceStyles";
import type { Workspace, FilesState } from "./WorkspaceTypes";
import { randomString } from "@/DataProcessing/dataSamples";

// Custom hook for workspace operations
const useWorkspaceOperations = () => {
  const dispatch = useDispatch();
  // Using direct backendActor import
  const { workspaces, currentWorkspace, profile } = useSelector(
    (state: { filesState: FilesState }) => state.filesState,
  );

  // Load workspace from localStorage on mount
  React.useEffect(() => {
    const savedWorkspaceId = localStorage.getItem("CURRENT_WORKSPACE");
    if (savedWorkspaceId && workspaces.length > 0) {
      const savedWorkspace =
        workspaces.find((w) => w.id === savedWorkspaceId) ||
        (savedWorkspaceId === "default"
          ? { id: "default", name: "default" }
          : null);
      if (
        savedWorkspace &&
        (!currentWorkspace || currentWorkspace.id !== savedWorkspaceId)
      ) {
        dispatch({
          type: "CHANGE_CURRENT_WORKSPACE",
          currentWorkspace: savedWorkspace,
        });
      }
    }
  }, [workspaces, currentWorkspace, dispatch]);

  const selectWorkspace = useCallback(
    (workspace: Workspace) => {
      dispatch({
        type: "CHANGE_CURRENT_WORKSPACE",
        currentWorkspace: workspace,
      });
      localStorage.setItem("CURRENT_WORKSPACE", workspace.id);
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
        const result = await backendActor.save_work_space(newWorkspace);
        if ("Ok" in result) {
          dispatch({ type: "ADD_WORKSPACE", workspace: newWorkspace });
          dispatch({
            type: "CHANGE_CURRENT_WORKSPACE",
            currentWorkspace: newWorkspace,
          });
          localStorage.setItem("CURRENT_WORKSPACE", newWorkspace.id);
          return true;
        }
      } catch (error) {
        console.error("Failed to create workspace:", error);
      }
      return false;
    },
    [backendActor, profile, dispatch],
  );

  const deleteWorkspace = useCallback(
    async (workspace: Workspace) => {
      if (!backendActor) return false;
      try {
        const res = await backendActor.delete_work_space(workspace);
        if ("Ok" in res) {
          dispatch({ type: "DELETE_WORKSPACE", workspace });
          if (currentWorkspace.id === workspace.id) {
            const defaultWorkspace = { id: "default", name: "default" };
            dispatch({
              type: "CHANGE_CURRENT_WORKSPACE",
              currentWorkspace: defaultWorkspace,
            });
            localStorage.setItem("CURRENT_WORKSPACE", "default");
          }
          return true;
        }
      } catch (error) {
        console.error("Failed to delete workspace:", error);
      }
      return false;
    },
    [backendActor, dispatch, currentWorkspace],
  );

  return {
    workspaces,
    currentWorkspace,
    createWorkspace,
    deleteWorkspace,
    selectWorkspace,
  };
};
// Input field component for editing/creating
const WorkspaceInput: React.FC<{
  value?: string;
  placeholder: string;
  onSave: (value: string) => void;
  onCancel: () => void;
  loading?: boolean;
  styles: any;
}> = ({ value = "", placeholder, onSave, onCancel, loading, styles }) => {
  const [inputValue, setInputValue] = useState(value);

  return (
    <Box
      sx={{ display: "flex", alignItems: "center", width: "100%", gap: 1 }}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <TextField
        size="small"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder={placeholder}
        variant="outlined"
        sx={{ ...styles.textField, flex: 1 }}
        onKeyDown={(e) => {
          e.stopPropagation();
          if (e.key === "Enter") {
            onSave(inputValue.trim());
          } else if (e.key === "Escape") {
            onCancel();
          }
        }}
        autoFocus
      />
      <Box sx={{ display: "flex", gap: 0.5 }}>
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onSave(inputValue.trim());
          }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={20} /> : <Check />}
        </IconButton>
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onCancel();
          }}
        >
          <X />
        </IconButton>
      </Box>
    </Box>
  );
};

// Workspace item component
const WorkspaceItem: React.FC<{
  workspace: Workspace;
  isSelected: boolean;
  isEditing: boolean;
  editedName: string;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onSaveEdit: (name: string) => void;
  onCancelEdit: () => void;
  isSaving: boolean;
  styles: any;
}> = ({
  workspace,
  isSelected,
  isEditing,
  editedName,
  onSelect,
  onEdit,
  onDelete,
  onSaveEdit,
  onCancelEdit,
  isSaving,
  styles,
}) => (
  <MenuItem
    key={workspace.id}
    selected={isSelected}
    onClick={onSelect}
    sx={{
      ...styles.menuItem,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      "&:hover .workspace-actions": { visibility: "visible", opacity: 1 },
    }}
  >
    {isEditing ? (
      <WorkspaceInput
        value={editedName}
        placeholder="Workspace name"
        onSave={onSaveEdit}
        onCancel={onCancelEdit}
        loading={isSaving}
        styles={styles}
      />
    ) : (
      <>
        <ListItemText primary={workspace.name} sx={{ flex: 1 }} />
        {workspace.id !== "default" && (
          <Box
            className="workspace-actions"
            sx={{
              display: "flex",
              gap: 0.5,
              visibility: { xs: "visible", sm: "hidden" },
              opacity: { xs: 1, sm: 0.7 },
              transition: "all 0.2s ease-in-out",
              "&:hover": { opacity: 1 },
            }}
          >
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              sx={{ p: 0.5, "&:hover": { backgroundColor: "action.hover" } }}
            >
              <Edit2 sx={{ fontSize: 18 }} />
            </IconButton>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              sx={{
                p: 0.5,
                "&:hover": {
                  backgroundColor: "error.light",
                  color: "error.contrastText",
                },
              }}
            >
              <DeleteIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        )}
      </>
    )}
  </MenuItem>
);

const WorkspaceManager: React.FC = () => {
  const theme = useTheme();
  const styles = getWorkspaceStyles(theme);
  const {
    workspaces,
    currentWorkspace,
    updateWorkspace,
    createWorkspace,
    deleteWorkspace,
    selectWorkspace,
  } = useWorkspaceOperations();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedName, setEditedName] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [workspaceToDelete, setWorkspaceToDelete] = useState<Workspace | null>(
    null,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [showCreateInput, setShowCreateInput] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
    setShowCreateInput(false);
    setEditingId(null);
  }, []);

  const handleSaveRename = useCallback(
    async (name: string) => {
      const workspace = workspaces.find((w) => w.id === editingId);
      if (workspace && name.trim()) {
        setIsSaving(true);
        const success = await updateWorkspace(workspace, name);
        if (success) {
          setEditingId(null);
          setEditedName("");
        }
        setIsSaving(false);
      }
    },
    [editingId, workspaces, updateWorkspace],
  );

  const handleCreateWorkspace = useCallback(
    async (name: string) => {
      if (name.trim()) {
        setIsCreating(true);
        const success = await createWorkspace(name);
        if (success) {
          setShowCreateInput(false);
          handleClose();
        }
        setIsCreating(false);
      }
    },
    [createWorkspace, handleClose],
  );

  const confirmDelete = useCallback(async () => {
    if (workspaceToDelete) {
      await deleteWorkspace(workspaceToDelete);
      setShowDeleteDialog(false);
      setWorkspaceToDelete(null);
    }
  }, [workspaceToDelete, deleteWorkspace]);

  return (
    <>
      <Button
        onClick={(e) => setAnchorEl(e.currentTarget)}
        endIcon={<ChevronDown />}
        sx={styles.workspaceButton}
      >
        {currentWorkspace?.name}
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{ sx: styles.menuPaper }}
        disableAutoFocusItem={true}
        MenuListProps={{
          disableListWrap: true,
          onKeyDown: (e) => {
            if (editingId || showCreateInput) e.stopPropagation();
          },
        }}
      >
        {showCreateInput ? (
          <MenuItem>
            <WorkspaceInput
              placeholder="New workspace name"
              onSave={handleCreateWorkspace}
              onCancel={() => setShowCreateInput(false)}
              loading={isCreating}
              styles={styles}
            />
          </MenuItem>
        ) : (
          <MenuItem onClick={() => setShowCreateInput(true)}>
            <ListItemIcon>
              <PlusCircle />
            </ListItemIcon>
            <ListItemText>New Workspace</ListItemText>
          </MenuItem>
        )}

        <Divider />

        {[{ id: "default", name: "default" }, ...workspaces].map(
          (workspace) => (
            <WorkspaceItem
              key={workspace.id}
              workspace={workspace}
              isSelected={workspace.id === currentWorkspace?.id}
              isEditing={editingId === workspace.id}
              editedName={editedName}
              onSelect={() => {
                selectWorkspace(workspace);
                handleClose();
              }}
              onEdit={() => {
                setEditingId(workspace.id);
                setEditedName(workspace.name);
              }}
              onDelete={() => {
                setWorkspaceToDelete(workspace);
                setShowDeleteDialog(true);
                setAnchorEl(null);
              }}
              onSaveEdit={handleSaveRename}
              onCancelEdit={() => setEditingId(null)}
              isSaving={isSaving}
              styles={styles}
            />
          ),
        )}
      </Menu>

      <Dialog
        open={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setWorkspaceToDelete(null);
        }}
      >
        <DialogTitle>Delete Workspace</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete workspace "{workspaceToDelete?.name}
            "? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setShowDeleteDialog(false);
              setWorkspaceToDelete(null);
            }}
          >
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default WorkspaceManager;
