import React, { useState, useRef } from "react";
import {
  Button,
  Menu,
  TextField,
  Autocomplete,
  CircularProgress,
  Box,
  IconButton,
  Typography,
} from "@mui/material";
import ShareIcon from "@mui/icons-material/Share";
import { useDispatch, useSelector } from "react-redux";
import { Principal } from "@dfinity/principal";
import { backendActor } from "../../utils/backendUtils";
import { useSnackbar } from "notistack";
import { Check, Copy } from "lucide-react";
import { useDocsSave } from "../Actions/useDocsSave";

const CopyButton = ({ onClick }) => {
  const [showCheck, setShowCheck] = useState(false);

  const handleClick = async () => {
    await onClick();
    setShowCheck(true);
    setTimeout(() => setShowCheck(false), 3000);
  };

  return (
    <IconButton
      onClick={handleClick}
      size="small"
      className="hover:bg-gray-100 transition-colors duration-200"
    >
      {showCheck ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </IconButton>
  );
};

type ShareFilePermission =
  | { CanComment: null }
  | { None: null }
  | { CanView: null }
  | { CanUpdate: null };

interface ShareOption {
  label: string;
  value: ShareFilePermission;
  principalId?: string;
}

const ShareFileButton = () => {
  const { contracts, profile, all_friends, current_file } = useSelector(
    (state: unknown) => state.filesState,
  );
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();
  const { save: saveDoc } = useDocsSave();

  const anchorElRef = useRef<HTMLElement | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] =
    useState<ShareOption | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [userPermissions, setUserPermissions] = useState<
    [Principal, ShareFilePermission][]
  >([]);

  const generateShareOptions = (): ShareOption[] => {
    const baseOptions = [
      {
        label: "Everyone can view",
        value: { CanView: null } as ShareFilePermission,
      },
      {
        label: "Everyone can update",
        value: { CanUpdate: null } as ShareFilePermission,
      },
    ];

    const friendOptions =
      all_friends?.flatMap((friend) => [
        {
          label: `${friend.name} can view`,
          value: { CanView: null } as ShareFilePermission,
          principalId: Principal.fromText(friend.id),
        },
        {
          label: `${friend.name} can update`,
          value: { CanUpdate: null } as ShareFilePermission,
          principalId: Principal.fromText(friend.id),
        },
      ]) || [];

    return [...baseOptions, ...friendOptions];
  };

  const handleClick = async (event: React.MouseEvent<HTMLElement>) => {
    anchorElRef.current = event.currentTarget;
    setIsMenuOpen(true);

    if (!current_file?.share_id || current_file.share_id.length === 0) {
      setIsLoading(true);
      try {
        await saveDoc();

        if (!profile?.id) {
          enqueueSnackbar("Profile not loaded", { variant: "error" });
          return;
        }

        const shareFileInput = {
          id: current_file.id,
          owner: Principal.fromText(profile.id),
          permission: { CanView: null },
          users_permissions: [],
        };

        const shareRes = await backendActor.share_file(shareFileInput);

        if (shareRes.Ok) {
          const fileRes = await backendActor.get_file(current_file.id);
          dispatch({
            type: "CURRENT_FILE",
            file: fileRes.Ok || { ...current_file, share_id: [shareRes.Ok.id] },
          });
        } else if (shareRes.Err) {
          enqueueSnackbar(`Failed to generate share link: ${shareRes.Err}`, {
            variant: "error",
          });
        } else {
          enqueueSnackbar("Failed to generate share link", {
            variant: "error",
          });
        }
      } catch (error) {
        enqueueSnackbar("Failed to save file before sharing", {
          variant: "error",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleClose = () => {
    setIsMenuOpen(false);
    anchorElRef.current = null;
  };

  const handleCopyLink = async () => {
    const shareLink = `${window.location.origin}/share/?id=${current_file?.share_id[0]}`;
    try {
      await navigator.clipboard.writeText(shareLink);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handlePermissionChange = (
    event: unknown,
    newValue: ShareOption | null,
  ) => {
    setSelectedPermission(newValue);
    if (newValue?.principalId) {
      const principalId = Principal.fromText(newValue.principalId);
      const filteredPermissions = userPermissions.filter(
        ([principal]) => principal.toString() !== principalId.toString(),
      );
      setUserPermissions([
        ...filteredPermissions,
        [principalId, newValue.value],
      ]);
    }
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!current_file || !profile?.id) return;

    setIsLoading(true);
    try {
      const shareFileInput = {
        id: current_file.id,
        owner: Principal.fromText(profile.id),
        permission: selectedPermission?.value || { CanView: null },
        users_permissions: userPermissions,
      };

      const res = await backendActor.share_file(shareFileInput);

      if (res.Err) {
        enqueueSnackbar(
          res.Err + " Click on the save button first then try again.",
          { variant: "error" },
        );
        return;
      }

      dispatch({
        type: "CURRENT_FILE",
        file: { ...current_file, share_id: [res.Ok.id] },
      });

      setHasChanges(false);
      handleClose();
    } catch (error) {
      console.error("Error sharing file:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!current_file) return null;

  return (
    <div>
      <IconButton
        variant="contained"
        color="primary"
        onClick={handleClick}
        disabled={!current_file}
      >
        <ShareIcon />
      </IconButton>
      <Menu
        anchorEl={anchorElRef.current}
        open={isMenuOpen}
        onClose={handleClose}
      >
        <Box sx={{ p: 2, minWidth: 300 }}>
          {isLoading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: 100,
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Box sx={{ mb: 2, display: "flex", alignItems: "center" }}>
                <Typography fullWidth size="small">
                  {`${window.location.origin}/share/?id=${current_file?.share_id[0]}`}
                </Typography>
                <CopyButton onClick={handleCopyLink} />
              </Box>
              {current_file?.author === profile?.id && (
                <Box sx={{ mb: 2 }}>
                  <Autocomplete
                    options={generateShareOptions()}
                    value={selectedPermission}
                    onChange={handlePermissionChange}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Set permissions"
                        size="small"
                      />
                    )}
                  />
                </Box>
              )}
              {hasChanges && (
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={handleSave}
                  disabled={isLoading}
                >
                  {isLoading ? <CircularProgress size={24} /> : "Save Changes"}
                </Button>
              )}
            </>
          )}
        </Box>
      </Menu>
    </div>
  );
};

export default ShareFileButton;
