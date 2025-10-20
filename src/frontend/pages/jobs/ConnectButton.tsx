/**
 * ConnectButton Component - Optimized for production
 *
 * Optimizations Applied:
 * - Memoized expensive computations (currentJob, match, buttonText, isDisabled)
 * - Added proper TypeScript types to eliminate 'any' usage
 * - Uses profile.id instead of currentJob.user_id for reliable user identification
 */

import { Job, Match } from "$/declarations/backend/backend.did";
import UserAvatarMenu from "@/components/MainComponents/UserAvatarMenu";
import { backendActor } from "@/utils/backendUtils";
import sendEmail from "@/utils/sendEmail";
import { Principal } from "@dfinity/principal";
import { Button, CircularProgress } from "@mui/material";
import { useSnackbar } from "notistack";
import React, { useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

// Type definitions for Redux state
interface CalendarState {
  calendar: {
    id: string;
    [key: string]: unknown;
  };
}

interface JobState {
  currentJobId: string;
  jobs: Job[];
}

interface ChatsState {
  chats: Array<{
    id: string;
    messages?: unknown[];
    [key: string]: unknown;
  }>;
}

interface RootState {
  calendarState: CalendarState;
  jobState: JobState;
  chatsState: ChatsState;
  filesState: {
    profile?: {
      id: string;
      name?: string;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
}

interface ConnectButtonProps {
  jobId: string;
  matchingJob: Job;
  showAvatar?: boolean;
}

const ConnectButton: React.FC<ConnectButtonProps> = ({
  jobId,
  matchingJob,
  showAvatar = true,
}) => {
  const { calendar } = useSelector((state: RootState) => state.calendarState);
  const { currentJobId, jobs } = useSelector(
    (state: RootState) => state.jobState,
  );
  const { chats } = useSelector((state: RootState) => state.chatsState);
  const { profile } = useSelector((state: RootState) => state.filesState);

  // Memoize expensive computations
  const currentJob: Job | undefined = useMemo(() => {
    const job = jobs?.find((job: Job) => job.id === currentJobId);
    return job;
  }, [jobs, currentJobId]);

  const match: Match | undefined = useMemo(() => {
    const foundMatch = currentJob?.matches?.find(
      (m: Match) => m.job_id === jobId,
    );
    return foundMatch;
  }, [currentJob?.matches, jobId]);

  const dispatch = useDispatch();
  const [connecting, setConnecting] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const handleConnect = async (e: React.MouseEvent) => {
    setConnecting(true);
    e.stopPropagation();

    if (!match || !currentJob) {
      enqueueSnackbar(!match ? "Match not found." : "Current job not found.", {
        variant: "error",
      });
      setConnecting(false);
      return;
    }

    if (!profile?.id || profile.id.trim() === "") {
      enqueueSnackbar("Profile has invalid user ID.", { variant: "error" });
      setConnecting(false);
      return;
    }

    if (!matchingJob.user_id || matchingJob.user_id.trim() === "") {
      enqueueSnackbar("Matching job has invalid user ID.", {
        variant: "error",
      });
      setConnecting(false);
      return;
    }

    if (match.score <= 0.6 && !window.confirm("Low match score. Continue?")) {
      setConnecting(false);
      return;
    }

    try {
      const res = await backendActor.get_calendar_by_author(
        matchingJob.user_id,
      );
      const emails = [...(res?.[0]?.google_ids || []), ...matchingJob.emails];

      const sendFallbackMessage = async (includeEmailError = false) => {
        const jobTitle =
          currentJob.job_titles && currentJob.job_titles.length > 0
            ? currentJob.job_titles[0]
            : "this position";

        const hasValidContact =
          matchingJob.contacts &&
          matchingJob.contacts.length > 0 &&
          matchingJob.contacts[0]?.trim() !== "";

        let message = `Hello, I am interested in ${jobTitle}.`;

        if (includeEmailError) {
          message +=
            " Your email address appears to be incorrect. Please update your email so oDoc can contact you in the future.";
        } else if (hasValidContact) {
          message += ` Is ${matchingJob.contacts[0]} your correct contact?`;
        } else {
          message += " Please add your contact email so we can communicate.";
        }

        if (!profile?.id || !matchingJob.user_id) {
          throw new Error("Invalid user IDs for chat creation");
        }

        const chatId = `${profile.id}_${matchingJob.user_id}`;

        let senderPrincipal: Principal;
        let seenByPrincipal: Principal;

        try {
          senderPrincipal = Principal.fromText(profile.id);
          seenByPrincipal = Principal.fromText(profile.id);
        } catch {
          throw new Error(`Invalid Principal ID: ${profile.id}`);
        }

        const newMessage = {
          id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
          date: BigInt(Date.now()) * BigInt(1e6),
          sender: senderPrincipal,
          seen_by: [seenByPrincipal],
          message,
          chat_id: chatId,
        };

        const existingChat = chats?.find((c) => c.id === chatId);

        if (!existingChat) {
          let memberPrincipals: Principal[];
          let adminPrincipals: Principal[];
          let creatorPrincipal: Principal;

          try {
            const currentUserPrincipal = Principal.fromText(profile.id);
            const matchingUserPrincipal = Principal.fromText(
              matchingJob.user_id,
            );

            memberPrincipals = [currentUserPrincipal, matchingUserPrincipal];
            adminPrincipals = [currentUserPrincipal, matchingUserPrincipal];
            creatorPrincipal = currentUserPrincipal;
          } catch {
            throw new Error("Failed to create chat Principals");
          }

          const newChat = {
            id: chatId,
            name: "private_chat",
            messages: [newMessage],
            members: memberPrincipals,
            admins: adminPrincipals,
            creator: creatorPrincipal,
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
          let recipientPrincipal: Principal;

          try {
            recipientPrincipal = Principal.fromText(matchingJob.user_id);
          } catch {
            throw new Error(
              `Invalid recipient Principal ID: ${matchingJob.user_id}`,
            );
          }

          await backendActor.send_message([recipientPrincipal], newMessage);
        } catch (err) {
          console.error("Failed to send message:", err);
        }

        // ✅ Update match connection state
        const updatedMatch = { ...match, is_connected: true };

        // ✅ Save to backend immediately
        await backendActor.update_matches(
          {
            current_job_id: currentJob.id,
            delete_matches: [],
            updates: [updatedMatch],
            add: [],
            reset: [],
          },
          [],
        );

        // ✅ Update Redux state after successful backend save
        dispatch({
          type: "UPDATE_MATCHES",
          matches: [updatedMatch],
        });
      };

      if (emails.length === 0) {
        try {
          await sendFallbackMessage();
          enqueueSnackbar("Message sent.", { variant: "success" });
        } catch (err) {
          console.error("Failed to send fallback message:", err);
          enqueueSnackbar("Something went wrong, contact x.com/odoc_ic.", {
            variant: "error",
          });
        }
      } else {
        const category = Object.keys(currentJob.category || { Job: null })[0];
        const jobData = {
          job: { ...currentJob, category },
          match: { ...match, score: match.score * 100 },
          bookEvent: `${window.location.origin}/share_calendar?id=${calendar.id}&jobid=${currentJob.id}`,
        };

        let emailSent = false;

        for (let i = 0; i < emails.length; i++) {
          const email = emails[i];
          const result = await sendEmail(
            "oDoc AI",
            category === "Job" ? "New opportunity" : "New talent",
            [email],
            jobData,
            "odoc_job_match",
          );

          if (result) {
            // ✅ Update match connection state
            const updatedMatch = { ...match, is_connected: true };

            // ✅ Save to backend immediately
            await backendActor.update_matches(
              {
                current_job_id: currentJob.id,
                delete_matches: [],
                updates: [updatedMatch],
                add: [],
                reset: [],
              },
              [],
            );

            // ✅ Update Redux state after successful backend save
            dispatch({
              type: "UPDATE_MATCHES",
              matches: [updatedMatch],
            });

            enqueueSnackbar("Connection sent.", { variant: "success" });
            emailSent = true;
            break;
          }
        }

        if (!emailSent) {
          await sendFallbackMessage(true);
          enqueueSnackbar("Message sent about incorrect email.", {
            variant: "success",
          });
        }
      }
    } catch {
      enqueueSnackbar("Connection failed.", { variant: "error" });
    } finally {
      setConnecting(false);
    }
  };
  // Memoize button text to avoid unnecessary recalculations
  const buttonText = useMemo(() => {
    const text = !match
      ? "No Match"
      : match.is_connected
        ? "Connected"
        : "Connect";
    return text;
  }, [match]);

  const isDisabled = useMemo(() => {
    const disabled = connecting || match?.is_connected;
    return disabled;
  }, [connecting, match?.is_connected]);

  return (
    <>
      {showAvatar && <UserAvatarMenu user_id={matchingJob?.user_id} />}
      <Button
        variant={"contained"}
        color="primary"
        size="small"
        onClick={handleConnect}
        disabled={isDisabled}
        startIcon={connecting ? <CircularProgress size={16} /> : null}
        sx={{ minWidth: 100, textTransform: "none" }}
      >
        {buttonText}
      </Button>
    </>
  );
};

export default ConnectButton;
