import React, { useState, useCallback, useEffect, useRef } from "react";
import { Box } from "@mui/material";

import { v4 as uuidv4 } from "uuid";
import { textToJson } from "./utils/processResponseJobs";
import { useDispatch, useSelector } from "react-redux";
import { Job, JobUpdate } from "$/declarations/backend/backend.did";
import { BUILD_JOB_PROMPT } from "./utils/buildProfilePrompt";
import JobSelector from "@/pages/discover/jobs/JobSelector";
import JobSearchComponent from "./JobSearchComponent";

import { useBackendContext } from "@/contexts/BackendContext";
import LoginButton from "@/components/MainComponents/topNavBar/loginButton";
import { Login } from "@mui/icons-material";

// interface Message {
//   id: string;
//   content: string;
//   sender: "user" | "ai";
//   timestamp: Date;
// }

// interface ProcessedJobResponse {
//   done: boolean;
//   feedback: string;
//   actions: Array<
//     | { type: "SET_CURRENT_JOB"; job: Job }
//     | { type: "UPDATE_JOB"; update: JobUpdate }
//     | { type: "SET_JOBS"; jobs: Job[] }
//     | { type: "ADD_JOB"; job: Job }
//     | { type: "DELETE_JOB"; id: string }
//   >;
// }

const JobsPage: React.FC = () => {
 const { backendActor } = useBackendContext();

 const { isChanged, currentJobId, jobs, matchingJobs } = useSelector(
   (state: any) => state.jobState,
 );
 const currentJobRef = useRef<Job | undefined>(undefined);
 const dispatch = useDispatch();

 const [isProfileDone, setIsProfileDone] = useState<boolean>(false);

 useEffect(() => {
   currentJobRef.current = jobs.find((job: Job) => job.id === currentJobId);
 }, [currentJobId, jobs]);

 useEffect(() => {
   const fetchJobs = async () => {
     try {
       const res: { jobs: Job[]; matching_jobs: Job[] } =
         await backendActor.get_my_jobs();
       dispatch({
         type: "INIT_JOBS",
         jobs: res.jobs,
         matchingJobs: res.matching_jobs,
       });
     } catch (error) {
       console.error("Error fetching jobs:", error);
     }
   };

   fetchJobs();
 }, [dispatch]);

 const { profile } = useSelector((state: any) => state.filesState);

 if (!profile) {
   return (
     <>
       Please make suer to login first
       <LoginButton startIcon={<Login />} />
     </>
   );
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
     }}
   >
     <JobSelector />
     <JobSearchComponent />
   </Box>
 );
};

export default JobsPage;
