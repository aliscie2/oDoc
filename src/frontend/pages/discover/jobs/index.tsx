import React, { useState, useEffect, useRef } from "react";
import { Box } from "@mui/material";

import { useDispatch, useSelector } from "react-redux";
import { Job } from "$/declarations/backend/backend.did";

import JobSelector from "@/pages/discover/jobs/JobSelector";
import JobSearchComponent from "./JobSearchComponent";

import LoginButton from "@/components/MainComponents/topNavBar/loginButton";
import { Login } from "@mui/icons-material";

const JobsPage: React.FC = () => {
  const { isChanged, currentJobId, jobs, matchingJobs } = useSelector(
    (state: any) => state.jobState,
  );
  const currentJobRef = useRef<Job | undefined>(undefined);
  const dispatch = useDispatch();

  const [isProfileDone, setIsProfileDone] = useState<boolean>(false);

  useEffect(() => {
    currentJobRef.current = jobs.find((job: Job) => job.id === currentJobId);
  }, [currentJobId, jobs]);

  const { profile } = useSelector((state: any) => state.filesState);

  if (!profile) {
    return <LoginButton startIcon={<Login />} />;
  }

  return (
    <Box
      className="jobs-page-container"
      sx={{
        padding: 0,
        margin: 0,
        height: "100%",
        overflowY: "auto",
        overflowX: "hidden",
        display: "flex",
        flexDirection: "column",
        // Center content with max width like Twitter
        maxWidth: { xs: "100%", sm: "600px", md: "800px" },
        marginX: { xs: 0, sm: "auto" },
      }}
    >
      <Box
        sx={{
          // Mobile: add left margin to avoid sandwich button overlap
          marginLeft: { xs: "60px", sm: 0 },
          marginRight: { xs: "16px", sm: 0 },
        }}
      >
        <JobSelector />
      </Box>
      <JobSearchComponent />
    </Box>
  );
};
export default JobsPage;
