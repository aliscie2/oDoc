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
  const isLoggedIn = authStatus === 'registered';
  const { searchValue, searchTool } = useSelector(
    (state: any) => state.uiState,
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
        console.log("Fetched posts:", fetchedPosts);

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
