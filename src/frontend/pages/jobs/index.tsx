import { Box, CircularProgress } from "@mui/material";
import React, { useEffect, useRef } from "react";

import { Job } from "$/declarations/backend/backend.did";
import {
  selectCurrentJobId,
  selectJobs,
  selectProfile,
} from "@/redux/selectors";
import { useSelector } from "react-redux";

import JobSearchComponent from "./JobSearchComponent";
import JobSelector from "./JobSelector";

import { Helmet } from "react-helmet-async";

const JobsPage: React.FC = React.memo(() => {
  const currentJobId = useSelector(selectCurrentJobId);
  const jobs = useSelector(selectJobs);
  const profile = useSelector(selectProfile);
  const currentJobRef = useRef<Job | undefined>(undefined);

  useEffect(() => {
    currentJobRef.current = jobs?.find((job: Job) => job.id === currentJobId);
  }, [currentJobId, jobs]);

  if (!profile) {
    return <CircularProgress />;
  }

  const hasJobs = jobs && jobs.length > 0;

  return (
    <Box
      className="jobs-page-container"
      data-testid="jobs-page-container"
      sx={{
        padding: 0,
        margin: 0,
        height: "100%",
        overflowY: "auto",
        overflowX: "hidden",
        display: "flex",
        flexDirection: "column",
        maxWidth: { xs: "100%", sm: "600px", md: "800px" },
        marginX: { xs: 0, sm: "auto" },
      }}
    >
      <Helmet>
        <title>Jobs</title>
      </Helmet>

      {hasJobs && (
        <>
          <Box
            data-testid="job-selector-container"
            sx={{
              marginTop: { xs: "20px", sm: 0 },
              marginLeft: { xs: "60px", sm: 0 },
            }}
          >
            <JobSelector />
          </Box>
          <Box data-testid="job-search-container">
            <JobSearchComponent />
          </Box>
        </>
      )}
    </Box>
  );
});

JobsPage.displayName = "JobsPage";

export default JobsPage;
