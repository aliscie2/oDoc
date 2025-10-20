import { ChatSettingsDialog } from "@/components/Chat/ChatSettingsDialog";
import { ChatHeader } from "@/components/Chat/components/ChatHeader";
import { ChatListItem } from "@/components/Chat/components/ChatListItem";
import { CreateGroupDialog } from "@/components/Chat/CreateGroupDialog";
import { useChatListOperations } from "@/components/Chat/hooks/useChatListOperations";
import { useChatSettings } from "@/components/Chat/hooks/useChatSettings";
import { getUnreadCount } from "@/components/Chat/utils";
import { RootState } from "@/redux/reducers";
import { backendActor } from "@/utils/backendUtils";
import { Add as AddIcon, Chat as ChatIcon } from "@mui/icons-material";
import { Box, Button, CircularProgress, List, Typography } from "@mui/material";
import React, { useCallback, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const ChatsPage: React.FC = () => {
  const dispatch = useDispatch();
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreChats, setHasMoreChats] = useState(true);

  const { chats } = useSelector((state: RootState) => state.chatsState);
  const { profile, all_friends, currentWorkspace, workspaces } = useSelector(
    (state: RootState) => state.filesState,
  );

  // Use custom hooks
  const { getOtherUser, handleOpenChat, shouldShowSettings } =
    useChatListOperations({ profile });

  const {
    isSettingsOpen,
    selectedChat,
    openSettings,
    closeSettings,
    handleSaveSettings,
    handleDeleteChat,
  } = useChatSettings();

  const filteredChats = useMemo(() => {
    if (!currentWorkspace || currentWorkspace.name === "default") return chats;
    return chats.filter((chat) =>
      chat.workspaces.includes(currentWorkspace.id),
    );
  }, [chats, currentWorkspace]);

  const _totalUnread = useMemo(() => {
    if (!profile?.id) return 0;
    return filteredChats.reduce(
      (total, chat) => total + getUnreadCount(chat.messages, profile.id),
      0,
    );
  }, [filteredChats, profile?.id]);

  const handleLoadMore = useCallback(async () => {
    if (!backendActor || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const chatsList = await backendActor.get_my_chats(
        BigInt(chats?.length || 0),
      );

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
  }, [backendActor, chats?.length, isLoadingMore, dispatch]);

  const handleCreateGroup = useCallback(
    async (formData: {
      name: string;
      members: Array<{ id: string; name: string } | null>;
      admins: Array<{ id: string; name: string } | null>;
      workspace: Array<{ id: string; name: string } | null>;
    }) => {
      if (!backendActor || !profile?.id) return;
      try {
        const { Principal } = await import("@dfinity/principal");
        const { randomString } = await import("@/DataProcessing/dataSamples");

        const { validateUsers, validateWorkspaces, createAdminArray } =
          await import("@/components/Chat/utils/chatUtils");

        // Validate and filter input data
        const validMembers = validateUsers(formData.members);
        const validAdmins = validateUsers(formData.admins);
        const validWorkspaces = validateWorkspaces(formData.workspace);

        const chatId = randomString();

        // Create chat for backend (Chat type with Principal)
        const newChatForBackend = {
          id: chatId,
          name: formData.name || "Untitled",
          messages: [],
          members:
            validMembers.length > 0
              ? validMembers.map((m) => Principal.fromText(m.id))
              : [Principal.fromText(profile.id)],
          admins: createAdminArray(profile.id, validAdmins),
          workspaces:
            validWorkspaces.length > 0
              ? validWorkspaces.map((w) => w.id)
              : currentWorkspace?.name !== "default" && currentWorkspace
                ? [currentWorkspace.id]
                : [],
          creator: Principal.fromText(profile.id),
        };

        const result = await backendActor.make_new_chat_room(newChatForBackend);

        if ("Ok" in result) {
          // Add the new chat to Redux and open it
          dispatch({ type: "SET_CHATS", chats: [newChatForBackend, ...chats] });
          handleOpenChat(newChatForBackend);
        } else {
          throw new Error(result.Err || "Failed to create chat");
        }
      } catch (error) {
        console.error("Failed to create group chat:", error);
        // TODO: Show user-friendly error message
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

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: { xs: "calc(100vh - 56px)", sm: "100vh" }, // Account for bottom nav on mobile
        bgcolor: "background.default",
        pb: { xs: 1, sm: 0 }, // Small padding on mobile to ensure no overlap
        mx: { xs: 0, md: 16, lg: 29 }, // Add horizontal margin on desktop
      }}
    >
      <ChatHeader
        title="Chats"
        actions={
          <Button
            startIcon={<AddIcon />}
            variant="contained"
            size="small"
            onClick={() => setCreateGroupOpen(true)}
            sx={{ borderRadius: 2 }}
          >
            New Group
          </Button>
        }
      />

      <Box sx={{ flex: 1, overflow: "auto" }}>
        {filteredChats.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              p: 4,
            }}
          >
            <ChatIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {currentWorkspace?.name && currentWorkspace.name !== "default"
                ? `"${currentWorkspace.name}" has no chats yet`
                : "No chats yet"}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
            >
              Start a conversation by creating a new group chat.
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {filteredChats.map((chat) => {
              const unreadCount = profile?.id
                ? getUnreadCount(chat.messages, profile.id)
                : 0;
              const otherUser = getOtherUser(chat);
              const lastMessage = chat.messages[0]?.message || "No messages";

              return (
                <ChatListItem
                  key={chat.id}
                  chat={chat}
                  unreadCount={unreadCount}
                  lastMessage={lastMessage}
                  otherUser={otherUser}
                  showSettings={shouldShowSettings(chat)}
                  onClick={() => handleOpenChat(chat)}
                  onSettingsClick={() => openSettings(chat)}
                  compact={false}
                />
              );
            })}

            {filteredChats.length > 0 && hasMoreChats && (
              <Box sx={{ p: 2 }}>
                <Button
                  fullWidth
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  startIcon={
                    isLoadingMore ? <CircularProgress size={16} /> : null
                  }
                  sx={{ borderRadius: 2 }}
                >
                  {isLoadingMore ? "Loading..." : "Load More Chats"}
                </Button>
              </Box>
            )}
          </List>
        )}
      </Box>

      <CreateGroupDialog
        open={createGroupOpen}
        onClose={() => setCreateGroupOpen(false)}
        onSubmit={handleCreateGroup}
        users={all_friends as any}
        workspaces={workspaces as any}
        currentWorkspace={currentWorkspace as any}
      />

      {selectedChat && (
        <ChatSettingsDialog
          open={isSettingsOpen}
          onClose={closeSettings}
          chat={selectedChat}
          currentUserId={profile?.id || ""}
          allFriends={all_friends as any}
          workspaces={workspaces as unknown}
          onSave={handleSaveSettings}
          onDelete={() => handleDeleteChat(selectedChat.id)}
        />
      )}
    </Box>
  );
};

export default ChatsPage;
