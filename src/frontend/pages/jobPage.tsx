import { RootState } from "@/redux/reducers";
import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import ConnectButton from "./discover/jobs/ConnectButton";
import JobDetails from "./discover/jobs/JobDetails";

const JobPage = () => {
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
