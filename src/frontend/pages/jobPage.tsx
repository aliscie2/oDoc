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

// Helper function to generate thumbnail with canvas
const generateThumbnailDataUrl = async (
  title: string,
  description: string,
  userPhoto?: Uint8Array | number[]
): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = 1200;
    canvas.height = 630;

    const baseImg = new Image();
    baseImg.crossOrigin = 'anonymous';
    baseImg.onload = () => {
      // Calculate scaling to cover entire canvas while maintaining aspect ratio
      const imgRatio = baseImg.width / baseImg.height;
      const canvasRatio = canvas.width / canvas.height;
      let drawWidth, drawHeight, drawX, drawY;

      if (imgRatio > canvasRatio) {
        drawHeight = canvas.height;
        drawWidth = drawHeight * imgRatio;
        drawX = (canvas.width - drawWidth) / 2;
        drawY = 0;
      } else {
        drawWidth = canvas.width;
        drawHeight = drawWidth / imgRatio;
        drawX = 0;
        drawY = (canvas.height - drawHeight) / 2;
      }

      ctx.drawImage(baseImg, drawX, drawY, drawWidth, drawHeight);

      // Title
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      
      const titleWords = title.split(' ');
      let line = '', y = 100;
      
      titleWords.forEach((word, i) => {
        const testLine = line + word + ' ';
        if (ctx.measureText(testLine).width > 1100 && i > 0) {
          ctx.fillText(line.trim(), 600, y);
          line = word + ' ';
          y += 60;
        } else line = testLine;
      });
      ctx.fillText(line.trim(), 600, y);

      // Description
      ctx.fillStyle = '#000000';
      ctx.font = '28px Arial';
      
      const descText = description.split(' ').slice(0, 20).join(' ') + 
        (description.split(' ').length > 20 ? '...' : '');
      const descLines = [];
      let currentLine = '';
      
      descText.split(' ').forEach(word => {
        const testLine = currentLine + word + ' ';
        if (ctx.measureText(testLine).width > 1100 && currentLine) {
          descLines.push(currentLine.trim());
          currentLine = word + ' ';
        } else currentLine = testLine;
      });
      if (currentLine.trim()) descLines.push(currentLine.trim());
      
      descLines.slice(0, 3).forEach((line, i) => {
        ctx.fillText(line, 600, 500 + i * 35);
      });

      // User avatar
      if (userPhoto?.length) {
        const avatarImg = new Image();
        avatarImg.crossOrigin = 'anonymous';
        avatarImg.onload = () => {
          ctx.save();
          ctx.beginPath();
          ctx.arc(1050, 315, 60, 0, 2 * Math.PI);
          ctx.clip();
          ctx.drawImage(avatarImg, 990, 255, 120, 120);
          ctx.restore();
          
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(1050, 315, 60, 0, 2 * Math.PI);
          ctx.stroke();
          
          resolve(canvas.toDataURL('image/png'));
        };
        avatarImg.onerror = () => resolve(canvas.toDataURL('image/png'));
        avatarImg.src = convertToBlobLink(userPhoto);
      } else resolve(canvas.toDataURL('image/png'));
    };
    
    baseImg.onerror = () => {
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, 1200, 630);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(title, 600, 200);
      ctx.font = '28px Arial';
      ctx.fillText(description.slice(0, 80) + '...', 600, 400);
      resolve(canvas.toDataURL('image/png'));
    };
    
    baseImg.src = `${window.location.origin}/job-profile-thumnail.png`;
  });
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
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('');

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
          const currentJob = result[0];
          setLoading(false)
          
          if (currentJob.user_id) {
            const userResponse = await backendActor.get_user(currentJob.user_id);
            if ("Ok" in userResponse) {
              setUser(userResponse.Ok);
              
              // Generate thumbnail
              const dataUrl = await generateThumbnailDataUrl(
                currentJob.title,
                currentJob.description,
                userResponse.Ok.photo
              );
              setThumbnailUrl(dataUrl);
            }
          } else {
            // Generate thumbnail without user photo
            const dataUrl = await generateThumbnailDataUrl(
              currentJob.title,
              currentJob.description
            );
            setThumbnailUrl(dataUrl);
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
        alert("User did not set their email yet, try to contact them via oDoc.");
        return;
      }

      const category = Object.keys(currentJob.category)[0];
      const message = category === "Job" 
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
  const showConnectButton = profile && currentJob && profile.id !== currentJob.user_id;

  return (
    <Box sx={{ p: 2 }}>
      {currentJob && thumbnailUrl && (
        <Helmet>
          <meta property="og:image" content={thumbnailUrl} />
          <meta property="og:title" content={currentJob.title} />
          <meta property="og:description" content={currentJob.description.split(" ").slice(0, 10).join(" ")} />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:image" content={thumbnailUrl} />
        </Helmet>
      )}

      {showConnectButton && (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 2, mb: 2 }}>
          <UserAvatarMenu user={user || { id: currentJob.user_id, name: "Unknown User" }} />
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