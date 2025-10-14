import { Job } from "$/declarations/backend/backend.did";
import { backendActor } from "@/utils/backendUtils";
import {
  Add,
  Delete,
  Share,
  Visibility,
  PlayArrow,
  Pause,
  KeyboardArrowDown,
  Check,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import JobDetails from "./JobDetails";
import JobUpdateAnimation from "./quickBar";
import { Helmet } from "react-helmet-async";

const JobSelector: React.FC = () => {
  const dispatch = useDispatch();
  const { currentJobId, jobs } = useSelector(
    (state: { jobState: { currentJobId: string; jobs: Job[] } }) =>
      state.jobState,
  );
  const [expanded, setExpanded] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showBriefData, setShowBriefData] = useState(false);
  const [previousJob, setPreviousJob] = useState<Job | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const theme = useTheme();
  const currentJob = jobs.find((job: Job) => job.id === currentJobId);

  // Persist currentJobId to localStorage on change
  useEffect(() => {
    if (currentJobId) {
      localStorage.setItem("lastSelectedJobId", currentJobId);
    }
  }, [currentJobId]);



  const JOB_FIELDS = [
    "description", "location", "salary", "jobType", "category", "active",
    "skills", "requirements", "benefits", "company", "contactEmail",
    "applicationDeadline", "experienceLevel",
  ];
  const MAX_JOBS = 4;
  const COPY_SUCCESS_DURATION = 2000;

  const compareJobFields = (current: Job, previous: Job): Set<string> => {
    const changedFields = new Set<string>();
    JOB_FIELDS.forEach((field) => {
      const currentValue = current[field as keyof Job];
      const previousValue = previous[field as keyof Job];
      const isChanged = ["category", "skills"].includes(field)
        ? JSON.stringify(currentValue) !== JSON.stringify(previousValue)
        : currentValue !== previousValue;
      if (isChanged) changedFields.add(field);
    });
    return changedFields;
  };

  const scrollToBriefData = () => {
    setTimeout(() => {
      document.querySelector('[data-testid="job-brief-data"]')?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 300);
  };

  useEffect(() => {
    if (currentJob && previousJob && currentJob.id === previousJob.id) {
      const changedFields = compareJobFields(currentJob, previousJob);
      if (changedFields.size > 0) {
        scrollToBriefData();
      }
    }
    setPreviousJob(currentJob ? { ...currentJob } : null);
  }, [currentJob]);

  useEffect(() => {
    setShowBriefData(!!currentJob);
  }, [currentJob]);

  const handleJobSelect = (jobId: string | null) => {
    const job = jobId ? jobs.find((j: Job) => j.id === jobId) : null;
    dispatch({ type: "SET_CURRENT_JOB_ID", job });
    setExpanded(false);
  };
  

  const handleJobAction = (job: Job, action: string, event: React.MouseEvent) => {
  event.stopPropagation();
  event.preventDefault();
  
  switch (action) {
    case "toggle":
      dispatch({ type: "TOGGLE_ACTIVE", id: job.id });
      break;
    case "details":
      setSelectedJob(job);
      setDialogOpen(true);
      break;
    case "delete":
      if (window.confirm("Are you sure you want to delete this job?")) {
        const isCurrentJob = job.id === currentJobId;
        backendActor?.delete_job(job.id);
        dispatch({ type: "DELETE_JOB", id: job.id });
        
        if (isCurrentJob) {
          const remainingJobs = jobs.filter((j: Job) => j.id !== job.id);
          const nextJobId = remainingJobs.length > 0 ? remainingJobs[0].id : null;
          dispatch({ 
            type: "SET_CURRENT_JOB_ID", 
            job: remainingJobs[0] || null 
          });
        }
      }
      break;
    case "copy":
      navigator.clipboard.writeText(`${window.location.origin}/jobs?id=${job.id}`);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
      break;
  }
};



  const truncateText = (text: string, maxLength: number = 40) =>
    text?.length > maxLength ? `${text.slice(0, maxLength)}...` : text;

  const getJobCategory = (job: Job) =>
    job.category ? Object.keys(job.category)[0] || "Uncategorized" : "Uncategorized";

  const getJobTitle = (job: Job) =>
    job.job_titles ? truncateText(job.job_titles[0]) : "Untitled Job";

  return (
    <Box sx={{ width: "100%", margin: 0, padding: 0 }}>
      <Helmet>
        <title>
          {currentJob && currentJob.job_titles?.[0]
            ? `${Object.keys(currentJob.category || {})[0] || "Job"}: ${currentJob.job_titles[0]}`
            : "ICPJobs"}
        </title>
        <link rel="icon" type="image/png" href={"/jobs.png"} />
      </Helmet>

      <Paper
        elevation={0}
        sx={{
          border: { xs: "none", sm: `1px solid ${theme.palette.divider}` },
          borderBottom: { xs: `1px solid ${theme.palette.divider}`, sm: `1px solid ${theme.palette.divider}` },
          borderRadius: { xs: 0, sm: 2 },
          overflow: "visible",
          transition: "all 0.3s ease",
          bgcolor: theme.palette.background.paper,
          p: { xs: 1, sm: 1.5 },
          mx: { xs: 0, sm: 0 },
          "&:hover": {
            borderColor: { xs: theme.palette.divider, sm: theme.palette.primary.main + "40" },
          },
        }}
      >
        {currentJob ? (
          <Stack direction="row" spacing={{ xs: 0.5, sm: 1 }} alignItems="center">
            {/* Share button */}
            <Tooltip
              title={copySuccess ? "Link copied!" : "Copy job link"}
              arrow
              open={copySuccess ? true : undefined}
            >
              <IconButton
                size="small"
                onClick={(e) => handleJobAction(currentJob, "copy", e)}
                sx={{
                  color: copySuccess ? theme.palette.common.white : theme.palette.info.main,
                  bgcolor: copySuccess ? theme.palette.success.main : theme.palette.info.main + "15",
                  "&:hover": {
                    bgcolor: copySuccess ? theme.palette.success.dark : theme.palette.info.main + "25",
                    transform: "scale(1.05)",
                  },
                  "&:active": { transform: "scale(0.95)" },
                  width: { xs: 24, sm: 32 },
                  height: { xs: 24, sm: 32 },
                  transition: "all 0.2s ease",
                }}
              >
                {copySuccess ? <Check sx={{ fontSize: { xs: 14, sm: 20 } }} /> : <Share sx={{ fontSize: { xs: 14, sm: 20 } }} />}
              </IconButton>
            </Tooltip>

            {/* Job title, category and dropdown icon - grouped together */}
            <Box
              onClick={() => setExpanded(!expanded)}
              sx={{
                minWidth: 0,
                flex: 1,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: { xs: 0.5, sm: 1 },
                px: { xs: 0.5, sm: 1 },
                py: { xs: 0.25, sm: 0.5 },
                borderRadius: 1,
                "&:hover": { bgcolor: theme.palette.action.hover },
              }}
            >
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 600,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    color: theme.palette.text.primary,
                    lineHeight: 1.4,
                    fontSize: { xs: "0.95rem", sm: "1rem" },
                  }}
                >
                  {getJobTitle(currentJob)}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: theme.palette.text.secondary,
                    fontSize: { xs: "0.7rem", sm: "0.75rem" },
                    lineHeight: 1.2,
                  }}
                >
                  {getJobCategory(currentJob)}
                </Typography>
              </Box>
              <KeyboardArrowDown
                sx={{
                  color: theme.palette.text.secondary,
                  fontSize: { xs: 18, sm: 22 },
                  transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.3s ease",
                  flexShrink: 0,
                  ml: 0.5,
                }}
              />
            </Box>

            {/* Status badge - separate and professional */}
            <Box
              sx={{
                display: { xs: "none", sm: "flex" },
                alignItems: "center",
                px: 1.5,
                py: 0.5,
                borderRadius: 1,
                bgcolor: currentJob.active
                  ? theme.palette.success.main + "10"
                  : theme.palette.action.hover,
                border: `1px solid ${
                  currentJob.active
                    ? theme.palette.success.main + "30"
                    : theme.palette.divider
                }`,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: currentJob.active
                    ? theme.palette.success.main
                    : theme.palette.text.disabled,
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                }}
              >
                {currentJob.active ? "Active" : "Inactive"}
              </Typography>
            </Box>

            {/* Action buttons */}
            <Stack direction="row" spacing={{ xs: 0.25, sm: 0.5 }}>
            <Tooltip title={currentJob.active ? "Pause job posting" : "Activate job posting"} arrow>
  <IconButton
    size="small"
    onClick={(e) => handleJobAction(currentJob, "toggle", e)}
    sx={{
      "&:hover": {
        bgcolor: currentJob.active
          ? theme.palette.warning.main + "15"
          : theme.palette.success.main + "15",
      },
      width: { xs: 24, sm: 32 },
      height: { xs: 24, sm: 32 },
    }}
  >
    {currentJob.active ? <Pause sx={{ fontSize: { xs: 16, sm: 20 } }} /> : <PlayArrow sx={{ fontSize: { xs: 16, sm: 20 } }} />}
  </IconButton>
</Tooltip>

<Tooltip title="View job details" arrow>
  <IconButton
    size="small"
    onClick={(e) => handleJobAction(currentJob, "details", e)}
    sx={{
      "&:hover": { bgcolor: theme.palette.info.main + "15" },
      width: { xs: 24, sm: 32 },
      height: { xs: 24, sm: 32 },
    }}
  >
    <Visibility sx={{ fontSize: { xs: 16, sm: 20 } }} />
  </IconButton>
</Tooltip>

        

              <Tooltip title="Delete job posting" arrow>
                <IconButton
                  size="small"
                  disabled={currentJob?.skills?.length === 0 && jobs.length === 1}
                  onClick={(e) => handleJobAction(currentJob, "delete", e)}
                  sx={{
                    "&:hover": { bgcolor: theme.palette.error.main + "15" },
                    width: { xs: 24, sm: 32 },
                    height: { xs: 24, sm: 32 },
                  }}
                >
                  <Delete sx={{ fontSize: { xs: 16, sm: 20 } }} />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
        ) : (
          <Box
            onClick={() => setExpanded(!expanded)}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              py: 1,
              cursor: "pointer",
              borderRadius: 1,
              "&:hover": { bgcolor: theme.palette.action.hover },
            }}
          >
            <Add sx={{ color: theme.palette.text.secondary }} />
            <Typography variant="body1" color="textSecondary">
              Chat bellow ...
            </Typography>
          </Box>
        )}

        <Collapse in={expanded} timeout={300}>
          <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
            <Stack spacing={1}>
              <Box
                onClick={() => {
                  if (jobs.length < MAX_JOBS) handleJobSelect(null);
                }}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  p: 2,
                  borderRadius: 1,
                  cursor: jobs.length >= MAX_JOBS ? "not-allowed" : "pointer",
                  bgcolor: jobs.length >= MAX_JOBS ? "transparent" : theme.palette.primary.main + "08",
                  opacity: jobs.length >= MAX_JOBS ? 0.5 : 1,
                  "&:hover": {
                    bgcolor: jobs.length >= MAX_JOBS
                      ? theme.palette.action.hover
                      : theme.palette.primary.main + "12",
                  },
                }}
              >
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: jobs.length >= MAX_JOBS
                      ? theme.palette.grey[200]
                      : theme.palette.primary.main + "15",
                  }}
                >
                  <Add
                    sx={{
                      color: jobs.length >= MAX_JOBS
                        ? theme.palette.text.disabled
                        : theme.palette.primary.main,
                      fontSize: 20,
                    }}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 500,
                      color: jobs.length >= MAX_JOBS
                        ? theme.palette.text.disabled
                        : theme.palette.primary.main,
                    }}
                  >
                    Create New Job Post
                  </Typography>
                  {jobs.length >= MAX_JOBS && (
                    <Typography variant="caption" sx={{ color: theme.palette.error.main, fontSize: "0.7rem" }}>
                      Maximum limit reached ({MAX_JOBS}/{MAX_JOBS})
                    </Typography>
                  )}
                </Box>
              </Box>

              {jobs.map((job: Job) => (
                <Box
                  key={job.id}
                  onClick={() => handleJobSelect(job.id)}
                  sx={{
                    p: 2,
                    borderRadius: 1,
                    cursor: "pointer",
                    bgcolor: currentJobId === job.id ? theme.palette.action.selected : "transparent",
                    "&:hover": { bgcolor: theme.palette.action.hover },
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 500,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      color: theme.palette.text.primary,
                    }}
                  >
                    {getJobTitle(job)}
                  </Typography>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontSize: "0.75rem" }}>
                    {getJobCategory(job)}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>
        </Collapse>
      </Paper>

      <Collapse in={showBriefData} timeout={400}>
        <Box data-testid="job-brief-data">
          <JobUpdateAnimation currentJob={currentJob} jobs={jobs} />
        </Box>
      </Collapse>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
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
        <DialogTitle sx={{ p: { xs: 2, sm: 3 }, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: "1rem", sm: "1.25rem" } }}>
            Job Details
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ p: 0, overflow: "auto" }}>
          {selectedJob && <JobDetails job={selectedJob} match={null} showEmails={true} />}
        </DialogContent>

        <DialogActions sx={{ p: { xs: 2, sm: 3 }, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Button
            onClick={() => setDialogOpen(false)}
            variant="contained"
            fullWidth
            sx={{ borderRadius: 2, width: { xs: "100%", sm: "auto" } }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
export default JobSelector;
