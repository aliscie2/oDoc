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
import { Job } from "$/declarations/backend/backend.did";

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
  const currentJob = jobs.find((job: Job) => job.id === currentJobId);

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
  // const getJobCategoryName = (category) => {
  //   if (!category) return "Unknown";
  //   const categoryKey = Object.keys(category)[0];
  //   return categoryKey || "Unknown";
  // };

  // Helper function to extract skills from job
  // const getJobSkills = (job) => {
  //   return job?.skills?.slice(0, 3) || [];
  // };

  // Helper function to get job title or default
  // const getJobTitle = (job) => {
  //   return job?.title || job?.role || "Untitled Position";
  // };

  // If fullscreen mode, render JobsPage directly

  let lookingFor = Object.keys(currentJob?.category || {});
  lookingFor = lookingFor && lookingFor[0];
  lookingFor = lookingFor == "Job" ? "Talent" : "Job";
  lookingFor = matchingJobs.length > 1 ? lookingFor + "s" : lookingFor;
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
        title={matchingJobs.length + " " + lookingFor + " found"}
        color="#00d4ff"
        onExpandClick={handleExpandClick}
        showExpandIcon={true}
      />

      <JobsPage />
    </BaseCard>
  );
};

export default JobMatchesCard;
