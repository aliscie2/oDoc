import React, { useState } from "react";
import {
  Box,
  Typography,
  Chip,
  Avatar,
  Divider,
  Collapse,
  IconButton,
} from "@mui/material";
import { Search, MoreHoriz, Close } from "@mui/icons-material";
import { useSelector } from "react-redux";
import { BaseCard, CardHeader } from "./card";
import JobsPage from "../discover/jobs";
import FullscreenDialog from "./FullscreenDialog"; // Import the shared dialog

export const JobMatchesCard = ({
  isHovered,
  isExpanded,
  onMouseEnter,
  onMouseLeave,
  onClick,
  isVisible,
  isFullscreen,
  onExpandClick,
}) => {
  const { isChanged, currentJobId, jobs, matchingJobs } = useSelector(
    (state: any) => state.jobState,
  );

  // Get latest 3 matches for preview
  const previewMatches = matchingJobs?.slice(0, 3) || [];
  const hasMoreMatches = matchingJobs?.length > 3;
  const totalMatches = matchingJobs?.length || 0;

  const handleCardClick = (e) => {
    e.stopPropagation();
    if (onClick) onClick(e);
  };

  const handleExpandClick = (e) => {
    e.stopPropagation();
    if (onExpandClick) onExpandClick(e);
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

  // If fullscreen mode, render JobsPage directly
  if (isFullscreen) {
    return (
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1300,
          backgroundColor: "background.default",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 2,
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <Typography variant="h6">Job Matches & Profiles</Typography>
          <IconButton onClick={handleExpandClick}>
            <Close />
          </IconButton>
        </Box>
        <Box sx={{ flex: 1, overflow: "hidden" }}>
          <JobsPage />
        </Box>
      </Box>
    );
  }

  return (
    <BaseCard
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={handleCardClick}
      isVisible={isVisible}
      sx={{ cursor: "pointer", height: isExpanded ? "400px" : "auto" }}
    >
      <CardHeader 
        icon={<Search />} 
        title="Job Matches" 
        color="#00d4ff"
        onExpandClick={handleExpandClick}
        showExpandIcon={true}
      />

      {/* Normal and Expanded modes */}
      <Box 
          sx={{ 
            height: "350px", 
            overflow: "hidden",
            border: 1,
            borderColor: "divider",
            borderRadius: 1,
            mt: 1
          }}
        >
          <JobsPage />
        </Box>
    </BaseCard>
  );
};

export default JobMatchesCard;
