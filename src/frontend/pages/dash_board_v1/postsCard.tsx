import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Box, Typography, Avatar, Divider, Collapse } from "@mui/material";
import { Chat, Person, AccessTime } from "@mui/icons-material";
import { BaseCard, CardHeader } from "./card";
import Posts from "../discover/posts";
import FullscreenDialog from "./FullscreenDialog"; // Import the shared dialog
import { formatRelativeTime } from "@/utils/time";
import { RootState } from "@/redux/reducers";
import extractFiveWordsMax from "@/utils/getTextFromTree";

export const PostsCard = ({
  isHovered,
  isExpanded,
  onMouseEnter,
  onMouseLeave,
  onClick,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const { posts } = useSelector((state: RootState) => state.filesState);

  const nonCommentPosts = posts.filter((post) => !post.is_comment);
  const totalPosts = nonCommentPosts.length;

  const latestPost = nonCommentPosts.sort(
    (a, b) => Number(b.date_created) - Number(a.date_created),
  )[0];

  const latestPostDate = latestPost
    ? formatRelativeTime(Number(latestPost.date_created))
    : "No posts yet";

  const recentPosts = nonCommentPosts
    .sort((a, b) => Number(b.date_created) - Number(a.date_created))
    .slice(0, 3);

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  return (
    <>
      <BaseCard
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onClick={() => setDialogOpen(true)}
        sx={{ cursor: "pointer" }}
      >
        <CardHeader icon={<Chat />} title="Recent Posts" />

        <Box display="flex" flexDirection="column" gap={2}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography
                variant="h4"
                sx={{ fontWeight: "bold", color: "primary.main" }}
              >
                {totalPosts}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Total Posts
              </Typography>
            </Box>
          </Box>

          {recentPosts.length > 0 && (
            <Box>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: "medium" }}>
                Recent Activity
              </Typography>
              {recentPosts.map((post, idx) => (
                <Box key={post.id} sx={{ mb: 1 }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        minWidth: "fit-content",
                      }}
                    >
                      <AccessTime fontSize="small" />
                      {formatRelativeTime(Number(post.date_created))}
                    </Typography>
                    <Avatar sx={{ width: 24, height: 24 }}>
                      <Person fontSize="small" />
                    </Avatar>
                    <Typography
                      variant="caption"
                      sx={{
                        flex: 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {post.creator?.name || "Anonymous"}:{" "}
                      {extractFiveWordsMax(post.content_tree) || "New post"}...
                    </Typography>
                  </Box>
                  {idx < recentPosts.length - 1 && <Divider sx={{ my: 0.5 }} />}
                </Box>
              ))}
            </Box>
          )}
        </Box>

        <Collapse in={isExpanded}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="body2" color="text.secondary">
            Community discussions are active with {totalPosts} posts shared.
            {latestPost &&
              ` Latest activity from ${latestPost.creator?.name || "Anonymous"}.`}
            Click to view all posts and join the conversation.
          </Typography>
        </Collapse>
      </BaseCard>

      {/* Use Shared Fullscreen Dialog */}
      <FullscreenDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        title={`All Posts (${totalPosts})`}
        showTitle={true}
      >
        <Posts />
      </FullscreenDialog>
    </>
  );
};
