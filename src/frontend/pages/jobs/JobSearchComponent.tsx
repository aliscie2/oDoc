import { Job, Match } from "$/declarations/backend/backend.did";
import {
  selectCurrentJobId,
  selectMatchingJobs,
  selectCurrentJob,
} from "@/redux/selectors";
import {
  Visibility,
  TrendingUp,
  WorkOutline,
  Refresh,
  Chat,
} from "@mui/icons-material";
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
  Stack,
} from "@mui/material";
import React, { useState, useMemo } from "react";
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

const JobSearchComponent: React.FC = React.memo(() => {
  const currentJobId = useSelector(selectCurrentJobId);
  const matchingJobs = useSelector(selectMatchingJobs);
  const currentJob = useSelector(selectCurrentJob);
  const [openDialogId, setOpenDialogId] = useState<string | null>(null);
  const [isSearched, setSearched] = useState(false);
  const { loading, error, findMatches } = useJobMatching(currentJob);

  const sortedMatches: ProcessedMatch[] = useMemo(() => {
    if (!currentJob?.matches || !matchingJobs) {
      return [];
    }

    const filteredMatches = currentJob.matches.filter((match): match is Match =>
      Boolean(match?.job_id && match.job_id !== currentJobId),
    );

    const processedMatches = filteredMatches
      .map((match) => {
        const job = matchingJobs.find((j: Job) => j?.id === match.job_id);
        if (!job) {
          return null;
        }
        return { job, match, score: Math.round((match.score || 0) * 100) };
      })
      .filter((item): item is ProcessedMatch => Boolean(item));

    return processedMatches.sort((a, b) => b.score - a.score);
  }, [currentJob?.matches, matchingJobs, currentJobId]);

  const MatchCard = React.memo(({ job, match, score }: ProcessedMatch) => {
    const scoreColor = getScoreColor(score);

    return (
      <Card
        data-testid={`job-match-card-${job.id}`}
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
              data-testid={`job-details-button-${job.id}`}
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
  });

  MatchCard.displayName = "MatchCard";

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
      <Box data-testid="no-job-selected" sx={{ textAlign: "center", py: 8 }}>
        <WorkOutline sx={{ fontSize: 64, color: "primary.main", mb: 2 }} />
        <Typography variant="h6" color="text.primary" gutterBottom>
          Ready to find your perfect match?
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 4, maxWidth: 400, mx: "auto" }}
        >
          Select a job from your list to discover compatible opportunities and
          connect with potential matches.
        </Typography>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            p: 3,
            bgcolor: "primary.50",
            borderRadius: 2,
            border: "1px solid",
            borderColor: "primary.200",
          }}
        >
          <Chat sx={{ color: "primary.main" }} />
          <Typography
            variant="body2"
            color="primary.main"
            sx={{ fontWeight: 500 }}
          >
            Want to create a new job? Just chat with me! Tell me about the
            position you&apos;d like to post.
          </Typography>
        </Box>
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
        <Box data-testid="no-matches-found" sx={{ textAlign: "center", py: 6 }}>
          <TrendingUp sx={{ fontSize: 48, color: "primary.main", mb: 2 }} />
          <Typography variant="h6" color="text.primary" gutterBottom>
            No matches found yet
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 3, maxWidth: 400, mx: "auto" }}
          >
            We will notify you by email when we find a good match. Stay tuned!
          </Typography>
          {!isSearched && (
            <Button
              variant="contained"
              onClick={() => {
                setSearched(true);
                findMatches();
              }}
              startIcon={<Refresh />}
              data-testid="refresh-matches-button"
              sx={{ px: 3, py: 1, textTransform: "none" }}
            >
              Search Again
            </Button>
          )}
        </Box>
      ) : (
        <Box>
          {/* Match Quality Overview */}
          <Box sx={{ mb: 3, p: 2, bgcolor: "grey.50", borderRadius: 2 }}>
            <Typography variant="subtitle2" color="text.primary" gutterBottom>
              Match Quality Distribution
            </Typography>
            <Stack direction="row" spacing={3} alignItems="center">
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    bgcolor: "#4caf50",
                    borderRadius: "50%",
                  }}
                />
                <Typography variant="caption">
                  Excellent ({sortedMatches.filter((m) => m.score >= 70).length}
                  )
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    bgcolor: "#ff9800",
                    borderRadius: "50%",
                  }}
                />
                <Typography variant="caption">
                  Good (
                  {
                    sortedMatches.filter((m) => m.score >= 30 && m.score < 70)
                      .length
                  }
                  )
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    bgcolor: "#f44336",
                    borderRadius: "50%",
                  }}
                />
                <Typography variant="caption">
                  Potential ({sortedMatches.filter((m) => m.score < 30).length})
                </Typography>
              </Box>
            </Stack>
          </Box>

          {/* Matches List */}
          <Box
            data-testid="job-matches-list"
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
});

JobSearchComponent.displayName = "JobSearchComponent";

export default JobSearchComponent;
