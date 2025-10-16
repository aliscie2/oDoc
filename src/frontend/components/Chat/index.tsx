import {
  Add as AddIcon,
  Chat as ChatIcon,
  ExpandMore as ExpandMoreIcon,
  Group as GroupIcon,
} from "@mui/icons-material";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  List,
  Menu,
  Typography,
} from "@mui/material";
import React, { memo, useCallback, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/reducers";
import { backendActor } from "../../utils/backendUtils";
import { ChatFloatingWindow } from "./chatFoatingWindowPage";
import { CreateGroupDialog } from "./CreateGroupDialog";
import { Chat } from "./types";
import { getUnreadCount } from "./utils";
import { useNavigate } from "react-router-dom";
import { Principal } from "@dfinity/principal";

const ChatNotifications = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreChats, setHasMoreChats] = useState(true);

  const { chats, openChatWindows } = useSelector(
    (state: RootState) => state.chatsState,
  );
  const { profile, all_friends, currentWorkspace, workspaces } = useSelector(
    (state: RootState) => state.filesState,
  );

  const filteredChats = useMemo(() => {
    if (!currentWorkspace || currentWorkspace.name === "default") return chats;
    return chats.filter((chat) =>
      chat.workspaces.includes(currentWorkspace.id),
    );
  }, [chats, currentWorkspace]);

  const totalUnread = useMemo(() => {
    if (!profile?.id) return 0;
    return filteredChats.reduce(
      (total, chat) => total + getUnreadCount(chat.messages, profile.id),
      0,
    );
  }, [filteredChats, profile?.id]);

  const handleClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleClose = useCallback(() => setAnchorEl(null), []);

  const handleOpenChat = useCallback(
    async (chat: Chat) => {
      if (window.innerWidth < 600) {
        navigate(`/chat/${chat.id}`);
      } else {
        dispatch({ type: "OPEN_CHAT", chatId: chat.id });
      }

      // Mark all unread messages as seen
      if (backendActor && profile?.id) {
        for (const message of chat.messages) {
          const senderStr =
            message.sender instanceof Principal
              ? message.sender.toString()
              : message.sender;

          if (senderStr !== profile.id) {
            const alreadySeen = message.seen_by.some((user) => {
              const userStr =
                user instanceof Principal ? user.toString() : user;
              return userStr === profile.id;
            });

            if (!alreadySeen) {
              try {
                const result = await backendActor.message_is_seen(message);
                if ("Ok" in result) {
                  const updatedMessage = {
                    ...message,
                    seen_by: [
                      ...message.seen_by,
                      Principal.fromText(profile.id),
                    ],
                  };
                  dispatch({ type: "UPDATE_MESSAGE", message: updatedMessage });
                }
              } catch (error) {
                console.error("Error marking message as seen:", error);
              }
            }
          }
        }
      }

      handleClose();
    },
    [dispatch, handleClose, navigate, backendActor, profile?.id],
  );
  const handleCloseChat = useCallback(
    (chatId: string) => {
      dispatch({ type: "CLOSE_CHAT_WINDOW", chatId });
    },
    [dispatch],
  );

  const getOtherUser = useCallback(
    (chat: Chat) => {
      if (chat.name !== "private_chat") return null;

      const otherMember = chat.members.find(
        (m) => m.toString() !== profile?.id,
      );

      if (!otherMember) return null;

      const ODOC_CEO_ID =
        "tgwpc-6xuon-k3a6y-ey7lt-xksjs-qx22h-ikhbt-4yp3a-6stco-rymbe-pqe";
      if (otherMember.toString() === ODOC_CEO_ID) {
        return {
          id: ODOC_CEO_ID,
          name: "oDoc",
          photo: "/logo.png",
        };
      }

      return all_friends.find((f) => f.id === otherMember.toString());
    },
    [all_friends, profile?.id],
  );

  const getChatDisplayName = useCallback(
    (chat: Chat) => {
      if (chat.name !== "private_chat") {
        return chat.name;
      }

      const otherUser = getOtherUser(chat);
      return otherUser?.name || "Unknown User";
    },
    [getOtherUser],
  );

  const handleLoadMore = useCallback(async () => {
    if (!backendActor || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const chatsList = await backendActor.get_my_chats(chats?.length);
      if (chatsList.length === 0) {
        setHasMoreChats(false);
      } else {
        dispatch({ type: "EXTEND_CHATS", chats: chatsList });
      }
    } catch (error) {
      console.error("Error loading more chats:", error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [backendActor, chats.length, isLoadingMore, dispatch]);

  const handleCreateGroup = useCallback(
    async (formData: any) => {
      if (!backendActor || !profile?.id) return;
      try {
        const { Principal } = await import("@dfinity/principal");
        const { randomString } = await import(
          "../../DataProcessing/dataSamples"
        );

        const newChat = {
          id: randomString(),
          name: formData.name || "Untitled",
          messages: [],
          members:
            formData.members?.length > 0
              ? formData.members.map((m: any) => Principal.fromText(m.id))
              : [Principal.fromText(profile.id)],
          admins:
            formData.admins?.length > 0
              ? formData.admins.map((a: any) => Principal.fromText(a.id))
              : [Principal.fromText(profile.id)],
          workspaces:
            formData.workspace?.length > 0
              ? formData.workspace.map((w: any) => w.id)
              : currentWorkspace?.name !== "default"
                ? [currentWorkspace.id]
                : [],
          creator: Principal.fromText(profile.id),
        };

        const result = await backendActor.make_new_chat_room(newChat);
        if ("Ok" in result) {
          dispatch({ type: "SET_CHATS", chats: [newChat, ...chats] });
          handleOpenChat(newChat);
        }
      } catch (error) {
        console.error("Error creating chat:", error);
      }
      setCreateGroupOpen(false);
    },
    [
      backendActor,
      profile?.id,
      chats,
      dispatch,
      currentWorkspace,
      handleOpenChat,
    ],
  );

  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton
        onClick={handleClick}
        aria-controls={open ? "chat-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        aria-label={`Chats ${totalUnread > 0 ? `(${totalUnread} unread)` : ""}`}
      >
        <Badge badgeContent={totalUnread} color="error">
          <ChatIcon />
        </Badge>
      </IconButton>

      <Menu
        id="chat-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 420,
            maxHeight: "80vh",
            mt: 1,
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Chats
          </Typography>
          <Button
            startIcon={<AddIcon />}
            variant="contained"
            size="small"
            onClick={() => {
              setCreateGroupOpen(true);
              handleClose();
            }}
            sx={{ borderRadius: 2 }}
          >
            New Group
          </Button>
        </Box>

        {filteredChats.length === 0 ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              {currentWorkspace?.name && currentWorkspace.name !== "default"
                ? `"${currentWorkspace.name}" has no chats yet`
                : "No chats yet"}
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0, pb: 1 }}>
            {filteredChats.map((chat) => {
              const unreadCount = profile?.id
                ? getUnreadCount(chat.messages, profile.id)
                : 0;
              const otherUser = getOtherUser(chat);
              const displayName = getChatDisplayName(chat);
              const lastMessage = chat.messages[0]?.message || "No messages";
              const hasUnread = unreadCount > 0;

              return (
                <Card
                  key={chat.id}
                  onClick={() => handleOpenChat(chat)}
                  sx={{
                    mb: 1,
                    mx: 1,
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    "&:hover": { transform: "translateY(-1px)" },
                    bgcolor: hasUnread ? "action.hover" : "background.paper",
                  }}
                >
                  <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                    >
                      <Box sx={{ position: "relative" }}>
                        {chat.name === "private_chat" ? (
                          <Avatar
                            src={otherUser?.photo}
                            alt={displayName}
                            sx={{ width: 40, height: 40 }}
                          >
                            {displayName.charAt(0).toUpperCase()}
                          </Avatar>
                        ) : (
                          <Avatar
                            sx={{
                              width: 40,
                              height: 40,
                              bgcolor: "primary.main",
                            }}
                          >
                            <GroupIcon />
                          </Avatar>
                        )}
                      </Box>

                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 0.25,
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: hasUnread ? 600 : 400 }}
                          >
                            {displayName}
                          </Typography>
                          {hasUnread && (
                            <Badge
                              badgeContent={unreadCount}
                              color="error"
                              sx={{
                                "& .MuiBadge-badge": {
                                  fontSize: "0.65rem",
                                  height: 18,
                                  minWidth: 18,
                                },
                              }}
                            />
                          )}
                        </Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            display: "block",
                          }}
                        >
                          {lastMessage}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
          </List>
        )}

        {filteredChats.length > 0 && hasMoreChats && (
          <Box sx={{ p: 1, borderTop: 1, borderColor: "divider" }}>
            <Button
              fullWidth
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              startIcon={
                isLoadingMore ? (
                  <CircularProgress size={16} />
                ) : (
                  <ExpandMoreIcon />
                )
              }
              sx={{ borderRadius: 2 }}
            >
              {isLoadingMore ? "Loading..." : "Load More Chats"}
            </Button>
          </Box>
        )}
      </Menu>

      <CreateGroupDialog
        open={createGroupOpen}
        onClose={() => setCreateGroupOpen(false)}
        onSubmit={handleCreateGroup}
        users={all_friends}
        workspaces={workspaces}
        currentWorkspace={currentWorkspace}
      />

      {window.innerWidth >= 600 &&
        Object.keys(openChatWindows).map((chatId, index) => {
          const chat = chats.find((c) => c.id === chatId);
          if (!chat) return null;
          return <ChatFloatingWindow key={chatId} chat={chat} index={index} />;
        })}
    </>
  );
};

export default memo(ChatNotifications);
