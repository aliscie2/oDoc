import React, { useState } from "react";
import {
  Box,
  Typography,
  Chip,
  Avatar,
  Divider,
  Collapse,
} from "@mui/material";
import { Search, MoreHoriz } from "@mui/icons-material";
import { useSelector } from "react-redux";
import { BaseCard, CardHeader } from "./card";
import JobsPage from "../discover/jobs";
import FullscreenDialog from "./FullscreenDialog"; // Import the shared dialog

// Job Matches Component
export const JobMatchesCard = ({
  isHovered,
  isExpanded,
  onMouseEnter,
  onMouseLeave,
  onClick,
  isVisible,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { isChanged, currentJobId, jobs, matchingJobs } = useSelector(
    (state: any) => state.jobState,
  );

  // Get latest 3 matches for preview
  const previewMatches = matchingJobs?.slice(0, 3) || [];
  const hasMoreMatches = matchingJobs?.length > 3;
  const totalMatches = matchingJobs?.length || 0;

  const handleCardClick = (e) => {
    e.stopPropagation();
    setDialogOpen(true);
    if (onClick) onClick(e);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  // Helper function to get job category display name
  const getJobCategoryName = (category) => {
    if (!category) return "Unknown";
    const categoryKey = Object.keys(category)[0];
    return categoryKey || "Unknown";
  };

  // Helper function to extract skills from job
  const getJobSkills = (job) => {
    return job?.skills?.slice(0, 3) || [];
  };

  // Helper function to get job title or default
  const getJobTitle = (job) => {
    return job?.title || job?.role || "Untitled Position";
  };

  return (
    <>
      <BaseCard
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onClick={handleCardClick}
        isVisible={isVisible}
        sx={{ cursor: "pointer" }}
      >
        <CardHeader icon={<Search />} title="Job Matches" color="#00d4ff" />

        <Box display="flex" justifyContent="space-between" mb={2}>
          <Chip
            label={`${totalMatches} ${totalMatches === 1 ? "Match" : "Matches"}`}
            size="small"
            color="primary"
          />
          <Chip
            label={`${jobs?.length || 0} ${jobs?.length === 1 ? "Job" : "Jobs"}`}
            size="small"
            variant="outlined"
          />
        </Box>

        <Collapse in={isHovered || isExpanded}>
          <Box mt={2}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              Latest Matches:
            </Typography>
            {previewMatches.length > 0 ? (
              <Box display="flex" flexDirection="column" gap={1}>
                {previewMatches.map((match, idx) => (
                  <Box key={match.id || idx} display="flex" alignItems="center">
                    <Avatar
                      sx={{
                        width: 24,
                        height: 24,
                        mr: 1,
                        bgcolor: `hsl(${(idx * 120) % 360}, 70%, 50%)`,
                        fontSize: "0.75rem",
                      }}
                    >
                      {getJobCategoryName(match.category)[0]?.toUpperCase() ||
                        "J"}
                    </Avatar>
                    <Box flex={1}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {getJobTitle(match)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {getJobSkills(match).join(", ")}
                        {match.skills?.length > 3 && "..."}
                      </Typography>
                    </Box>
                  </Box>
                ))}

                {hasMoreMatches && (
                  <Box display="flex" alignItems="center" mt={1}>
                    <MoreHoriz sx={{ mr: 1, color: "text.secondary" }} />
                    <Typography variant="caption" color="text.secondary">
                      {matchingJobs.length - 3} more matches available
                    </Typography>
                  </Box>
                )}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No matches found yet
              </Typography>
            )}
          </Box>
        </Collapse>

        <Collapse in={isExpanded}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="body2" color="text.secondary">
            {totalMatches > 0
              ? `Click to view all ${totalMatches} job matches and manage your job profiles.`
              : "Create your first job profile to start finding matches."}
          </Typography>
        </Collapse>
      </BaseCard>

      {/* Use Shared Fullscreen Dialog */}
      <FullscreenDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        title="Job Matches & Profiles"
        showTitle={true}
      >
        <JobsPage />
      </FullscreenDialog>
    </>
  );
};

export default JobMatchesCard;
