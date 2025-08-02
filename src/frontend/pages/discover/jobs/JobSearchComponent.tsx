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
  useTheme,
  IconButton,
  Alert,
} from "@mui/material";
import { Warning, Visibility } from "@mui/icons-material";
import { Job, Match } from "$/declarations/backend/backend.did";
import ConnectButton from "./ConnectButton";
import { useBackendContext } from "@/contexts/BackendContext";
import JobDetails from "./JobDetails";

import { textToJson } from "./utils/processResponseJobs";
import { JOB_MATCHING_PROMPT } from "./utils/jobMatchingPrompt";

const JobSearchComponent: React.FC = () => {
  const { backendActor } = useBackendContext();
  const dispatch = useDispatch();
  const { currentJobId, jobs, matchingJobs } = useSelector(
    (state: any) => state.jobState,
  );
  const { aiAgent } = useSelector((state: any) => state.AIState);
  const theme = useTheme();

  const [loading, setLoading] = useState(false);
  const [openDialogId, setOpenDialogId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [calledJobs, setCalledJobs] = useState(new Set());

  const currentJob = useMemo(
    () => jobs?.find((job: Job) => job.id === currentJobId),
    [jobs, currentJobId],
  );
  const isValidSetup = useMemo(
    () => currentJobId && currentJob && backendActor && aiAgent,
    [currentJobId, currentJob, backendActor, aiAgent],
  );

  const { isLoggedIn, isRegistered } = useSelector(
    (state: any) => state.uiState,
  );

  const { sortedMatches, debugInfo } = useMemo(() => {
    if (!currentJob?.matches)
      return { sortedMatches: [], debugInfo: { found: 0 } };

    const matches = currentJob.matches.filter(Boolean);
    const validMatches = matches
      .map((match) => ({
        job: matchingJobs?.find((j: Job) => j?.id === match?.job_id),
        match,
      }))
      .filter(({ job, match }) => job && match?.job_id !== currentJobId)
      .sort((a, b) => (b.match?.score || 0) - (a.match?.score || 0));

    return {
      sortedMatches: validMatches,
      debugInfo: { found: validMatches.length },
    };
  }, [currentJob, matchingJobs, currentJobId]);

  const getLookingForCategory = useCallback((job: Job) => {
    const categoryKey = Object.keys(job?.category || {})[0];
    return categoryKey === "Job" ? { Talent: null } : { Job: null };
  }, []);

  const truncateTitle = useCallback((title: string, maxWords = 3) => {
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

  const findMatches = async () => {
    if (!isValidSetup) return;

    setLoading(true);
    setError(null);

    try {
      const newMatchingJobs = await backendActor.get_matches(
        currentJobId,
        (currentJob.skills || []).map((skill) => skill.toLowerCase()),
        getLookingForCategory(currentJob),
      );

      if (!newMatchingJobs?.length) {
        setLoading(false);
        return;
      }

      let processedMatches;
      try {
        let parsed = {};
        // if (import.meta.env.VITE_DFX_NETWORK !== "ic") {
        //   parsed = mockAIJobMatchResponse(newMatchingJobs, currentJob);
        // } else {
        //   const aiResponse = await aiAgent.sendMessage(`
        //   ${JOB_MATCHING_PROMPT}
        //   candidates: ${JSON.stringify(newMatchingJobs)},
        //   Current: ${JSON.stringify(currentJob)}
        // `);
        //   parsed = textToJson(aiResponse)?.extractedData;
        // }

        const aiResponse = await aiAgent.sendMessage(`
          ${JOB_MATCHING_PROMPT}
          candidates: ${JSON.stringify(newMatchingJobs)},
          Current: ${JSON.stringify(currentJob)}
        `);
        parsed = textToJson(aiResponse)?.extractedData;

        processedMatches =
          parsed.matches?.map((match) => ({
            job_id: match.candidate_id,
            score: Math.max(0, Math.min(10, match.score || 0)),
            missmatching_skills: match.missmatching_skills || [],
            date_updated: Date.now() * 1e6,
            is_connected: false,
            user_id: "",
            cover_letter: match.cover_letter || "",
          })) || [];
      } catch (aiError) {
        alert("AI processing failed, using basic scoring:", aiError);
        processedMatches = newMatchingJobs.map((job) => ({
          job_id: job.id,
          score: 5,
          missmatching_skills: [],
          date_updated: Date.now() * 1e6,
          is_connected: false,
          user_id: "",
          cover_letter: "",
        }));
      }

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
  };

  useEffect(() => {
    if (
      currentJobId &&
      aiAgent?.remainingCredits() > 0 &&
      !calledJobs.has(currentJobId)
    ) {
      setCalledJobs((prev) => new Set(prev).add(currentJobId));
      findMatches();
    }
  }, [jobs, isRegistered]);

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

  const renderMatchCard = useCallback(
    ({ job, match }: { job: Job; match: Match }) => {
      const score = match.score ? Math.round(match.score * 10) : 0;
      const scoreColor =
        score >= 70 ? "#4caf50" : score >= 30 ? "#ff9800" : "#f44336";

      return (
        <Card
          key={job.id}
          sx={{
            transition: "all 0.2s ease",
            "&:hover": {
              transform: "translateY(-1px)",
              boxShadow: theme.shadows[2],
            },
            minHeight: "auto",
          }}
        >
          <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
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
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: "absolute",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography
                    variant="caption"
                    component="div"
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
                {truncateTitle(job.job_titles?.[0])}
              </Typography>

              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenDialog(job.id);
                }}
                size="small"
                sx={{ color: "primary.main" }}
              >
                <Visibility />
              </IconButton>

              <ConnectButton
                jobId={job.id}
                matchingJob={matchingJobs?.find(
                  (job: Job) => job.id === job.id,
                )}
              />
            </Box>

            {match.missmatching_skills?.length > 0 && (
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: "0.7rem", fontWeight: 500 }}
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
    },
    [theme, truncateTitle, handleOpenDialog],
  );

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
            "&::-webkit-scrollbar": { width: "6px" },
            "&::-webkit-scrollbar-track": {
              background: "#f1f1f1",
              borderRadius: "3px",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "#c1c1c1",
              borderRadius: "3px",
            },
            "&::-webkit-scrollbar-thumb:hover": { background: "#a8a8a8" },
          }}
        >
          {sortedMatches.map(renderMatchCard)}
        </Box>
      )}

      {sortedMatches.map(({ job }) => {
        const match = currentJob.matches?.find((m) => m.job_id === job.id);
        return (
          <Dialog
            key={job.id}
            open={openDialogId === job.id}
            onClose={handleCloseDialog}
            maxWidth="md"
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: { xs: 0, sm: 2 },
                m: { xs: 0, sm: 2 },
                maxHeight: { xs: "100vh", sm: "90vh" },
                height: { xs: "100vh", sm: "auto" },
                width: { xs: "100vw", sm: "auto" },
                maxWidth: { xs: "100vw", sm: "none" },
              },
            }}
            sx={{
              "& .MuiDialog-container": {
                alignItems: { xs: "stretch", sm: "center" },
                p: { xs: 0, sm: 3 },
              },
              "& .MuiBackdrop-root": {
                backgroundColor: {
                  xs: "transparent",
                  sm: "rgba(0, 0, 0, 0.5)",
                },
              },
            }}
          >
            <DialogTitle>Job Details</DialogTitle>
            <DialogContent sx={{ p: { xs: 0, sm: 0 } }}>
              <JobDetails job={job} match={match} />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog} variant="contained">
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
