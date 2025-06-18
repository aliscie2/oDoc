import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
  LinearProgress,
  useTheme,
  IconButton,
  Divider,
  Alert,
} from "@mui/material";
import { Visibility, Star, Email, Warning } from "@mui/icons-material";
import { Job, Match } from "$/declarations/backend/backend.did";
import ConnectButton from "./ConnectButton";
import { useBackendContext } from "@/contexts/BackendContext";
import JobDetails from "./JobDetails";
import { JOB_MATCHING_PROMPT } from "./utils/jobMatchingPrompt";
import { processResponseJobs } from "./utils/processResponseJobs";

const JobSearchComponent: React.FC = () => {
  const { backendActor } = useBackendContext();
  const dispatch = useDispatch();
  const { currentJobId, jobs, matchingJobs } = useSelector(
    (state: any) => state.jobState,
  );
  const { geminiAgent } = useSelector((state: any) => state.AIState);
  const theme = useTheme();

  const [loading, setLoading] = useState(false);
  const [openDialogId, setOpenDialogId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Memoized current job and validation
  const currentJob = useMemo(
    () => jobs?.find((job: Job) => job.id === currentJobId),
    [jobs, currentJobId],
  );

  const isValidSetup = useMemo(
    () => currentJobId && currentJob && backendActor && geminiAgent,
    [currentJobId, currentJob, backendActor, geminiAgent],
  );

  // Memoized sorted matches with comprehensive edge case handling
  const { jobMatches, sortedMatches, debugInfo } = useMemo(() => {
    if (!currentJob?.matches) {
      return {
        jobMatches: [],
        sortedMatches: [],
        debugInfo: { matches: 0, jobs: 0, found: 0 },
      };
    }

    const matches = currentJob.matches.filter(Boolean); // Remove null/undefined matches
    const validMatches = matches
      .map((match) => ({
        job: matchingJobs?.find((j: Job) => j?.id === match?.job_id),
        match,
      }))
      .filter(({ job, match }) => job && match?.job_id !== currentJobId) // Exclude self-matches
      .sort((a, b) => (b.match?.score || 0) - (a.match?.score || 0));

    return {
      jobMatches: matches,
      sortedMatches: validMatches,
      debugInfo: {
        matches: matches.length,
        jobs: matchingJobs?.length || 0,
        found: validMatches.length,
      },
    };
  }, [currentJob, matchingJobs, currentJobId]);

  // Utilities
  const getLookingForCategory = useCallback((job: Job) => {
    const categoryKey = Object.keys(job?.category || {})[0];
    return categoryKey === "Job" ? { Talent: null } : { Job: null };
  }, []);

  const truncateTitle = useCallback((title: string, maxWords = 5) => {
    if (!title) return "Untitled";
    const words = title.split(" ");
    return (
      words.slice(0, maxWords).join(" ") +
      (words.length > maxWords ? "..." : "")
    );
  }, []);

  const getScoreColor = useCallback((score: number) => {
    if (score >= 80) return "success";
    if (score >= 60) return "warning";
    return "error";
  }, []);

  // Main matching logic
  const findMatches = useCallback(async () => {
    if (!isValidSetup) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch matches from backend
      const newMatchingJobs = await backendActor.get_matches(
        currentJobId,
        currentJob.skills || [],
        getLookingForCategory(currentJob),
      );

      console.log("newMatchingJobs", {
        matchingJobs,
        currentJob,
        newMatchingJobs,
        currentJobId,
        skills: currentJob.skills,
        cat: getLookingForCategory(currentJob),
      });

      if (!newMatchingJobs?.length) {
        setLoading(false);
        return;
      }

      // Process with AI
      let processedMatches;
      try {
        const aiResponse = await geminiAgent.sendMessage(`
          ${JOB_MATCHING_PROMPT}
          candidates: ${JSON.stringify(newMatchingJobs)},
          Current: ${JSON.stringify(currentJob)}
        `);

        const parsed = processResponseJobs(aiResponse)?.extractedData;
        processedMatches =
          parsed?.matches?.map((match: any) => ({
            job_id: match.job_id,
            score: Math.max(0, Math.min(10, match.score || 0)), // Clamp score 0-10
            missmatching_skills: match.missmatching_skills || [],
            date_updated: Date.now() * 1e6,
            is_connected: false,
            user_id: "",
            cover_letter: match.cover_letter || "",
          })) || [];
      } catch (aiError) {
        alert("AI processing failed, using basic scoring:", aiError);
        processedMatches = newMatchingJobs.map((job: Job) => ({
          job_id: job.id,
          score: 5, // Default neutral score
          missmatching_skills: [],
          date_updated: Date.now() * 1e6,
          is_connected: false,
          user_id: "",
          cover_letter: "",
        }));
      }

      // Filter out self-matches
      const validMatches = processedMatches.filter(
        (m) => m.job_id !== currentJobId,
      );

      if (validMatches.length > 0) {
        dispatch({
          type: "UPDATE_MATCHING_JOBS",
          matchingJobs: newMatchingJobs,
          matches: validMatches,
        });
      }
    } catch (err) {
      console.log("Error finding matches:", err);
      setError(err instanceof Error ? err.message : "Failed to load matches");
    } finally {
      setLoading(false);
    }
  }, [
    isValidSetup,
    currentJobId,
    currentJob,
    backendActor,
    geminiAgent,
    getLookingForCategory,
    dispatch,
  ]);
  const [isGemeniCalled, setisCalled] = useState(false);

  useEffect(() => {
    if (!isGemeniCalled && geminiAgent.remainingCredits() > 0) {
      findMatches();
      setisCalled(true);
    }
  }, [findMatches]);

  // Event handlers
  const handleOpenDialog = useCallback(
    (jobId: string) => setOpenDialogId(jobId),
    [],
  );
  const handleCloseDialog = useCallback(() => setOpenDialogId(null), []);
  const handleRemoveMatch = useCallback(
    (jobId: string) => {
      dispatch({ type: "DELETE_MATCH", id: jobId });
    },
    [dispatch],
  );

  // Render helpers
  const renderMatchCard = useCallback(
    ({ job, match }: { job: Job; match: Match }) => (
      <Card
        key={job.id}
        sx={{
          cursor: "pointer",
          transition: "all 0.2s ease",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: theme.shadows[4],
          },
        }}
        onClick={() => handleOpenDialog(job.id)}
      >
        <CardContent sx={{ p: 3 }}>
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "start",
              mb: 2,
            }}
          >
            <Typography variant="h6" sx={{ flex: 1, mr: 2 }}>
              {truncateTitle(job.job_titles?.[0])}
            </Typography>
            <Chip
              label={match.score ? `${Math.round(match.score * 10)}%` : "New"}
              color={match.score ? getScoreColor(match.score * 10) : "default"}
              size="small"
              icon={match.score ? <Star fontSize="small" /> : undefined}
            />
          </Box>

          {/* Score bar */}
          {match.score > 0 && (
            <LinearProgress
              variant="determinate"
              value={match.score * 10}
              color={getScoreColor(match.score * 10)}
              sx={{ height: 4, borderRadius: 2, mb: 2 }}
            />
          )}

          {/* Contact */}
          {job.emails?.[0] && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                mb: 2,
                color: "text.secondary",
              }}
            >
              <Email fontSize="small" />
              <Typography variant="body2">{job.emails[0]}</Typography>
            </Box>
          )}

          {/* Missing skills */}
          {match.missmatching_skills?.length > 0 && (
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mb: 1, display: "block" }}
              >
                Missing skills:
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {match.missmatching_skills.slice(0, 3).map((skill, i) => (
                  <Chip
                    key={i}
                    label={skill}
                    size="small"
                    color="warning"
                    variant="outlined"
                  />
                ))}
                {match.missmatching_skills.length > 3 && (
                  <Chip
                    label={`+${match.missmatching_skills.length - 3}`}
                    size="small"
                    color="warning"
                    variant="outlined"
                  />
                )}
              </Box>
            </Box>
          )}
        </CardContent>

        <Divider />

        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <ConnectButton jobId={job.id} />
          <IconButton size="small" color="primary">
            <Visibility fontSize="small" />
          </IconButton>
        </Box>
      </Card>
    ),
    [theme, truncateTitle, getScoreColor, handleOpenDialog],
  );

  // Loading state
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

  // No job selected
  if (!currentJobId || !currentJob) {
    return (
      <Box sx={{ textAlign: "center", py: 8 }}>
        <Typography variant="h6" color="text.secondary">
          Select a job to view matches
        </Typography>
      </Box>
    );
  }

  // Error state
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
  // TODO sometimes sortedMatches.map is not working without this console.log it give it some time to re-render.
  console.log({ sortedMatches });
  return (
    <Box sx={{ py: 2 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 300 }}>
          Job Matches
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Chip label={`${debugInfo.found} matches`} color="primary" />
          {!geminiAgent && (
            <Chip label="AI loading..." color="warning" size="small" />
          )}
        </Box>
      </Box>

      {/* Matches */}
      {sortedMatches.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Warning sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {jobMatches.length > 0
              ? "Matches found but jobs missing"
              : "No matches found"}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {jobMatches.length > 0
              ? `${jobMatches.length} matches exist but job details are missing from store`
              : "Try adjusting your job criteria or check back later"}
          </Typography>
          <Button variant="outlined" onClick={findMatches}>
            Refresh Matches
          </Button>
        </Box>
      ) : (
        <Box sx={{ display: "grid", gap: 3 }}>
          {sortedMatches.map(renderMatchCard)}
        </Box>
      )}

      {/* Job Details Dialogs */}
      {sortedMatches.map(({ job }) => (
        <Dialog
          key={job.id}
          open={openDialogId === job.id}
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
          PaperProps={{ sx: { borderRadius: 2 } }}
        >
          <DialogTitle>Job Details</DialogTitle>
          <DialogContent sx={{ p: 0 }}>
            <JobDetails
              job={{
                ...job,
                cover_letter: currentJob.matches?.find(
                  (m) => m.job_id === job.id,
                )?.cover_letter,
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} variant="contained">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      ))}
    </Box>
  );
};

export default JobSearchComponent;
