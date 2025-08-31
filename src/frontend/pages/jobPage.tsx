import { Job, User } from "$/declarations/backend/backend.did";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useSearchParams } from "react-router-dom";
import { convertToBlobLink } from "../DataProcessing/imageToVec";
import { backendActor } from "../utils/backendUtils";

// Helper function to generate thumbnail with canvas
const generateThumbnailDataUrl = async (
  title: string,
  description: string,
  userPhoto?: Uint8Array | number[],
): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    canvas.width = 1200;
    canvas.height = 630;

    // Create blank white background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add subtle border
    ctx.strokeStyle = "#e0e0e0";
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    // Avatar section (top left)
    const avatarX = 80;
    const avatarY = 80;
    const avatarRadius = 60;

    if (userPhoto?.length) {
      const avatarImg = new Image();
      avatarImg.crossOrigin = "anonymous";
      avatarImg.onload = () => {
        // Draw avatar with circular clip
        ctx.save();
        ctx.beginPath();
        ctx.arc(
          avatarX + avatarRadius,
          avatarY + avatarRadius,
          avatarRadius,
          0,
          2 * Math.PI,
        );
        ctx.clip();
        ctx.drawImage(
          avatarImg,
          avatarX,
          avatarY,
          avatarRadius * 2,
          avatarRadius * 2,
        );
        ctx.restore();

        // Avatar border
        ctx.strokeStyle = "#ddd";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(
          avatarX + avatarRadius,
          avatarY + avatarRadius,
          avatarRadius,
          0,
          2 * Math.PI,
        );
        ctx.stroke();

        finishThumbnail();
      };
      avatarImg.onerror = () => {
        drawDefaultAvatar();
        finishThumbnail();
      };
      avatarImg.src = convertToBlobLink(userPhoto);
    } else {
      drawDefaultAvatar();
      finishThumbnail();
    }

    function drawDefaultAvatar() {
      // Default avatar circle
      ctx.fillStyle = "#f5f5f5";
      ctx.beginPath();
      ctx.arc(
        avatarX + avatarRadius,
        avatarY + avatarRadius,
        avatarRadius,
        0,
        2 * Math.PI,
      );
      ctx.fill();

      ctx.strokeStyle = "#ddd";
      ctx.lineWidth = 3;
      ctx.stroke();

      // Default avatar icon (person silhouette)
      ctx.fillStyle = "#999";
      ctx.font = "48px Arial";
      ctx.textAlign = "center";
      ctx.fillText("👤", avatarX + avatarRadius, avatarY + avatarRadius + 15);
    }

    function finishThumbnail() {
      // Title (next to avatar)
      ctx.fillStyle = "#1a1a1a";
      ctx.font = "bold 42px Arial";
      ctx.textAlign = "left";

      const titleX = avatarX + avatarRadius * 2 + 40;
      const titleY = avatarY + 45;

      // Wrap title text
      const titleWords = title.split(" ");
      let line = "";
      let y = titleY;
      const maxWidth = 800;

      titleWords.forEach((word, i) => {
        const testLine = line + word + " ";
        if (ctx.measureText(testLine).width > maxWidth && i > 0) {
          ctx.fillText(line.trim(), titleX, y);
          line = word + " ";
          y += 50;
        } else {
          line = testLine;
        }
      });
      ctx.fillText(line.trim(), titleX, y);

      // Description (below title)
      ctx.fillStyle = "#555";
      ctx.font = "28px Arial";

      const descY = y + 60;
      const descText =
        description.split(" ").slice(0, 25).join(" ") +
        (description.split(" ").length > 25 ? "..." : "");

      const descLines = [];
      let currentLine = "";
      const descMaxWidth = 1000;

      descText.split(" ").forEach((word) => {
        const testLine = currentLine + word + " ";
        if (ctx.measureText(testLine).width > descMaxWidth && currentLine) {
          descLines.push(currentLine.trim());
          currentLine = word + " ";
        } else {
          currentLine = testLine;
        }
      });
      if (currentLine.trim()) descLines.push(currentLine.trim());

      // Draw description lines (max 4 lines)
      descLines.slice(0, 4).forEach((line, i) => {
        ctx.fillText(line, titleX, descY + i * 35);
      });

      // ICPJOBS.COM branding (bottom right)
      ctx.fillStyle = "#0066cc";
      ctx.font = "bold 24px Arial";
      ctx.textAlign = "right";
      ctx.fillText("ICPJOBS.COM", canvas.width - 40, canvas.height - 40);

      resolve(canvas.toDataURL("image/png"));
    }
  });
};

