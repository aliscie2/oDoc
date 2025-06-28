import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Job } from "$/declarations/backend/backend.did";
import {
  Box,
  Typography,
  Select,
  MenuItem,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Chip,
  useTheme,
  useMediaQuery,
  Collapse,
  Fade,
  Slide,
} from "@mui/material";
import { 
  Visibility, 
  Delete, 
  Add, 
  Work, 
  LocationOn, 
  AttachMoney, 
  Schedule,
  TrendingUp,
  KeyboardArrowDown,
  KeyboardArrowUp,
  Business,
  Email,
  CalendarToday,
  CheckCircle,
  Cancel,
  Star,
  Assignment,
  CardGiftcard,
  Person
} from "@mui/icons-material";
import JobDetails from "./JobDetails";
import { useBackendContext } from "@/contexts/BackendContext";
import JobBriefData from "./quickBar";



const JobSelector: React.FC = () => {
  const dispatch = useDispatch();
  const { currentJobId, jobs } = useSelector((state: any) => state.jobState);
  const [expanded, setExpanded] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showBriefData, setShowBriefData] = useState(false);
  const [highlightedFields, setHighlightedFields] = useState<Set<string>>(new Set());
  const [previousJob, setPreviousJob] = useState<Job | null>(null);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const currentJob = jobs.find((job: Job) => job.id === currentJobId);
  const { backendActor } = useBackendContext();

  // Track job changes and highlight updated fields
  useEffect(() => {
    if (currentJob && previousJob && currentJob.id === previousJob.id) {
      const changedFields = new Set<string>();
      
      // Compare all job fields to detect changes
      if (currentJob.description !== previousJob.description) changedFields.add('description');
      if (currentJob.location !== previousJob.location) changedFields.add('location');
      if (currentJob.salary !== previousJob.salary) changedFields.add('salary');
      if (currentJob.jobType !== previousJob.jobType) changedFields.add('jobType');
      if (JSON.stringify(currentJob.category) !== JSON.stringify(previousJob.category)) changedFields.add('category');
      if (currentJob.active !== previousJob.active) changedFields.add('active');
      if (JSON.stringify(currentJob.skills) !== JSON.stringify(previousJob.skills)) changedFields.add('skills');
      if (currentJob.requirements !== previousJob.requirements) changedFields.add('requirements');
      if (currentJob.benefits !== previousJob.benefits) changedFields.add('benefits');
      if (currentJob.company !== previousJob.company) changedFields.add('company');
      if (currentJob.contactEmail !== previousJob.contactEmail) changedFields.add('contactEmail');
      if (currentJob.applicationDeadline !== previousJob.applicationDeadline) changedFields.add('applicationDeadline');
      if (currentJob.experienceLevel !== previousJob.experienceLevel) changedFields.add('experienceLevel');
      
      if (changedFields.size > 0) {
        setHighlightedFields(changedFields);
        
        // Auto-scroll to brief data with smooth animation
        setTimeout(() => {
          const briefElement = document.querySelector('[data-testid="job-brief-data"]');
          if (briefElement) {
            briefElement.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center' 
            });
          }
        }, 300);
        
        // Clear highlights after animation
        setTimeout(() => {
          setHighlightedFields(new Set());
        }, 4000); // Extended to 4 seconds for better visibility
      }
    }
    
    setPreviousJob(currentJob ? { ...currentJob } : null);
  }, [currentJob]);

  // Show/hide brief data based on current job
  useEffect(() => {
    setShowBriefData(!!currentJob);
  }, [currentJob]);

  const handleJobSelect = (jobId: string | null) => {
    if (jobId === null) {
      dispatch({
        type: "SET_CURRENT_JOB",
        job: null,
      });
    } else {
      const job = jobs.find((j: Job) => j.id === jobId);
      dispatch({
        type: "SET_CURRENT_JOB",
        job: job,
      });
    }
    setExpanded(false);
  };

  const handleToggleActive = (job: Job, event: React.MouseEvent) => {
    event.stopPropagation();
    console.log("is active", job.active);
    dispatch({
      type: "TOGGLE_ACTIVE",
      id: job.id,
    });
  };

  const handleShowDetails = (job: Job, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedJob(job);
    setDialogOpen(true);
  };

  const handleDeleteJob = (job: Job, event: React.MouseEvent) => {
    event.stopPropagation();
    if (window.confirm("Are you sure you want to delete this job?")) {
      backendActor?.delete_job(job.id);
      dispatch({
        type: "DELETE_JOB",
        id: job.id,
      });
    }
  };

  const truncateText = (text: string, maxLength: number = 40) => {
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  };

  const getJobCategory = (job: Job) => {
    return job.category
      ? Object.keys(job.category)[0] || "Uncategorized"
      : "Uncategorized";
  };

  const getJobTitle = (job: Job) => {
    return job.description ? truncateText(job.description) : "Untitled Job";
  };

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 900,
        margin: "0 auto",
        p: isMobile ? 2 : 3,
      }}
    >
      {/* Job Selector */}
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
            "& .MuiSelect-select": {
              p: 3,
              border: "none",
            },
            "& fieldset": {
              border: "none",
            },
            bgcolor: theme.palette.background.paper,
          }}
          renderValue={(selected) => (
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
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
                  <IconButton
                    size="small"
                    sx={{ 
                      transform: showBriefData ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.3s ease",
                    }}
                  >
                    <KeyboardArrowDown />
                  </IconButton>
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
          {/* Create New Job Option */}
          <MenuItem
            value=""
            onClick={() => handleJobSelect(null)}
            disabled={jobs.length >= 4}
            sx={{
              py: 2,
              borderBottom:
                jobs.length > 0 ? `1px solid ${theme.palette.divider}` : "none",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                width: "100%",
              }}
            >
              <Add color={jobs.length >= 4 ? "disabled" : "primary"} />
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="body1"
                  color={jobs.length >= 4 ? "textSecondary" : "primary"}
                >
                  Create New Job Post
                </Typography>
                {jobs.length >= 4 && (
                  <Typography variant="caption" color="error">
                    Maximum limit reached (4/4)
                  </Typography>
                )}
              </Box>
            </Box>
          </MenuItem>

          {/* Existing Jobs */}
          {jobs.map((job: Job, index: number) => (
            <MenuItem
              key={job.id}
              value={job.id}
              onClick={() => handleJobSelect(job.id)}
              sx={{
                py: 2,
                "&:hover": {
                  bgcolor: theme.palette.action.hover,
                },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  width: "100%",
                }}
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
                  <IconButton
                    color={job.active ? "success" : "error"}
                    size="small"
                    onClick={(event) => handleToggleActive(job, event)}
                    sx={{
                      "&:hover": { bgcolor: theme.palette.info.light + "20" },
                    }}
                  >
                    {job.active ? "active" : "inactive"}
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={(event) => handleShowDetails(job, event)}
                    sx={{
                      color: theme.palette.info.main,
                      "&:hover": { bgcolor: theme.palette.info.light + "20" },
                    }}
                  >
                    <Visibility fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    disabled={
                      currentJob?.skills?.length === 0 && jobs.length === 1
                    }
                    onClick={(event) => handleDeleteJob(job, event)}
                    sx={{
                      color: theme.palette.error.main,
                      "&:hover": { bgcolor: theme.palette.error.light + "20" },
                    }}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </Paper>

      {/* Brief Data Bar */}
      <Collapse in={showBriefData} timeout={400}>
        <Box data-testid="job-brief-data">
          <JobBriefData 
            currentJob={currentJob} 
            highlightedFields={highlightedFields}
            previousJob={previousJob}
            isMobile={isMobile}
          />
        </Box>
      </Collapse>

      {/* Job Details Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            maxHeight: "80vh",
          },
        }}
      >
        <DialogTitle
          sx={{
            pb: 1,
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 500 }}>
            Job Details
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {selectedJob && <JobDetails job={selectedJob} />}
        </DialogContent>
        <DialogActions
          sx={{
            p: 3,
            pt: 2,
            borderTop: `1px solid ${theme.palette.divider}`,
          }}
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