import React, { useState } from "react";
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
    setTimeout(() => {
      setShowCheck(false);
    }, 3000);
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
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const dispatch = useDispatch();
  const { save: saveDoc } = useDocsSave();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedPermission, setSelectedPermission] =
    useState<ShareOption | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [userPermissions, setUserPermissions] = useState<
    [Principal, ShareFilePermission][]
  >([]);

  // Using direct backendActor import

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
      all_friends
        ?.map((friend) => [
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
        ])
        .flat() || [];

    return [...baseOptions, ...friendOptions];
  };

  const handleClick = async (event: React.MouseEvent<HTMLElement>) => {
    console.log("🔵 [Share Button] Clicked");
    console.log("🔵 [Share Button] Current file:", current_file);
    console.log("🔵 [Share Button] Share ID:", current_file?.share_id);
    
    setAnchorEl(event.currentTarget);
    
    // If share_id is undefined, save the file first then call share_file
    if (!current_file?.share_id || current_file.share_id.length === 0) {
      console.log("⚠️ [Share Button] No share_id found, initiating save and share flow");
      setIsLoading(true);
      try {
        console.log("📝 [Share Button] Calling saveDoc()...");
        await saveDoc();
        console.log("✅ [Share Button] saveDoc() completed");
        
        if (!profile?.id) {
          console.error("❌ [Share Button] No profile ID found");
          enqueueSnackbar("Profile not loaded", { variant: "error" });
          return;
        }
        
        // Call share_file to generate the share_id
        console.log("🔗 [Share Button] Calling share_file to generate share_id");
        const shareFileInput = {
          id: current_file.id,
          owner: Principal.fromText(profile.id),
          permission: { CanView: null },
          users_permissions: [],
        };
        console.log("📤 [Share Button] share_file input:", shareFileInput);
        
        const shareRes = await backendActor.share_file(shareFileInput);
        console.log("📦 [Share Button] share_file response:", shareRes);
        
        if (shareRes.Ok) {
          console.log("✅ [Share Button] share_file successful");
          console.log("🔗 [Share Button] Generated share ID:", shareRes.Ok.id);
          
          // Now fetch the updated file to get complete data
          console.log("🔄 [Share Button] Fetching updated file from backend");
          const fileRes = await backendActor.get_file(current_file.id);
          console.log("📦 [Share Button] get_file response:", fileRes);
          
          if (fileRes.Ok) {
            console.log("✅ [Share Button] File fetched successfully");
            console.log("📄 [Share Button] Updated file data:", fileRes.Ok);
            
            dispatch({
              type: "CURRENT_FILE",
              file: fileRes.Ok,
            });
            console.log("✅ [Share Button] Redux state updated with new file data");
          } else {
            // Fallback: update with share_id from share_file response
            console.log("⚠️ [Share Button] get_file failed, using share_file response");
            dispatch({
              type: "CURRENT_FILE",
              file: { ...current_file, share_id: [shareRes.Ok.id] },
            });
          }
        } else if (shareRes.Err) {
          console.error("❌ [Share Button] share_file error:", shareRes.Err);
          enqueueSnackbar(`Failed to generate share link: ${shareRes.Err}`, { variant: "error" });
        } else {
          console.error("❌ [Share Button] Unexpected share_file response:", shareRes);
          enqueueSnackbar("Failed to generate share link", { variant: "error" });
        }
      } catch (error) {
        console.error("❌ [Share Button] Error in save/share flow:", error);
        console.error("❌ [Share Button] Error stack:", error?.stack);
        enqueueSnackbar("Failed to save file before sharing", { variant: "error" });
      } finally {
        setIsLoading(false);
        console.log("🏁 [Share Button] Loading state cleared");
      }
    } else {
      console.log("✅ [Share Button] Share ID already exists:", current_file.share_id[0]);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleCopyLink = async () => {
    const shareLink = `${window.location.origin}/share/?id=${current_file?.share_id[0]}`;
    console.log("📋 [Copy Link] Attempting to copy:", shareLink);
    try {
      await navigator.clipboard.writeText(shareLink);
      console.log("✅ [Copy Link] Successfully copied to clipboard");
    } catch (err) {
      console.error("❌ [Copy Link] Failed to copy:", err);
    }
  };

  const handlePermissionChange = (event: unknown, newValue: ShareOption | null) => {
    setSelectedPermission(newValue);
    if (newValue?.principalId) {
      // Convert the string principal ID to a Principal type
      const principalId = Principal.fromText(newValue.principalId);

      // Remove any existing permission for this principal
      const filteredPermissions = userPermissions.filter(
        ([principal]) => principal.toString() !== principalId.toString(),
      );

      // Add the new permission
      setUserPermissions([
        ...filteredPermissions,
        [principalId, newValue.value],
      ]);
    }
    setHasChanges(true);
  };

  const handleSave = async () => {
    console.log("💾 [Handle Save] Starting share file save");
    console.log("💾 [Handle Save] Current file:", current_file);
    console.log("💾 [Handle Save] Profile ID:", profile?.id);
    
    if (!current_file || !profile?.id) {
      console.warn("⚠️ [Handle Save] Missing current_file or profile.id, aborting");
      return;
    }

    setIsLoading(true);
    try {
      const shareFileInput = {
        id: current_file.id,
        owner: Principal.fromText(profile.id),
        permission: selectedPermission?.value || { CanView: null },
        users_permissions: userPermissions,
      };
      
      console.log("📤 [Handle Save] Sending share_file request:", shareFileInput);
      const res = await backendActor.share_file(shareFileInput);
      console.log("📥 [Handle Save] Backend response:", res);
      
      if (res.Err) {
        console.error("❌ [Handle Save] Backend error:", res.Err);
        enqueueSnackbar(
          res.Err + " Click on the save button first then try again.",
          { variant: "error" },
        );
        return;
      }
      
      console.log("✅ [Handle Save] Share file successful");
      console.log("🔗 [Handle Save] New share ID:", res.Ok.id);
      
      dispatch({
        type: "CURRENT_FILE",
        file: { ...current_file, share_id: [res.Ok.id] },
      });
      console.log("✅ [Handle Save] Redux state updated");
      
      setHasChanges(false);
      handleClose();
    } catch (error) {
      console.error("❌ [Handle Save] Error sharing file:", error);
      console.error("❌ [Handle Save] Error stack:", error?.stack);
    } finally {
      setIsLoading(false);
      console.log("🏁 [Handle Save] Loading state cleared");
    }
  };

  if (!current_file) {
    return null;
  }

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
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <Box sx={{ p: 2, minWidth: 300 }}>
          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 100 }}>
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
                  <TextField {...params} label="Set permissions" size="small" />
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
