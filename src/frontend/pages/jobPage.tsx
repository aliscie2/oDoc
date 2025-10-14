import { Job, User } from "$/declarations/backend/backend.did";
import { Box, CircularProgress, Typography } from "@mui/material";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useSearchParams } from "react-router-dom";
import { backendActor } from "../utils/backendUtils";
import { jobSEO } from "../components/jobSeoComponent";
import JobDetails from "./jobs/JobDetails";

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
  const descriptionWords = jobDescription.split(" ");
  const truncatedDescription =
    descriptionWords.slice(0, 25).join(" ") +
    (descriptionWords.length > 25 ? "..." : "");
  const pageTitle = `${jobTitle} | ICPJobs - Internet Computer Job Board`;

  // Safe access to job properties
  const jobSkills = job.skills || [];
  const jobEducation = job.education || [];
  const jobCategory = job.category ? Object.keys(job.category)[0] : undefined;

  return (
    <Helmet>
      {/* Page title */}
      <title>{pageTitle}</title>

      {/* Meta description */}
      <meta name="description" content={truncatedDescription} />

      {/* Keywords */}
      {jobSkills.length > 0 && (
        <meta
          name="keywords"
          content={`${jobSkills.join(", ")}, job, career, Internet Computer, ICP, blockchain, ${jobTitle}`}
        />
      )}

      {/* Open Graph tags */}
      <meta property="og:title" content={jobTitle} />
      <meta property="og:description" content={truncatedDescription} />
      <meta property="og:type" content="article" />
      <meta property="og:url" content={window.location.href} />
      {thumbnailUrl && (
        <meta key="og:image" property="og:image" content={thumbnailUrl} />
      )}
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
          employmentType: jobCategory,
          skills: jobSkills.length > 0 ? jobSkills.join(", ") : undefined,
          qualifications:
            jobEducation.length > 0 ? jobEducation.join(", ") : undefined,
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

JobPageSEO.propTypes = {
  job: PropTypes.any,
  user: PropTypes.any,
  thumbnailUrl: PropTypes.string.isRequired,
};

const JobPage = () => {
  console.log("{backendActor}")
  const [searchParams] = useSearchParams();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string>("");

  const jobId = searchParams.get("id");

  // SEO data is loaded in the main useEffect below
  console.log("backendActor",{"backend":backendActor})
  useEffect(() => {
    const fetchJob = async () => {
      if (!jobId || !backendActor) {
        setLoading(false);
        return;
      }

      try {
        const result = await backendActor.get_job(jobId);
        if (result?.length > 0) {
          const currentJob = result[0];
          if (currentJob) {
            setJob(currentJob);

            // Generate SEO-friendly thumbnail
            const jobTitle = currentJob.job_titles?.[0] || "Job Opportunity";
            const jobDescription =
              currentJob.description ||
              "Explore this job opportunity on ICPJobs";
            const jobSkills = currentJob.skills || [];

            // Setup complete SEO for the job page
            const generateThumbnail = async (
              userPhoto?: Uint8Array | number[],
            ) => {
              try {
                // Use the consolidated SEO component
                const thumbnailUrl = await jobSEO.setupJobSEO(currentJob, {
                  ...user,
                  photo: userPhoto,
                });

                setThumbnailUrl(complexThumbnailUrl || simpleThumbnailUrl);

                // Set the thumbnail URL for display
                setThumbnailUrl(thumbnailUrl);
              } catch (error) {
                console.error("Failed to setup SEO:", error);
                setThumbnailUrl("");
              }
            };

            if (currentJob.user_id) {
              const userResponse = await backendActor.get_user(
                currentJob.user_id,
              );
              if ("Ok" in userResponse) {
                setUser(userResponse.Ok);
                await generateThumbnail(userResponse.Ok.photo);
              } else {
                await generateThumbnail();
              }
            } else {
              await generateThumbnail();
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch job:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [jobId, backendActor]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!job) {
    return (
      <Box sx={{ textAlign: "center", p: 4 }}>
        <Typography variant="h5">Job not found</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <JobPageSEO job={job} user={user} thumbnailUrl={thumbnailUrl} />
      <JobDetails job={job} match={null} showEmails={false} />
    </Box>
  );
};

export default JobPage;
