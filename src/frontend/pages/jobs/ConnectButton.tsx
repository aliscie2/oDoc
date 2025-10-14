import React, { useState } from "react";
import { Button, CircularProgress, Tooltip } from "@mui/material";
import { useSnackbar } from "notistack";
import { useDispatch, useSelector } from "react-redux";
import { Principal } from "@dfinity/principal";
import { backendActor } from "@/utils/backendUtils";
import { Job, Match } from "$/declarations/backend/backend.did";
import UserAvatarMenu from "@/components/MainComponents/UserAvatarMenu";
import sendEmail from "@/utils/sendEmail";

interface ConnectButtonProps {
  jobId: string;
  matchingJob: Job;
  showAvatar?: boolean;
}


const ConnectButton: React.FC<ConnectButtonProps> = ({ jobId, matchingJob, showAvatar = true }) => {
  const { calendar } = useSelector((state: unknown) => state.calendarState);
  const { currentJobId, jobs } = useSelector((state: unknown) => state.jobState);
  const { chats } = useSelector((state: unknown) => state.chatsState); // ADD THIS
  const currentJob: Job = jobs?.find((job: Job) => job.id === currentJobId);
  const match: Match | undefined = currentJob?.matches?.find((m: Match) => m.job_id === jobId);
  const dispatch = useDispatch();
  const [connecting, setConnecting] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const handleConnect = async (e: React.MouseEvent) => {
    setConnecting(true);
    e.stopPropagation();

    if (!match) {
      enqueueSnackbar("Match not found.", { variant: "error" });
      setConnecting(false);
      return;
    }

    if (match.score <= 0.6 && !window.confirm("Low match score. Continue?")) {
      setConnecting(false);
      return;
    }

    try {
      const res = await backendActor.get_calendar_by_author(matchingJob.user_id);
      const emails = [...(res?.[0]?.google_ids || []), ...matchingJob.emails];
      const jobTitle = Array.isArray(currentJob.title) ? currentJob.title[0] : currentJob.title || "this position";

      const sendFallbackMessage = async (includeEmailError = false) => {
        const baseMessage = `Hello, I am interested in ${jobTitle}.`;
        const emailErrorMsg = " Your email address appears to be incorrect. Please update your email so oDoc can contact you in the future.";
        const contactMsg = matchingJob.contacts ? ` Is ${matchingJob.contacts} your contact?` : " Please add your email.";
        
        const chatId = `${currentJob.user_id}_${matchingJob.user_id}_${currentJob.id}_${jobId}`;
        const newMessage = {
          id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
          date: BigInt(Date.now()) * BigInt(1e6),
          sender: Principal.fromText(currentJob.user_id),
          seen_by: [Principal.fromText(currentJob.user_id)],
          message: baseMessage + (includeEmailError ? emailErrorMsg : contactMsg),
          chat_id: chatId,
        };
        
        const existingChat = chats?.find((c) => c.id === chatId);
        
        if (!existingChat) {
          const newChat = {
            id: chatId,
            name: "private_chat",
            messages: [newMessage],
            members: [Principal.fromText(currentJob.user_id), Principal.fromText(matchingJob.user_id)],
            admins: [Principal.fromText(currentJob.user_id), Principal.fromText(matchingJob.user_id)],
            creator: Principal.fromText(currentJob.user_id),
            workspaces: [],
          };
          
          dispatch({ type: "ADD_CHAT", chat: newChat });
          dispatch({ type: "OPEN_CHAT", chatId });
          
          try {
            await backendActor.make_new_chat_room(newChat);
          } catch (err) {
            console.error("Failed to create chat on backend:", err);
          }
        } else {
          dispatch({ type: "ADD_NOTIFICATION", message: newMessage });
        }
        
        try {
          await backendActor.send_message([Principal.fromText(matchingJob.user_id)], newMessage);
        } catch (err) {
          console.error("Failed to send message:", err);
        }
        
        dispatch({ type: "UPDATE_MATCHES", matches: [{ ...match, is_connected: true }] });
      };

      if (emails.length === 0) {
        await sendFallbackMessage();
        enqueueSnackbar("Message sent.", { variant: "success" });
      } else {
        const category = Object.keys(currentJob.category)[0];
        const jobData = {
          job: { ...currentJob, category },
          match: { ...match, score: match.score * 100 },
          bookEvent: `${window.location.origin}/calendar?id=${calendar.id}&jobid=${currentJob.id}`,
        };

        let emailSent = false;
        for (const email of emails) {
          const result = await sendEmail("oDoc AI", category === "Job" ? "New opportunity" : "New talent", [email], jobData, "odoc_job_match");
          if (result) {
            dispatch({ type: "UPDATE_MATCHES", matches: [{ ...match, is_connected: true }] });
            enqueueSnackbar("Connection sent.", { variant: "success" });
            emailSent = true;
            break;
          }
        }

        if (!emailSent) {
          await sendFallbackMessage(true);
          enqueueSnackbar("Message sent about incorrect email.", { variant: "success" });
        }
      }
    } catch (error) {
      enqueueSnackbar("Connection failed.", { variant: "error" });
    }
    setConnecting(false);
  };

  return (
    <>
      {showAvatar && <UserAvatarMenu user_id={matchingJob?.user_id} />}
      <Button
        variant={match?.is_connected ? "outlined" : "contained"}
        color="primary"
        size="small"
        onClick={handleConnect}
        disabled={match?.is_connected}
        startIcon={connecting ? <CircularProgress size={16} /> : null}
        sx={{ minWidth: 100, textTransform: "none" }}
      >
        {!match ? "No Match" : match.is_connected ? "Connected" : "Connect"}
      </Button>
    </>
  );
};



export default ConnectButton;
