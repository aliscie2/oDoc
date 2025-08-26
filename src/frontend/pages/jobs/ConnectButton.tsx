import React, { useState } from "react";
import { Button, CircularProgress } from "@mui/material";
import { useSnackbar } from "notistack";
import { useDispatch, useSelector } from "react-redux";
import { backendActor, ckUSDCActor, logout } from "@/utils/backendUtils";
import { Calendar, Job, Match } from "$/declarations/backend/backend.did";
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
  const { calendar } = useSelector((state: any) => state.calendarState);
  // Using direct backendActor import

  const { currentJobId, jobs } = useSelector((state: any) => state.jobState);
  const currentJob: Job = jobs?.find((job: any) => job.id === currentJobId);
  const match: Match = currentJob.matches?.find(
    (match: any) => match.job_id === jobId,
  );

  const dispatch = useDispatch();
  const [connecting, setConnecting] = useState(false);

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const bookEvent = `${window.location.origin}/calendar?id=${calendar.id}&jobid=${currentJob.id}`;
  const category = Object.keys(currentJob.category)[0];
  const message =
    category == "Job"
      ? "We find a new job opertunity for you."
      : "We found a new talent that may meets your requrments.";

  const handleConnect = async (e: React.MouseEvent) => {
    setConnecting(true);
    e.stopPropagation();
    if (match?.score <= 0.6) {
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

    const res: [Calendar] = await backendActor.get_calendar_by_author(
      matchingJob.user_id,
    );
    const calendar = res[0];
    const emails = calendar?.googleIds || [];
    emails.push(...matchingJob.emails);
    if (emails.length == 0) {
      alert("User did not set thier email yet, try to contact them via oDoc.");
    }
    for (const email of emails) {
      const jobData = {
        job: { ...currentJob, category },
        match: { ...match, score: match?.score * 100 }, // Convert to percentage for email display
        bookEvent,
      };
      const isEmailSent = await sendEmail(
        "oDoc AI job matcher",
        message,
        [email],
        jobData,
        "odoc_job_match",
      );

      if (isEmailSent == true) {
        dispatch({
          type: "UPDATE_MATCHES",
          matches: [{ ...match, is_connected: true }],
        });

        enqueueSnackbar("Email sent.", {
          variant: "success",
        });
        break;
      }
    }
    // !connected && enqueueSnackbar("Email not sent. Try to contact them manilly by viaing thier contacts in the job post, or thier profile send them friend request.", {
    //   variant:'error',
    // })
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
        disabled={connecting || match?.is_connected}
        sx={{ minWidth: "100px" }}
      >
        {connecting ? (
          <CircularProgress size={24} />
        ) : match?.is_connected ? (
          "Connected"
        ) : (
          "Connect"
        )}
      </Button>
    </>
  );
};

export default ConnectButton;
