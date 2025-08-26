import React, { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, CircularProgress, Typography, useTheme } from "@mui/material";
import { RootState } from "../../redux/reducers";

const POSTS_PER_PAGE = 20;

const LoadMorePosts = () => {
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loadingRef = useRef(null);
  const theme = useTheme();
  const dispatch = useDispatch();
  const { posts } = useSelector((state: RootState) => state.filesState);
  // Using direct backendActor import

  return (
    <Box
      ref={loadingRef}
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 3,
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
      }}
    >
      {loading ? (
        <CircularProgress size={24} />
      ) : !hasMore ? (
        <Typography variant="body2">No more posts found</Typography>
      ) : null}
    </Box>
  );
};

export default LoadMorePosts;
