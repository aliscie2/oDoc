// Backend optimization: For posts by the same creator, only the first post contains
// the full photo data. Subsequent posts from the same creator have an empty photo array.
// This reduces bandwidth significantly (e.g., instead of sending 50KB * 3 posts = 150KB,
// we send 50KB + 0KB + 0KB = 50KB). The frontend should cache creator photos and reuse
// them across all posts by the same creator based on the creator.id.

import { useAuth } from "@/hooks/useAuth";
import { RootState } from "@/redux/reducers";
import { backendActor } from "@/utils/backendUtils";
import { Box } from "@mui/material";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import CreatePost from "./createPost";
import LoadMorePosts from "./LoadMorePosts";
import ViewPostComponent from "./viewPost";

const Posts: React.FC = () => {
  const dispatch = useDispatch();
  const { posts } = useSelector((state: RootState) => state.filesState);
  const { authStatus } = useAuth();
  const isLoggedIn = authStatus === "registered";
  const { searchValue, searchTool } = useSelector(
    (state: unknown) => state.uiState,
  );

  // Posts initialization with session storage
  useEffect(() => {
    const fetchPosts = async () => {
      // Check if posts are already initialized in session storage
      const postsInitialized = sessionStorage.getItem("postsInitialized");

      if (posts.length > 0 || postsInitialized === "true") {
        return;
      }

      try {
        const fetchedPosts = await backendActor.get_posts(
          BigInt(0),
          BigInt(10),
        );

        if (fetchedPosts.length > 0) {
          dispatch({ type: "ADD_POSTS", posts: fetchedPosts });
        }

        // Mark posts as initialized in session storage
        sessionStorage.setItem("postsInitialized", "true");
      } catch (error) {
        console.error("Posts fetch error:", error);
      }
    };

    fetchPosts();
  }, [posts.length, dispatch]);

  const filterPosts = React.useMemo(() => {
    const searchLower = searchValue.toLowerCase();
    return posts.filter((post) => {
      const contentTreeText = post?.content_tree
        .map((node) => node.text?.toLowerCase() || "")
        .join(" ");
      return (
        contentTreeText.includes(searchLower) ||
        post.creator?.name?.toLowerCase().includes(searchLower)
      );
    });
  }, [posts, searchValue]);

  return (
    <>
      {isLoggedIn && <CreatePost />}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }} />
      </Box>
      {filterPosts
        .filter((post) => !post.is_comment)
        .map((post) => (
          <ViewPostComponent key={post.id} post={post} />
        ))}
      <LoadMorePosts />
    </>
  );
};

export default Posts;
