import { Job, Match } from "$/declarations/backend/backend.did";
import {
  selectCurrentJobId,
  selectMatchingJobs,
  selectCurrentJob,
} from "@/redux/selectors";
import { TrendingUp, Refresh } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Stack,
} from "@mui/material";
import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import JobMatchCard from "./JobMatchCard";
import JobDetails from "./JobDetails";
import { useJobMatching } from "./hooks/useJobMatching";
import { useTheme } from "@mui/material/styles";


interface ProcessedMatch {
  job: Job;
  match: Match;
  score: number;
}



const JobSearchComponent: React.FC = React.memo(() => {
  const theme = useTheme();
  const currentJobId = useSelector(selectCurrentJobId);
  const matchingJobs = useSelector(selectMatchingJobs);
  const currentJob = useSelector(selectCurrentJob);
  const requiredMatchScore = currentJob?.required_match_score || 0.6;
  
  const [openDialogId, setOpenDialogId] = useState<string | null>(null);
  const [isSearched, setSearched] = useState(false);
  const { loading, error, findMatches } = useJobMatching(currentJob);

  const sortedMatches: ProcessedMatch[] = useMemo(() => {
    console.log("🔄 useMemo running with:", {
      matchesCount: currentJob?.matches?.length,
      requiredMatchScore,
      matchingJobsCount: matchingJobs?.length,
    });

    if (!currentJob?.matches || !matchingJobs) return [];

    const filteredMatches = currentJob.matches.filter((match): match is Match =>
      Boolean(match.score >= requiredMatchScore && match?.job_id && match.job_id !== currentJobId)
    );

    console.log("✅ Filtered matches:", { 
      count: filteredMatches.length, 
      requiredMatchScore,
      matches: filteredMatches.map(m => ({ jobId: m.job_id, score: m.score }))
    });

    const processedMatches = filteredMatches
      .map((match) => {
        const job = matchingJobs.find((j: Job) => j?.id === match.job_id);
        if (!job || job.category === currentJob.category) return null;
        return { job, match, score: Math.round((match.score || 0) * 100) };
      })
      .filter((item): item is ProcessedMatch => Boolean(item));

    return processedMatches.sort((a, b) => b.score - a.score);
  }, [currentJob?.matches, matchingJobs, currentJobId, currentJob?.category, requiredMatchScore]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 8, gap: 2 }}>
        <CircularProgress />
        <Typography color="text.secondary">Finding your perfect matches...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        <Typography variant="subtitle2">Failed to load matches</Typography>
        <Typography variant="body2">{error}</Typography>
        <Button size="small" onClick={findMatches} sx={{ mt: 1 }}>Retry</Button>
      </Alert>
    );
  }

  if (!currentJob) return null;

  return (
    <Box sx={{ py: 2 }}>
      {sortedMatches.length === 0 ? (
        <Box data-testid="no-matches-found" sx={{ textAlign: "center", py: 6 }}>
          <TrendingUp sx={{ fontSize: 48, color: "primary.main", mb: 2 }} />
          <Typography variant="h6" color="text.primary" gutterBottom>No matches found yet</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 400, mx: "auto" }}>
            We will notify you by email when we find a good match. Stay tuned!
          </Typography>
          {!isSearched && (
            <Button
              variant="contained"
              onClick={() => { setSearched(true); findMatches(); }}
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
          <Box sx={{ mb: 3, p: 2, bgcolor: theme.palette.background.paper, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="subtitle2" color="text.primary" gutterBottom>Match Quality Distribution</Typography>
            <Stack direction="row" spacing={3} alignItems="center">
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box sx={{ width: 12, height: 12, bgcolor: theme.palette.success.main, borderRadius: "50%" }} />
                <Typography variant="caption" color="text.secondary">
                  Excellent ({sortedMatches.filter((m) => m.score >= 70).length})
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box sx={{ width: 12, height: 12, bgcolor: theme.palette.warning.main, borderRadius: "50%" }} />
                <Typography variant="caption" color="text.secondary">
                  Good ({sortedMatches.filter((m) => m.score >= 30 && m.score < 70).length})
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box sx={{ width: 12, height: 12, bgcolor: theme.palette.error.main, borderRadius: "50%" }} />
                <Typography variant="caption" color="text.secondary">
                  Potential ({sortedMatches.filter((m) => m.score < 30).length})
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Box
            data-testid="job-matches-list"
            sx={{ maxHeight: "400px", overflowY: "auto", display: "grid", gap: 1.5, pr: 1, pb: 8 }}
          >
            {sortedMatches.map(({ job, match, score }) => (
              <JobMatchCard
                key={job.id}
                job={job}
                match={match}
                score={score}
                onViewDetails={() => setOpenDialogId(job.id)}
              />
            ))}
          </Box>
        </Box>
      )}

      {sortedMatches.map(({ job }) => {
        const match = currentJob.matches?.find((m) => m.job_id === job.id) || null;
        return (
          <Dialog
            key={job.id}
            open={openDialogId === job.id}
            onClose={() => setOpenDialogId(null)}
            maxWidth="md"
            fullWidth
            sx={{
              "& .MuiDialog-paper": {
                borderRadius: { xs: 0, sm: 2 },
                m: { xs: 0, sm: 2 },
                maxHeight: { xs: "100vh", sm: "90vh" },
                height: { xs: "100vh", sm: "auto" },
                width: { xs: "100vw", sm: "auto" },
                maxWidth: { xs: "100vw", sm: "900px" },
              },
              "& .MuiDialog-container": { alignItems: { xs: "stretch", sm: "center" } },
              "& .MuiBackdrop-root": { backgroundColor: { xs: "transparent", sm: "rgba(0, 0, 0, 0.5)" } },
            }}
          >
            <DialogTitle sx={{ p: { xs: 2, sm: 3 }, borderBottom: "1px solid", borderColor: "divider" }}>
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: "1rem", sm: "1.25rem" } }}>
                Job Details
              </Typography>
            </DialogTitle>
            <DialogContent sx={{ p: 0, overflow: "auto" }}>
              <JobDetails job={job} match={match} />
            </DialogContent>
            <DialogActions sx={{ p: { xs: 2, sm: 3 }, borderTop: "1px solid", borderColor: "divider" }}>
              <Button onClick={() => setOpenDialogId(null)} variant="contained" sx={{ width: { xs: "100%", sm: "auto" } }}>
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
