import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import {
  AppBar, Box, Button, CircularProgress, Dialog, FormControl, IconButton,
  InputLabel, MenuItem, Paper, Select, TextField, Toolbar, Typography,
} from "@mui/material";
import { AdminsSelect, MembersSelect, WorkspaceSelect } from "./index";
import {
  ArrowBack, Check, DragIndicator, OpenInFull, Send, Settings,
  Minimize, Close
} from "@mui/icons-material";
import { useBackendContext } from "../../contexts/BackendContext";
import { useDispatch, useSelector } from "react-redux";
import { Principal } from "@dfinity/principal";
import formatTimestamp from "../../utils/time";
import { Link } from "react-router-dom";
import { Chat } from "../../../declarations/backend/backend.did";
import { handleRedux } from "../../redux/store/handleRedux";

const ChatWindow = memo(({
  chat, onClose, position, onPositionChange, onSendMessage, onUpdateChat, dialog = false
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isSettingsView, setIsSettingsView] = useState(false);
  const [formData, setFormData] = useState({
    name: chat.name,
    workspaces: chat.workspaces,
    admins: chat.admins,
    members: chat.members,
  });
  const { workspaces, all_friends, profile } = useSelector(state => state.filesState);
  const { backendActor } = useBackendContext();
  const dispatch = useDispatch();
  
  const [dragPosition, setDragPosition] = useState(position || { x: 100, y: 100 });
  const [newMessage, setNewMessage] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const messagesEndRef = useRef(null);
  const saveSuccessTimeout = useRef(null);

  const isDragEnabled = position && onPositionChange;

  useEffect(() => {
    if (position) setDragPosition(position);
  }, [position]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => scrollToBottom(), [chat.messages, scrollToBottom]);

  const renderSenderName = (sender) => {
    const senderStr = sender instanceof Principal ? sender.toString() : sender?.toString();
    if (!senderStr) return "Unknown User";
    
    return senderStr === profile?.id
      ? "You"
      : all_friends.find(u => u.id === senderStr)?.name || senderStr.slice(8, 16);
  };

  const isCurrentUser = (sender) => {
    const senderStr = sender instanceof Principal ? sender.toString() : sender?.__principal__;
    return senderStr === profile?.id;
  };

  const handleSendMessage = useCallback(async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !profile?.id || isSending) return;

    try {
      setIsSending(true);
      await onSendMessage(chat.id, newMessage);
      setNewMessage("");
      scrollToBottom();
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  }, [chat.id, newMessage, profile?.id, isSending, onSendMessage, scrollToBottom]);

  const handleDragStart = useCallback((e) => {
    if (!isDragEnabled) return;
    setIsDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.dataset.offsetX = e.clientX - rect.left;
    e.currentTarget.dataset.offsetY = e.clientY - rect.top;
  }, [isDragEnabled]);

  const handleDrag = useCallback((e) => {
    if (!isDragEnabled || !isDragging || !e.clientX || !e.clientY) return;
    const offsetX = parseFloat(e.currentTarget.dataset.offsetX);
    const offsetY = parseFloat(e.currentTarget.dataset.offsetY);
    setDragPosition({
      x: Math.max(0, e.clientX - offsetX),
      y: Math.max(0, e.clientY - offsetY),
    });
  }, [isDragEnabled, isDragging]);

  const handleDragEnd = useCallback(() => {
    if (!isDragEnabled) return;
    setIsDragging(false);
    onPositionChange?.(chat.id, dragPosition);
  }, [isDragEnabled, chat.id, dragPosition, onPositionChange]);

  const handleSaveChat = async (updatedChat) => {
    setIsSaving(true);
    try {
      const formattedChat = {
        ...updatedChat,
        admins: updatedChat.admins.map(a => Principal.fromText(a.id || a)),
        creator: updatedChat.creator instanceof Principal 
          ? updatedChat.creator 
          : Principal.fromText(updatedChat.creator.id),
        members: updatedChat.members.map(m => Principal.fromText(m.id || m)),
        messages: updatedChat.messages.map(msg => ({
          ...msg,
          sender: msg.sender instanceof Principal ? msg.sender : Principal.fromText(msg.sender),
          seen_by: msg.seen_by.map(s => s instanceof Principal ? s : Principal.fromText(s)),
          date: typeof msg.date === "bigint" ? msg.date : BigInt(msg.date.toString()),
        })),
      };
      
      const result = await backendActor.update_chat(formattedChat);
      if ("Ok" in result) {
        onUpdateChat?.(result.Ok);
        setSaveSuccess(true);
        if (saveSuccessTimeout.current) clearTimeout(saveSuccessTimeout.current);
        saveSuccessTimeout.current = setTimeout(() => setSaveSuccess(false), 2000);
      }
    } catch (error) {
      console.error("Failed to update chat:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteChat = () => {
    if (!window.confirm("Are you sure you want to delete this chat? This action cannot be undone.")) return;
    
    backendActor.delete_chat(chat.id)
      .then(result => {
        if ("Ok" in result) {
          dispatch(handleRedux("DELETE_CHAT", { chat_id: chat.id }));
          onClose(chat.id);
        }
      })
      .catch(error => console.error("Failed to delete chat:", error));
  };

  const isPrivateChat = chat.name === "private_chat";
  const isCreator = chat.creator?.id === profile?.id;
  const chatDisplayName = isPrivateChat
    ? renderSenderName(chat.members.find(m => m.toText() !== profile?.id))
    : chat.name;

  const headerContent = (
    <AppBar
      position="static"
      color="default"
      elevation={0}
      onMouseDown={handleDragStart}
      onMouseMove={handleDrag}
      onMouseUp={handleDragEnd}
      onMouseLeave={() => setIsDragging(false)}
      sx={{ 
        cursor: isDragEnabled ? "move" : "default",
        borderBottom: 1,
        borderColor: "divider"
      }}
    >
      <Toolbar variant="dense" sx={{ minHeight: 48 }}>
        {isDragEnabled && <DragIndicator sx={{ mr: 1 }} />}
        <Typography
          component={Link}
          to={`user?id=${chat.members.find(m => String(m) !== profile?.id)}`}
          variant="subtitle2"
          sx={{ 
            flex: 1, 
            fontWeight: 600,
            textDecoration: "none",
            "&:hover": { textDecoration: "underline" }
          }}
        >
          {chatDisplayName}
        </Typography>
        
        <IconButton size="small" onClick={() => setIsMinimized(!isMinimized)}>
          {isMinimized ? <OpenInFull /> : <Minimize />}
        </IconButton>
        
        {!isPrivateChat && isCreator && (
          <IconButton size="small" onClick={() => setIsSettingsView(!isSettingsView)}>
            {isSettingsView ? <ArrowBack /> : <Settings />}
          </IconButton>
        )}
        
        <IconButton size="small" onClick={() => onClose(chat.id)}>
          <Close />
        </IconButton>
      </Toolbar>
    </AppBar>
  );

  const messagesContent = !isMinimized && !isSettingsView && (
    <>
      <Box sx={{ flex: 1, overflow: "auto", p: 2 }}>
        {chat.messages.map(message => {
          const isOwn = isCurrentUser(message.sender);
          return (
            <Paper
              key={message.id}
              elevation={0}
              sx={{
                p: 1.5,
                mb: 1,
                maxWidth: "75%",
                ml: isOwn ? "auto" : 0,
                bgcolor: isOwn ? "primary.main" : "background.default",
                color: isOwn ? "primary.contrastText" : "text.primary",
                border: 1,
                borderColor: "divider",
                borderRadius: 2,
              }}
            >
              <Typography
                component={Link}
                to={`user?id=${message.sender.toString()}`}
                variant="caption"
                sx={{
                  fontWeight: 600,
                  color: isOwn ? "primary.contrastText" : "primary.main",
                  textDecoration: "none",
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                {renderSenderName(message.sender)}
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {message.message}
              </Typography>
              <Typography
                variant="caption"
                sx={{ 
                  color: isOwn ? "primary.contrastText" : "text.secondary",
                  opacity: 0.8,
                  mt: 0.5,
                  display: "block"
                }}
              >
                {formatTimestamp(message.date)}
              </Typography>
            </Paper>
          );
        })}
        <div ref={messagesEndRef} />
      </Box>

      <Box sx={{ p: 1.5, borderTop: 1, borderColor: "divider" }}>
        <form onSubmit={handleSendMessage} style={{ display: "flex", gap: 8 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={isSending}
            sx={{ 
              "& .MuiOutlinedInput-root": {
                borderRadius: 3
              }
            }}
          />
          <IconButton
            type="submit"
            color="primary"
            disabled={isSending || !newMessage.trim()}
            sx={{ borderRadius: 2 }}
          >
            {isSending ? <CircularProgress size={20} color="inherit" /> : <Send />}
          </IconButton>
        </form>
      </Box>
    </>
  );

  const settingsContent = !isMinimized && isSettingsView && (
    <Box sx={{ flex: 1, overflow: "auto", p: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
        Chat Settings
      </Typography>

      {!isCreator ? (
        <Typography color="error" variant="body2">
          Only the chat creator can modify settings
        </Typography>
      ) : (
        <>
          <TextField
            fullWidth
            label="Chat Name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              name: e.target.value === "private_chat" ? "private chat" : e.target.value 
            }))}
            sx={{ mb: 2 }}
          />
          
          <WorkspaceSelect
            value={workspaces.filter(w => formData.workspaces.includes(w.id))}
            onChange={(newValue) => setFormData(prev => ({
              ...prev,
              workspaces: newValue.map(w => w.id)
            }))}
            workspaces={workspaces}
          />

          <AdminsSelect
            value={all_friends.filter(f => formData.admins.some(a => a.toString() === f.id))}
            onChange={(newValue) => setFormData(prev => ({
              ...prev,
              admins: newValue.map(admin => admin.id)
            }))}
            members={all_friends}
          />

          <MembersSelect
            value={all_friends.filter(f => formData.members.some(m => m.toString() === f.id))}
            onChange={(newValue) => setFormData(prev => ({
              ...prev,
              members: newValue.map(member => member.id)
            }))}
            users={all_friends}
          />

          <Box sx={{ display: "flex", gap: 1, mt: 3 }}>
            <Button
              variant="contained"
              color={saveSuccess ? "success" : "primary"}
              fullWidth
              disabled={isSaving}
              startIcon={isSaving ? <CircularProgress size={16} /> : saveSuccess ? <Check /> : null}
              onClick={async () => {
                await handleSaveChat({ ...chat, ...formData, creator: chat.creator });
                setIsSettingsView(false);
              }}
              sx={{ borderRadius: 2 }}
            >
              {saveSuccess ? "Saved!" : "Save Changes"}
            </Button>

            {!isPrivateChat && (
              <Button
                variant="outlined"
                color="error"
                onClick={handleDeleteChat}
                sx={{ borderRadius: 2, minWidth: 100 }}
              >
                Delete
              </Button>
            )}
          </Box>
        </>
      )}
    </Box>
  );

  const content = (
    <>
      {headerContent}
      {messagesContent}
      {settingsContent}
    </>
  );

  return dialog ? (
    <Dialog
      open={true}
      onClose={() => onClose(chat.id)}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          height: 600,
          display: "flex",
          flexDirection: "column",
          borderRadius: 3,
        }
      }}
    >
      {content}
    </Dialog>
  ) : (
    <Paper
      elevation={8}
      sx={{
        position: "fixed",
        top: dragPosition.y,
        left: dragPosition.x,
        width: 340,
        height: isMinimized ? "auto" : 480,
        display: "flex",
        flexDirection: "column",
        zIndex: 1300,
        borderRadius: 3,
        overflow: "hidden",
        boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
      }}
    >
      {content}
    </Paper>
  );
});

export default ChatWindow;