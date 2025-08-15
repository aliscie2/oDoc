import { Job, Match } from "$/declarations/backend/backend.did";
import { RootState } from "@/redux/reducers";
import { Visibility, Warning } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import ConnectButton from "./ConnectButton";
import JobDetails from "./JobDetails";
import { useJobMatching } from "./hooks/useJobMatching";

interface ProcessedMatch {
  job: Job;
  match: Match;
  score: number;
}

const getScoreColor = (score: number): string => {
  if (score >= 70) return "#4caf50";
  if (score >= 30) return "#ff9800";
  return "#f44336";
};

const truncateTitle = (title: string, maxWords = 3): string => {
  if (!title) return "Untitled";
  const words = title.split(" ");
  return (
    words.slice(0, maxWords).join(" ") + (words.length > maxWords ? "..." : "")
  );
};

const JobSearchComponent: React.FC = () => {
  const { currentJobId, jobs, matchingJobs } = useSelector(
    (state: RootState) => state.jobState,
  );
  const [openDialogId, setOpenDialogId] = useState<string | null>(null);

  const currentJob = jobs?.find((job: Job) => job.id === currentJobId) || null;
  const { loading, error, findMatches } = useJobMatching(currentJob);

  const sortedMatches: ProcessedMatch[] =
    currentJob?.matches && matchingJobs
      ? currentJob.matches
          .filter((match): match is Match =>
            Boolean(match?.job_id && match.job_id !== currentJobId),
          )
          .map((match) => {
            const job = matchingJobs.find((j: Job) => j?.id === match.job_id);
            if (!job) return null;
            return { job, match, score: Math.round((match.score || 0) * 100) };
          })
          .filter((item): item is ProcessedMatch => Boolean(item))
          .sort((a, b) => b.score - a.score)
      : [];

  const MatchCard = ({ job, match, score }: ProcessedMatch) => {
    const scoreColor = getScoreColor(score);

    return (
      <Card
        sx={{
          transition: "transform 0.2s ease",
          "&:hover": { transform: "translateY(-1px)" },
        }}
      >
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
            <Box sx={{ position: "relative", display: "inline-flex" }}>
              <CircularProgress
                variant="determinate"
                value={score}
                size={40}
                thickness={4}
                sx={{ color: scoreColor }}
              />
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    color: scoreColor,
                  }}
                >
                  {score}%
                </Typography>
              </Box>
            </Box>

            <Typography variant="subtitle2" sx={{ flex: 1, fontWeight: 600 }}>
              {truncateTitle(job.job_titles?.[0] || "")}
            </Typography>

            <IconButton
              onClick={() => setOpenDialogId(job.id)}
              size="small"
              sx={{ color: "primary.main" }}
            >
              <Visibility />
            </IconButton>

            <ConnectButton jobId={job.id} matchingJob={job} />
          </Box>

          {match.missmatching_skills?.length > 0 && (
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: "0.7rem" }}
              >
                Mismatches:
              </Typography>
              <Box
                sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 0.5 }}
              >
                {match.missmatching_skills.slice(0, 3).map((skill, i) => (
                  <Chip
                    key={i}
                    label={skill}
                    size="small"
                    color="error"
                    variant="outlined"
                    sx={{ height: 18, fontSize: "0.65rem" }}
                  />
                ))}
                {match.missmatching_skills.length > 3 && (
                  <Chip
                    label={`+${match.missmatching_skills.length - 3}`}
                    size="small"
                    color="error"
                    variant="outlined"
                    sx={{ height: 18, fontSize: "0.65rem" }}
                  />
                )}
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          py: 8,
          gap: 2,
        }}
      >
        <CircularProgress />
        <Typography color="text.secondary">
          Finding your perfect matches...
        </Typography>
      </Box>
    );
  }

  if (!currentJobId || !currentJob) {
    return (
      <Box sx={{ textAlign: "center", py: 8 }}>
        <Typography variant="h6" color="text.secondary">
          Select a job to view matches
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        <Typography variant="subtitle2">Failed to load matches</Typography>
        <Typography variant="body2">{error}</Typography>
        <Button size="small" onClick={findMatches} sx={{ mt: 1 }}>
          Retry
        </Button>
      </Alert>
    );
  }

  return (
    <Box sx={{ py: 2 }}>
      {sortedMatches.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Warning sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No matches found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Try adjusting your job criteria or check back later
          </Typography>
          <Button variant="outlined" onClick={findMatches}>
            Refresh Matches
          </Button>
        </Box>
      ) : (
        <Box
          sx={{
            maxHeight: "400px",
            overflowY: "auto",
            display: "grid",
            gap: 1.5,
            pr: 1,
          }}
        >
          {sortedMatches.map((match) => (
            <MatchCard key={match.job.id} {...match} />
          ))}
        </Box>
      )}

      {sortedMatches.map(({ job }) => {
        const match =
          currentJob.matches?.find((m) => m.job_id === job.id) || null;
        return (
          <Dialog
            key={job.id}
            open={openDialogId === job.id}
            onClose={() => setOpenDialogId(null)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>Job Details</DialogTitle>
            <DialogContent>
              <JobDetails job={job} match={match} />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialogId(null)} variant="contained">
                Close
              </Button>
            </DialogActions>
          </Dialog>
        );
      })}
    </Box>
  );
};

export default JobSearchComponent;
