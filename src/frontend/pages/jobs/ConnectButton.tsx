import React, { useState } from "react";
import { Button, CircularProgress } from "@mui/material";
import { useSnackbar } from "notistack";
import { useDispatch, useSelector } from "react-redux";
import { backendActor } from "@/utils/backendUtils";
import { Job, Match } from "$/declarations/backend/backend.did";
import UserAvatarMenu from "@/components/MainComponents/UserAvatarMenu";
import sendEmail from "@/utils/sendEmail";

interface ConnectButtonProps {
  jobId: string;
  matchingJob: Job;
}

const ConnectButton: React.FC<ConnectButtonProps> = ({
  jobId,
  matchingJob,
}) => {
  const { calendar } = useSelector((state: unknown) => state.calendarState);
  // Using direct backendActor import

  const { currentJobId, jobs } = useSelector(
    (state: unknown) => state.jobState,
  );
  const currentJob: Job = jobs?.find((job: Job) => job.id === currentJobId);
  const match: Match | undefined = currentJob?.matches?.find(
    (match: Match) => match.job_id === jobId,
  );

  const dispatch = useDispatch();
  const [connecting, setConnecting] = useState(false);

  const { enqueueSnackbar } = useSnackbar();
  const bookEvent = `${window.location.origin}/calendar?id=${calendar.id}&jobid=${currentJob.id}`;
  const category = Object.keys(currentJob.category)[0];
  const message =
    category == "Job"
      ? "We find a new job opertunity for you."
      : "We found a new talent that may meets your requrments.";

  const handleConnect = async (e: React.MouseEvent) => {
    setConnecting(true);
    e.stopPropagation();

    // Check if match exists
    if (!match) {
      enqueueSnackbar("Match not found. Please try again.", {
        variant: "error",
      });
      setConnecting(false);
      return;
    }

    if (match.score <= 0.6) {
      // Changed to 0-1 scale (0.6 = 60%)
      if (
        !window.confirm(
          "Are you sure you want to connect? This will send an email to them despite the matching score is not that good.",
        )
      ) {
        setConnecting(false);
        return;
      }
    }

    try {
      const res = await backendActor.get_calendar_by_author(
        matchingJob.user_id,
      );

      // Handle case where no calendar is returned
      if (!res || res.length === 0) {
        enqueueSnackbar(
          "User calendar not found. Try to contact them via oDoc.",
          {
            variant: "error",
          },
        );
        setConnecting(false);
        return;
      }

      const calendar = res[0];
      const emails = [...(calendar?.google_ids || []), ...matchingJob.emails];

      // Check if emails are available
      if (emails.length === 0) {
        enqueueSnackbar(
          "User has not provided their email yet. Try to contact them via oDoc.",
          {
            variant: "error",
          },
        );
        setConnecting(false);
        return;
      }

      let emailSent = false;

      // Try to send email to each available email address
      for (const email of emails) {
        const jobData = {
          job: { ...currentJob, category },
          match: { ...match, score: match.score * 100 }, // Convert to percentage for email display
          bookEvent,
        };

        const isEmailSent = await sendEmail(
          "oDoc AI job matcher",
          message,
          [email],
          jobData,
          "odoc_job_match",
        );

        if (isEmailSent) {
          // Update only the specific match's connection status while preserving all other matches
          dispatch({
            type: "UPDATE_MATCHES",
            matches: [{ ...match, is_connected: true }],
          });

          enqueueSnackbar("Email sent successfully.", {
            variant: "success",
          });
          emailSent = true;
          break;
        }
      }

      // If no email was sent successfully
      if (!emailSent) {
        enqueueSnackbar(
          "Failed to send email. Try to contact them manually by viewing their contacts in the job post, or send them a friend request.",
          {
            variant: "error",
          },
        );
      }
    } catch (error) {
      console.error("Error connecting:", error);
      enqueueSnackbar(
        "An error occurred while trying to connect. Please try again.",
        {
          variant: "error",
        },
      );
    }

    setConnecting(false);
  };

  return (
    <>
      <UserAvatarMenu
        user_id={matchingJob?.user_id}
        // onMessageClick={() => setSelectedUser(otherUser)}
      />
      <Button
        variant="contained"
        color={match?.is_connected ? "success" : "primary"}
        size="small"
        onClick={handleConnect}
        disabled={connecting || match?.is_connected || !match}
        sx={{ minWidth: "100px" }}
      >
        {connecting ? (
          <CircularProgress size={24} />
        ) : !match ? (
          "No Match"
        ) : match.is_connected ? (
          "Connected"
        ) : (
          "Connect"
        )}
      </Button>
    </>
  );
};

export default ConnectButton;
