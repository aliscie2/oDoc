import { useBackendContext } from "@/contexts/BackendContext";
import { RootState } from "@/redux/reducers";
import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import JobDetails from "./discover/jobs/JobDetails";
import { JOB_MATCHING_PROMPT } from "./discover/jobs/utils/jobMatchingPrompt";
import { textToJson } from "./discover/jobs/utils/processResponseJobs";
import ConnectButton from "./discover/jobs/ConnectButton";
import { Helmet } from "react-helmet-async";

const JobPage = () => {
  const { backendActor } = useBackendContext();
  const { jobs } = useSelector<RootState>((state) => state.jobState);
  const { aiAgent } = useSelector<RootState>((state) => state.AIState);
  const { profile } = useSelector<RootState>((state) => state.filesState);
  const { isRegistered } = useSelector<RootState>((state) => state.uiState);

  const [jobData, setJobData] = useState({
    job: null,
    matches: [],
    loading: true,
    error: null,
  });

  const canShowMatches = useMemo(() => {
    if (!isRegistered || !profile || !jobData.job) return false;

    const currentJob = Array.isArray(jobData.job)
      ? jobData.job[0]
      : jobData.job;
    return currentJob && currentJob.user_id !== profile.id;
  }, [isRegistered, profile, jobData.job]);

  const shouldWaitForProfile = useMemo(
    () => isRegistered && !profile,
    [isRegistered, profile],
  );

  useEffect(() => {
    const loadJobData = async () => {
      const jobId = new URLSearchParams(window.location.search).get("id");

      if (!jobId || !backendActor) {
        setJobData((prev) => ({
          ...prev,
          loading: false,
          error: "Invalid job ID",
        }));
        return;
      }

      if (shouldWaitForProfile) {
        setJobData((prev) => ({ ...prev, loading: true }));
        return;
      }

      try {
        setJobData((prev) => ({ ...prev, loading: true, error: null }));

        const fetchedJob = await backendActor.get_job(jobId);
        const currentJob = Array.isArray(fetchedJob)
          ? fetchedJob[0]
          : fetchedJob;

        // Check if user owns this job
        if (
          !isRegistered ||
          !profile ||
          !currentJob ||
          currentJob.user_id === profile.id
        ) {
          setJobData({
            job: fetchedJob,
            matches: [],
            loading: false,
            error: null,
          });
          return;
        }

        const categoryKey = Object.keys(currentJob.category || {})[0];
        const potentialMatches = jobs.filter(
          (j) => Object.keys(j.category || {})[0] !== categoryKey,
        );

        if (potentialMatches.length === 0) {
          setJobData({
            job: fetchedJob,
            matches: [],
            loading: false,
            error: null,
          });
          return;
        }

        const cacheKey = `job_data_${jobId}`;
        const cachedData = sessionStorage.getItem(cacheKey);

        let aiResponse;
        if (cachedData) {
          aiResponse = JSON.parse(cachedData).aiResponse;
        } else {
          aiResponse = await aiAgent.sendMessage(`
            ${JOB_MATCHING_PROMPT}
            candidates: ${JSON.stringify(potentialMatches)},
            Current: ${JSON.stringify(currentJob)}
          `);
          sessionStorage.setItem(
            cacheKey,
            JSON.stringify({ fetchedJob, aiResponse }),
          );
        }

        const parsed = textToJson(aiResponse)?.extractedData;
        const processedMatches =
          parsed.matches
            ?.map((match) => ({
              ...match,
              job: potentialMatches.find((j) => j.id === match.candidate_id),
              score: Math.max(0, Math.min(100, (match.score || 0) * 10)),
            }))
            .sort((a, b) => b.score - a.score) || [];

        setJobData({
          job: fetchedJob,
          matches: processedMatches,
          loading: false,
          error: null,
        });
      } catch (error) {
        setJobData((prev) => ({
          ...prev,
          loading: false,
          error: "Failed to load job data",
        }));
        console.error("Error loading job:", error);
      }
    };

    loadJobData();
  }, [backendActor, jobs, aiAgent, profile, isRegistered]);

  const renderMinimalMatchCard = ({ job, score, missmatching_skills }) => (
    <Card key={job?.id} sx={{ mb: 1 }}>
      <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          <Chip
            label={`${score}%`}
            size="small"
            color={score >= 70 ? "success" : score >= 30 ? "warning" : "error"}
            sx={{ minWidth: 45 }}
          />
          <Typography variant="body2" sx={{ flex: 1, fontWeight: 500 }}>
            {job?.job_titles?.[0] || "Untitled"}
          </Typography>
        </Box>

        {missmatching_skills?.length > 0 && (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {missmatching_skills.slice(0, 4).map((skill, i) => (
              <Chip
                key={i}
                label={skill}
                size="small"
                variant="outlined"
                color="error"
                sx={{ height: 16, fontSize: "0.6rem" }}
              />
            ))}
            {missmatching_skills.length > 4 && (
              <Chip
                label={`+${missmatching_skills.length - 4}`}
                size="small"
                variant="outlined"
                sx={{ height: 16, fontSize: "0.6rem" }}
              />
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );

  if (jobData.loading) return <CircularProgress />;
  if (jobData.error)
    return <Typography color="error">{jobData.error}</Typography>;
  if (!jobData.job) return <Typography>Job not found</Typography>;

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
        {profile && jobData.job && profile.id != jobData.job.user_id && (
          <ConnectButton
            jobId={jobData.job[0].id}
            matchingJob={jobData.job[0]}
          />
        )}
      </Box>
      {jobData.job[0] && <JobDetails job={jobData.job[0]} />}

      {canShowMatches && jobData.matches.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Potential Matches ({jobData.matches.length})
          </Typography>
          <Box sx={{ maxHeight: 400, overflowY: "auto" }}>
            {jobData.matches.map(renderMinimalMatchCard)}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default JobPage;