// SEO Component for Job Page
interface JobPageSEOProps {
  job: Job | null;
  user: User | null;
  thumbnailUrl: string;
}

const JobPageSEO: React.FC<JobPageSEOProps> = ({ job, user, thumbnailUrl }) => {
  if (!job) return null;

  // SEO data preparation
  const jobTitle = job.job_titles?.[0] || "Job Opportunity";
  const jobDescription =
    job.description || "Explore this job opportunity on ICPJobs";
  const truncatedDescription =
    jobDescription.split(" ").slice(0, 25).join(" ") +
    (jobDescription.split(" ").length > 25 ? "..." : "");
  const pageTitle = `${jobTitle} | ICPJobs - Internet Computer Job Board`;

  return (
    <Helmet>
      {/* Page title */}
      <title>{pageTitle}</title>

      {/* Meta description */}
      <meta name="description" content={truncatedDescription} />

      {/* Keywords */}
      {job.skills && job.skills.length > 0 && (
        <meta
          name="keywords"
          content={`${job.skills.join(", ")}, job, career, Internet Computer, ICP, blockchain, ${jobTitle}`}
        />
      )}

      {/* Open Graph tags */}
      <meta property="og:title" content={jobTitle} />
      <meta property="og:description" content={truncatedDescription} />
      <meta property="og:type" content="article" />
      <meta property="og:url" content={window.location.href} />
      {thumbnailUrl && <meta property="og:image" content={thumbnailUrl} />}
      <meta property="og:site_name" content="ICPJobs" />

      {/* Twitter Card tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={jobTitle} />
      <meta name="twitter:description" content={truncatedDescription} />
      {thumbnailUrl && <meta name="twitter:image" content={thumbnailUrl} />}

      {/* Additional SEO tags */}
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={window.location.href} />

      {/* Structured data for job posting */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org/",
          "@type": "JobPosting",
          title: jobTitle,
          description: jobDescription,
          datePosted: job.date_created
            ? new Date(Number(job.date_created) / 1000000).toISOString()
            : undefined,
          hiringOrganization: {
            "@type": "Organization",
            name: user?.name || "ICPJobs Employer",
          },
          jobLocation: {
            "@type": "Place",
            address: "Remote",
          },
          employmentType:
            Object.keys(job.category || {})[0] === "Job"
              ? "FULL_TIME"
              : "CONTRACT",
          skills: job.skills?.join(", "),
          qualifications: job.education?.join(", "),
          url: window.location.href,
          identifier: {
            "@type": "PropertyValue",
            name: "Job ID",
            value: job.id,
          },
        })}
      </script>
    </Helmet>
  );
};
const JobPage = () => {
  const [searchParams] = useSearchParams();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string>("");

  const jobId = searchParams.get("id");

  useEffect(() => {
    const fetchJob = async () => {
      if (!jobId || !backendActor) {
        setLoading(false);
        return;
      }

      try {
        const result = await backendActor.get_job(jobId);
        if (result?.length > 0) {
          setJob(result);
          const currentJob = result[0];

          if (currentJob.user_id) {
            const userResponse = await backendActor.get_user(
              currentJob.user_id,
            );
            if ("Ok" in userResponse) {
              setUser(userResponse.Ok);
              const dataUrl = await generateThumbnailDataUrl(
                currentJob.job_titles?.[0] || "Job Opportunity",
                currentJob.description,
                userResponse.Ok.photo,
              );
              setThumbnailUrl(dataUrl);
            }
          } else {
            const dataUrl = await generateThumbnailDataUrl(
              currentJob.job_titles?.[0] || "Job Opportunity",
              currentJob.description,
            );
            setThumbnailUrl(dataUrl);
          }
        }
      } catch (err) {
        console.error("Failed to fetch job");
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [jobId, backendActor]);

  if (loading) return <CircularProgress />;
  if (!job) return <Typography>Job not found</Typography>;

  return (
    <Box sx={{ p: 2, textAlign: "center" }}>
      <JobPageSEO job={job[0]} user={user} thumbnailUrl={thumbnailUrl} />
      {thumbnailUrl && (
        <img
          src={thumbnailUrl}
          alt="Job Thumbnail"
          style={{ maxWidth: "100%", height: "auto" }}
        />
      )}
    </Box>
  );
};

export default JobPage;
