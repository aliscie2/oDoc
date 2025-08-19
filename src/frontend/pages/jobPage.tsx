import { Box, CircularProgress, Typography, Button } from "@mui/material";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { useBackendContext } from "../contexts/BackendContext";
import { useSnackbar } from "notistack";
import JobDetails from "./discover/jobs/JobDetails";
import UserAvatarMenu from "@/components/MainComponents/UserAvatarMenu";
import sendEmail from "../utils/sendEmail";
import { convertToBlobLink } from "../DataProcessing/imageToVec";
import { RootState } from "../redux/reducers";
import { Helmet } from "react-helmet-async";
import { User } from "$/declarations/backend/backend.did";

// Function for thumbnail generation
const generateThumbnailUrl = (
  jobTitle: string,
  description: string,
  userPhoto?: Uint8Array | number[],
) => {
  // Check if photo exists and is not empty array
  const hasPhoto =
    userPhoto && Array.isArray(userPhoto) && userPhoto.length > 0;
  const avatarUrl = hasPhoto
    ? convertToBlobLink(userPhoto)
    : "https://support.dfinity.org/hc/theming_assets/01HZPAR2CJ6VRX6AKMGYRXTX8W";

  const shortDesc = description.split(" ").slice(0, 10).join(" ");
  const baseUrl = window.location.origin;
  const mainThumbnailPath = `${baseUrl}/job-profile-thumnail.png`;

  const params = new URLSearchParams({
    title: jobTitle,
    desc: shortDesc,
    bg: "#ffffff",
    textColor: "#000000",
    avatar: avatarUrl,
    mainThumbnail: mainThumbnailPath,
  });
  return `${baseUrl}/api/thumbnail?${params.toString()}`;
};

const JobPage = () => {
  const [searchParams] = useSearchParams();
  const { backendActor } = useBackendContext();
  const { enqueueSnackbar } = useSnackbar();
  const { profile } = useSelector((state: RootState) => state.filesState);
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const jobId = searchParams.get("id");

  useEffect(() => {
    const fetchJob = async () => {
      if (!jobId || !backendActor) {
        setError("No job ID provided");
        setLoading(false);
        return;
      }

      try {
        const result = await backendActor.get_job(jobId);
        if (result && result.length > 0) {
          setJob(result);
          // Fetch user data for thumbnail
          const currentJob = result[0];
          if (currentJob.user_id) {
            const userResponse = await backendActor.get_user(
              currentJob.user_id,
            );
            if ("Ok" in userResponse) {
              setUser(userResponse.Ok);
            }
          }
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
    if (!job || !job[0] || !backendActor) return;

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

  const currentJob = job?.[0];
  const showConnectButton =
    profile && currentJob && profile.id !== currentJob.user_id;
  const thumbnailUrl = currentJob
    ? generateThumbnailUrl(
        currentJob.title,
        currentJob.description,
        user?.photo,
      )
    : "";

  return (
    <Box sx={{ p: 2 }}>
      {currentJob && (
        <Helmet>
          <meta property="og:image" content={thumbnailUrl} />
          <meta property="og:title" content={currentJob.title} />
          <meta
            property="og:description"
            content={currentJob.description.split(" ").slice(0, 10).join(" ")}
          />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:image" content={thumbnailUrl} />
        </Helmet>
      )}

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
          <UserAvatarMenu
            user={user || { id: currentJob.user_id, name: "Unknown User" }}
          />
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
      {currentJob && <JobDetails job={currentJob} match={null} />}
    </Box>
  );
};

export default JobPage;
