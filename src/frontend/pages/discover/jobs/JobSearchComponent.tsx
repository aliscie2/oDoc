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
import {
  compressJobForMatching,
  compressJobsForMatching,
  JOB_MATCHING_PROMPT,
} from "./utils/jobMatchingPrompt";
import { mockJobMatchResponse } from "./utils/mockJobMatches";
import { RootState } from "@/redux/reducers";

interface ProcessedMatch {
  job: Job;
  match: Match;
  score: number;
}

interface AIMatchResponse {
  candidate_id: string;
  score: number;
  missmatching_skills: string[];
  cover_letter: string;
}

// Constants
const SCORE_THRESHOLDS = {
  HIGH: 70,
  MEDIUM: 30,
} as const;

const COLORS = {
  HIGH_SCORE: "#4caf50",
  MEDIUM_SCORE: "#ff9800",
  LOW_SCORE: "#f44336",
} as const;

const JobSearchComponent: React.FC = () => {
  const { backendActor } = useBackendContext();
  const dispatch = useDispatch();
  const theme = useTheme();

  // Redux selectors
  const { currentJobId, jobs, matchingJobs } = useSelector(
    (state: RootState) => state.jobState,
  );
  const { aiAgent } = useSelector((state: RootState) => state.AIState);
  const { isRegistered } = useSelector((state: RootState) => state.uiState);

  // Local state
  const [loading, setLoading] = useState(false);
  const [openDialogId, setOpenDialogId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processedJobIds] = useState(new Set<string>());

  // Computed values
  const currentJob = useMemo(
    () => jobs?.find((job: Job) => job.id === currentJobId) || null,
    [jobs, currentJobId],
  );

  const isValidSetup = useMemo(
    () => Boolean(currentJobId && currentJob && backendActor && aiAgent),
    [currentJobId, currentJob, backendActor, aiAgent],
  );

  const sortedMatches = useMemo((): ProcessedMatch[] => {
    if (!currentJob?.matches || !matchingJobs) return [];

    const validMatches = currentJob.matches
      .filter((match): match is Match =>
        Boolean(match?.job_id && match.job_id !== currentJobId),
      )
      .map((match) => {
        const job = matchingJobs.find((j: Job) => j?.id === match.job_id);
        if (!job) return null;

        const score = Math.round((match.score || 0) * 100);
        return { job, match, score };
      })
      .filter((item): item is ProcessedMatch => Boolean(item))
      .sort((a, b) => b.score - a.score);

    console.log("Processed matches:", validMatches);
    return validMatches;
  }, [currentJob, matchingJobs, currentJobId]);

  // Utility functions
  const getLookingForCategory = useCallback((job: Job) => {
    const categoryKey = Object.keys(job?.category || {})[0];
    return categoryKey === "Job" ? { Talent: null } : { Job: null };
  }, []);

  const truncateTitle = useCallback((title: string, maxWords = 3): string => {
    if (!title) return "Untitled";
    const words = title.split(" ");
    return (
      words.slice(0, maxWords).join(" ") +
      (words.length > maxWords ? "..." : "")
    );
  }, []);

  const getScoreColor = useCallback((score: number): string => {
    if (score >= SCORE_THRESHOLDS.HIGH) return COLORS.HIGH_SCORE;
    if (score >= SCORE_THRESHOLDS.MEDIUM) return COLORS.MEDIUM_SCORE;
    return COLORS.LOW_SCORE;
  }, []);

  // API functions
  const processAIMatches = useCallback(
    (aiMatches: AIMatchResponse[], jobIds: string[]): Match[] => {
      // Remove duplicates and filter valid matches
      const uniqueMatches = new Map<string, AIMatchResponse>();

      aiMatches.forEach((match) => {
        if (match.candidate_id && match.candidate_id !== currentJobId) {
          const existing = uniqueMatches.get(match.candidate_id);
          // Keep the match with higher score if duplicate
          if (!existing || match.score > existing.score) {
            uniqueMatches.set(match.candidate_id, match);
          }
        }
      });

      return Array.from(uniqueMatches.values())
        .filter((match) => jobIds.includes(match.candidate_id))
        .map(
          (match): Match => ({
            job_id: match.candidate_id,
            score: Math.max(0, Math.min(1, match.score / 10)), // Normalize to 0-1
            missmatching_skills: match.missmatching_skills || [],
            date_updated: Number(Date.now() * 1e6),
            is_connected: false,
            user_id: "",
            cover_letter: match.cover_letter || "",
          }),
        );
    },
    [currentJobId],
  );

  const findMatches = useCallback(async () => {
    if (!isValidSetup || !currentJob) return;

    setLoading(true);
    setError(null);

    try {
      const candidateJobs = await backendActor.get_matches(
        currentJobId!,
        (currentJob.skills || []).map((skill) => skill.toLowerCase()),
        getLookingForCategory(currentJob),
      );

      console.log("Candidate jobs from backend:", candidateJobs);

      if (!candidateJobs?.length) {
        setLoading(false);
        return;
      }

      let processedMatches: Match[];

      if (import.meta.env.VITE_DFX_NETWORK === "local") {
        const mockResponse = mockJobMatchResponse(candidateJobs, currentJob);
        processedMatches = processAIMatches(
          mockResponse.matches || [],
          candidateJobs.map((j) => j.id),
        );
      } else {
        const compressedCandidates = compressJobsForMatching(candidateJobs);
        const compressedCurrentJob = compressJobForMatching(currentJob);

        // Remove ID to prevent AI confusion
        delete compressedCurrentJob["id"];

        const aiResponse = await aiAgent.sendMessage(
          `candidates: ${JSON.stringify(compressedCandidates)}, Current: ${JSON.stringify(compressedCurrentJob)}`,
          false,
          JOB_MATCHING_PROMPT,
        );

        if (!aiResponse) {
          throw new Error("AI returned no response");
        }

        const parsed = textToJson(aiResponse)?.extractedData;
        console.log("AI parsed response:", parsed);

        processedMatches = processAIMatches(
          parsed?.matches || [],
          candidateJobs.map((j) => j.id),
        );
      }

      console.log("Final processed matches:", processedMatches);

      if (processedMatches.length > 0) {
        dispatch({
          type: "UPDATE_MATCHING_JOBS",
          matchingJobs: candidateJobs,
          matches: processedMatches,
        });
      }
    } catch (err) {
      console.error("Error finding matches:", err);
      setError(err instanceof Error ? err.message : "Failed to load matches");
    } finally {
      setLoading(false);
    }
  }, [
    isValidSetup,
    currentJob,
    currentJobId,
    backendActor,
    aiAgent,
    getLookingForCategory,
    processAIMatches,
    dispatch,
  ]);
  // Effects
  useEffect(() => {
    if (
      currentJobId &&
      aiAgent?.remainingCredits() > 0 &&
      !processedJobIds.has(currentJobId)
    ) {
      processedJobIds.add(currentJobId);
      findMatches();
    }
  }, [currentJobId, aiAgent, findMatches, processedJobIds]);

  // Event handlers
  const handleOpenDialog = useCallback(
    (jobId: string) => setOpenDialogId(jobId),
    [],
  );
  const handleCloseDialog = useCallback(() => setOpenDialogId(null), []);

  // Render functions
  const renderMatchCard = useCallback(
    ({ job, match, score }: ProcessedMatch) => {
      const scoreColor = getScoreColor(score);

      return (
        <Card
          key={job.id}
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
                onClick={() => handleOpenDialog(job.id)}
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
    },
    [getScoreColor, truncateTitle, handleOpenDialog],
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

  // Main render
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
          {sortedMatches.map(renderMatchCard)}
        </Box>
      )}

      {/* Dialogs */}
      {sortedMatches.map(({ job }) => {
        const match = currentJob.matches?.find((m) => m.job_id === job.id);
        return (
          <Dialog
            key={job.id}
            open={openDialogId === job.id}
            onClose={handleCloseDialog}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>Job Details</DialogTitle>
            <DialogContent>
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
