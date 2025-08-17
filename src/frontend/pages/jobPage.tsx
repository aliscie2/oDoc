import { Box, CircularProgress, Typography, Button } from "@mui/material";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { useBackendContext } from "../contexts/BackendContext";
import { useSnackbar } from "notistack";
import JobDetails from "./discover/jobs/JobDetails";
import UserAvatarMenu from "@/components/MainComponents/UserAvatarMenu";
import sendEmail from "../utils/sendEmail";

const JobPage = () => {
  const [searchParams] = useSearchParams();
  const { backendActor } = useBackendContext();
  const { profile } = useSelector((state: any) => state.filesState);
  const { enqueueSnackbar } = useSnackbar();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  const jobId = searchParams.get("id");

  useEffect(() => {
    const fetchJob = async () => {
      if (!jobId) {
        setError("No job ID provided");
        setLoading(false);
        return;
      }

      try {
        const result = await backendActor.get_job(jobId);
        if (result && result.length > 0) {
          setJob(result);
        } else {
          setError("Job not found");
        }
      } catch (err) {
        setError("Failed to fetch job");
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [jobId, backendActor]);

  const handleConnect = async () => {
    if (!job || !job[0]) return;

    setConnecting(true);
    try {
      const currentJob = job[0];
      const res = await backendActor.get_calendar_by_author(currentJob.user_id);
      const calendar = res[0];
      const emails = calendar?.googleIds || [];
      emails.push(...currentJob.emails);

      if (emails.length === 0) {
        alert(
          "User did not set their email yet, try to contact them via oDoc.",
        );
        return;
      }

      const category = Object.keys(currentJob.category)[0];
      const message =
        category === "Job"
          ? "We found a new job opportunity for you."
          : "We found a new talent that may meet your requirements.";

      for (const email of emails) {
        const isEmailSent = await sendEmail(
          "oDoc AI job matcher",
          message,
          [email],
          { job: currentJob },
          "odoc_job_match",
        );

        if (isEmailSent) {
          enqueueSnackbar("Email sent successfully!", { variant: "success" });
          break;
        }
      }
    } catch (error) {
      enqueueSnackbar("Failed to send email", { variant: "error" });
    } finally {
      setConnecting(false);
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!job) return <Typography>Job not found</Typography>;

  const currentJob = job[0];
  const showConnectButton =
    profile && currentJob && profile.id !== currentJob.user_id;

  return (
    <Box sx={{ p: 2 }}>
      {showConnectButton && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 2,
            mb: 2,
          }}
        >
          <UserAvatarMenu user_id={currentJob.user_id} />
          <Button
            variant="contained"
            color="primary"
            onClick={handleConnect}
            disabled={connecting}
            sx={{ minWidth: "100px" }}
          >
            {connecting ? <CircularProgress size={24} /> : "Connect"}
          </Button>
        </Box>
      )}
      <JobDetails job={currentJob} match={null} />
    </Box>
  );
};

export default JobPage;
