import ViewListIcon from "@mui/icons-material/ViewList";
import {
  alpha,
  Box,
  Collapse,
  IconButton,
  Input,
  styled,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { debounce } from "lodash";
import { memo, useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { Link } from "react-router-dom";
import EditorComponent from "../../components/EditorComponent";
import NestedTabMenu from "./contentTab";

import RunawayJellyfish from "@/components/creature/runAeayJellyFish";
import { Helmet } from "react-helmet-async";
import NotFound from "../notFound404";
import { useAuth } from "@/hooks/useAuth";
import { logger } from "@/DevUtils/logData";

// Custom hook for file data fetching
const useFileData = (fileId: string) => {
  const { isLoggedIn } = useAuth();
  const dispatch = useDispatch();
  const [fetchingFromBackend, setFetchingFromBackend] = useState(false);

  const {
    inited,
    files_content,
    profile,
    files,
    current_file,
    lookingForFile,
  } = useSelector((state: any) => state.filesState);

  const currentFile = files.find((file: any) => file.id === fileId);

  // Set current file in Redux if not already set
  useEffect(() => {
    dispatch({
      type: "CURRENT_FILE",
      file: currentFile,
    });
  }, [currentFile]);

  // Fetch file from backend if not found locally
  // useEffect(() => {
  //   const fetchFileFromBackend = async () => {
  //     if (
  //       !currentFile &&
  //       fileId &&
  //       isLoggedIn &&
  //       inited &&
  //       !fetchingFromBackend
  //     ) {
  //       setFetchingFromBackend(true);
  //       try {
  //         console.log('ok....')
  //           const res = await backendActor.get_one_file_content(fileId);
  //           console.log({res})
  //           const files = res[0];
  //           const contents: Array<[string, Array<any>]> = res[1];

  //           if (files.length > 0) {
  //             dispatch({ type: "ADD_FILES_LIST", files });
  //             dispatch({ type: "ADD_CONTENTS_LIST", contents });
  //           }

  //       } catch (error) {
  //         console.error("Error fetching file from backend:", error);
  //       } finally {
  //         setFetchingFromBackend(false);
  //       }
  //     }
  //   };

  //   fetchFileFromBackend();
  // }, [currentFile, fileId, isLoggedIn, inited, fetchingFromBackend, dispatch]);

  return {
    currentFile,
    files_content,
    profile,
    inited,
    fetchingFromBackend,
  };
};

const ExpandingInput = styled(Input)(({ theme }) => ({
  "& input": {
    width: "100%",
    fontSize: "1.5rem",
    minWidth: 0,
    padding: "4px 8px",
    transition: "all 0.2s ease",

    "&:hover, &:focus": {
      background: alpha(theme.palette.common.black, 0.02),
    },
  },
}));

const TopBar = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  width: "100%",
  marginBottom: theme.spacing(2),
  gap: theme.spacing(1),
}));

const AnimatedIconButton = styled(IconButton)(({ theme }) => ({
  transition: "all 0.2s ease",
  "&:hover": {
    transform: "scale(1.1)",
  },
  "&.active": {
    color: theme.palette.primary.main,
    background: alpha(theme.palette.primary.main, 0.1),
  },
}));

const ToggleWrapper = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  transition: "opacity 0.3s ease, transform 0.3s ease",
  "&.hidden": {
    opacity: 0,
    transform: "translateX(-20px)",
  },
}));

function FileContentPage() {
  const { isLoggedIn } = useAuth();
  const isMobile = useMediaQuery(useTheme().breakpoints.down("sm"));

  const [showContentTabs, setShowContentTabs] = useState(false);
  const fileId = window.location.pathname.split("/")[1];
  const dispatch = useDispatch();

  // Use custom hook for file data management
  const { currentFile, files_content, profile, inited, fetchingFromBackend } =
    useFileData(fileId);
  const editorKey = (currentFile && currentFile.id) || "";

  const handleContentTabsToggle = () => {
    setShowContentTabs(!showContentTabs);
  };

  const handleDispatchChange = useCallback(
    debounce((title: string) => {
      if (title !== currentFile?.name) {
        dispatch({ type: "UPDATE_FILE_TITLE", id: currentFile.id, title });
      }
    }, 250),
    [dispatch, currentFile],
  );

  const handleInputChange = (title: string) => {
    handleDispatchChange(title);
  };

  const onChange = debounce((changes: any) => {
    if (!currentFile) return;

    const prevContent = JSON.stringify(files_content[currentFile.id]);
    const newContent = JSON.stringify(changes);

    if (prevContent !== newContent) {
      dispatch({
        type: "UPDATE_CONTENT",
        id: currentFile.id,
        content: changes,
      });
    }
  }, 250);

  // Show loading spinner while files are being loaded or fetching from backend
  if ((!inited && isLoggedIn && !currentFile) || fetchingFromBackend) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <RunawayJellyfish thinking={true} scale={isMobile ? 1.5 : 2} />
      </Box>
    );
  }

  // Check for 404 case - only show 404 if initialization is complete, not fetching, and file is still not found
  if (!currentFile || inited  && !fetchingFromBackend) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <NotFound />
      </Box>
    );
  }

  const editable =
    currentFile?.author === profile?.id ||
    Object.keys(currentFile.permission)[0] === "CanUpdate" ||
    currentFile.users_permissions.some(
      ([userId, permissions]: [string, any]) =>
        userId === profile.id && permissions.CanUpdate,
    );

  const isAuthor = currentFile?.author === profile?.id;



  return (
    <div style={{ marginTop: "3px", marginLeft: "10%", marginRight: "10%" }}>
      <Helmet>
        <title>{currentFile.name}</title>
      </Helmet>

      <TopBar>
        <Collapse in={!showContentTabs} timeout={300}>
          <ToggleWrapper className={showContentTabs ? "hidden" : ""}>
            <Tooltip title="Toggle Content Tabs" arrow>
              <AnimatedIconButton
                onClick={handleContentTabsToggle}
                className={showContentTabs ? "active" : ""}
                size="small"
              >
                <ViewListIcon />
              </AnimatedIconButton>
            </Tooltip>
          </ToggleWrapper>
        </Collapse>

        <ExpandingInput
          key={currentFile.id}
          fullWidth
          multiline
          rows={1}
          sx={{
            minWidth: "200px",
            maxWidth: "100%",
          }}
          inputProps={{
            style: {
              fontSize: "1.5rem",
              lineHeight: "1.5",
              whiteSpace: "pre-wrap",
              wordWrap: "break-word",
            },
          }}
          disabled={!isAuthor}
          defaultValue={currentFile.name}
          placeholder="Untitled"
          onChange={(e) => handleInputChange(e.target.value)}
        />
      </TopBar>

      <NestedTabMenu
        onClose={() => {
          setShowContentTabs(false);
        }}
        open={showContentTabs}
        content={files_content[currentFile.id]}
      />

      {!isAuthor && (
        <Typography
          to={`/user?id=${currentFile?.author}`}
          component={Link}
          variant="body1"
          color={"primary"}
        >
          See the author
        </Typography>
      )}

      <EditorComponent
        readOnly={!isAuthor}
        id={currentFile.id}
        onChange={onChange}
        editorKey={editorKey}
        content={files_content[currentFile.id]}
      />
    </div>
  );
}

export default memo(FileContentPage);
