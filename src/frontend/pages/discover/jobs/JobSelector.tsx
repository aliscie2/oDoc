import { Job } from "$/declarations/backend/backend.did";
import { useBackendContext } from "@/contexts/BackendContext";
import { Add, Delete, Share, Visibility } from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import JobDetails from "./JobDetails";
import JobBriefData from "./quickBar";
import { Helmet } from "react-helmet-async";

const JobSelector: React.FC = () => {
  const dispatch = useDispatch();
  const { currentJobId, jobs } = useSelector((state: any) => state.jobState);
  const [expanded, setExpanded] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showBriefData, setShowBriefData] = useState(false);
  const [previousJob, setPreviousJob] = useState<Job | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const theme = useTheme();
  const currentJob = jobs.find((job: Job) => job.id === currentJobId);
  const { backendActor } = useBackendContext();

  const JOB_FIELDS = [
    "description",
    "location",
    "salary",
    "jobType",
    "category",
    "active",
    "skills",
    "requirements",
    "benefits",
    "company",
    "contactEmail",
    "applicationDeadline",
    "experienceLevel",
  ];
  const MAX_JOBS = 4;
  const HIGHLIGHT_DURATION = 4000;
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
    dispatch({ type: "SET_CURRENT_JOB", job });
    setExpanded(false);
  };

  const handleJobAction = (
    job: Job,
    action: string,
    event: React.MouseEvent,
  ) => {
    event.stopPropagation();
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
          backendActor?.delete_job(job.id);
          dispatch({ type: "DELETE_JOB", id: job.id });
        }
        break;
      case "copy":
        navigator.clipboard.writeText(
          `${window.location.origin}/jobs?id=${job.id}`,
        );
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), COPY_SUCCESS_DURATION);
        break;
    }
  };

  const truncateText = (text: string, maxLength: number = 40) =>
    text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;

  const getJobCategory = (job: Job) =>
    job.category
      ? Object.keys(job.category)[0] || "Uncategorized"
      : "Uncategorized";

  const getJobTitle = (job: Job) =>
    job.job_titles ? truncateText(job.job_titles) : "Untitled Job";

  const jobActions = [
    {
      action: "toggle",
      icon: (job: Job) => (job.active ? "active" : "inactive"),
      color: (job: Job) => (job.active ? "success" : "error"),
      disabled: (job: Job) => false,
    },
    {
      action: "details",
      icon: (job: Job) => <Visibility fontSize="small" />,
      color: (job: Job) => theme.palette.info.main,
      disabled: (job: Job) => false,
    },
    {
      action: "copy",
      icon: (job: Job) => <Share fontSize="small" />,
      color: (job: Job) =>
        copySuccess ? theme.palette.success.main : theme.palette.info.main,
      tooltip: (job: Job) =>
        copySuccess
          ? "Link copied successfully!"
          : `Copy your ${getJobCategory(job)} link`,
      disabled: (job: Job) => false,
    },
    {
      action: "delete",
      icon: (job: Job) => <Delete fontSize="small" />,
      color: (job: Job) => theme.palette.error.main,
      disabled: (job: Job) =>
        currentJob?.skills?.length === 0 && jobs.length === 1,
    },
  ];

  const renderJobMenuItem = (job: Job) => (
    <MenuItem
      key={job.id}
      value={job.id}
      onClick={() => handleJobSelect(job.id)}
      sx={{ py: 1, "&:hover": { bgcolor: theme.palette.action.hover } }}
    >
      <Box
        sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%" }}
      >
        <Chip
          label={getJobCategory(job)}
          size="small"
          color="secondary"
          variant="outlined"
        />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="body1"
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {getJobTitle(job)}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          {jobActions.map(({ action, icon, color, tooltip, disabled }) => {
            const isDisabled = disabled(job);
            const buttonColor = color(job);
            const ActionButton = (
              <IconButton
                size="small"
                disabled={isDisabled}
                color={
                  typeof buttonColor === "string" &&
                  [
                    "primary",
                    "secondary",
                    "success",
                    "error",
                    "info",
                    "warning",
                  ].includes(buttonColor)
                    ? (buttonColor as any)
                    : undefined
                }
                onClick={(event) => handleJobAction(job, action, event)}
                sx={{
                  color:
                    typeof buttonColor === "string" &&
                    ![
                      "primary",
                      "secondary",
                      "success",
                      "error",
                      "info",
                      "warning",
                    ].includes(buttonColor)
                      ? buttonColor
                      : undefined,
                  "&:hover": { bgcolor: theme.palette.info.light + "20" },
                }}
              >
                {icon(job)}
              </IconButton>
            );
            return tooltip ? (
              <Tooltip key={action} title={tooltip(job)} arrow>
                {ActionButton}
              </Tooltip>
            ) : (
              <div key={action}>{ActionButton}</div>
            );
          })}
        </Box>
      </Box>
    </MenuItem>
  );

  return (
    <Box sx={{ width: "100%", margin: 0, padding: 0 }}>
      <Helmet>
        <title>
          {currentJob?`${Object.keys(currentJob?.category || {})[0]}:  ${currentJob?.job_titles[0]}` ||
            "Jobs":"ICPJobs"}
        </title>
      </Helmet>

      <Paper
        elevation={0}
        sx={{
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 3,
          overflow: "hidden",
          transition: "all 0.3s ease",
        }}
      >
        <Select
          value={currentJobId || ""}
          displayEmpty
          fullWidth
          open={expanded}
          onOpen={() => setExpanded(true)}
          onClose={() => setExpanded(false)}
          sx={{
            "& .MuiSelect-select": { p: 1, border: "none" },
            "& fieldset": { border: "none" },
            bgcolor: theme.palette.background.paper,
          }}
          renderValue={() => (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {currentJob ? (
                <>
                  <Chip
                    label={getJobCategory(currentJob)}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                  <Typography variant="body1" sx={{ flex: 1 }}>
                    {getJobTitle(currentJob)}
                  </Typography>
                </>
              ) : (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Add sx={{ color: theme.palette.text.secondary }} />
                  <Typography variant="body1" color="textSecondary">
                    Select or create a job
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        >
          <MenuItem
            value=""
            onClick={() => handleJobSelect(null)}
            disabled={jobs.length >= MAX_JOBS}
            sx={{
              py: 1,
              borderBottom:
                jobs.length > 0 ? `1px solid ${theme.palette.divider}` : "none",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                width: "100%",
              }}
            >
              <Add color={jobs.length >= MAX_JOBS ? "disabled" : "primary"} />
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="body1"
                  color={jobs.length >= MAX_JOBS ? "textSecondary" : "primary"}
                >
                  Create New Job Post
                </Typography>
                {jobs.length >= MAX_JOBS && (
                  <Typography variant="caption" color="error">
                    Maximum limit reached ({MAX_JOBS}/{MAX_JOBS})
                  </Typography>
                )}
              </Box>
            </Box>
          </MenuItem>

          {jobs.map(renderJobMenuItem)}
        </Select>
      </Paper>

      <Collapse in={showBriefData} timeout={400}>
        <Box data-testid="job-brief-data">
          <JobBriefData currentJob={currentJob} />
        </Box>
      </Collapse>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
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
            backgroundColor: { xs: "transparent", sm: "rgba(0, 0, 0, 0.5)" },
          },
        }}
      >
        <DialogTitle
          sx={{ pb: 1, borderBottom: `1px solid ${theme.palette.divider}` }}
        >
          <Typography variant="h6" sx={{ fontWeight: 500 }}>
            Job Details
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ p: { xs: 0, sm: 0 } }}>
          {selectedJob && <JobDetails job={selectedJob} showEmails={true} />}
        </DialogContent>

        <DialogActions
          sx={{ p: 3, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}
        >
          <Button
            onClick={() => setDialogOpen(false)}
            variant="contained"
            sx={{ borderRadius: 2 }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
export default JobSelector;
