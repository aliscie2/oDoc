import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Typography, CircularProgress, Grid, Card, CardContent, CardActions, Dialog } from '@mui/material';
import { RichTreeView } from '@mui/x-tree-view/RichTreeView';
import { TreeItem, TreeItemProps } from '@mui/x-tree-view/TreeItem';
import { Job, Match } from '$/declarations/backend/backend.did';
import ConnectButton from './ConnectButton';
import { dummyMatches, dummyMatchingJobs } from './dummyMatchingJobs';
import { useBackendContext } from '@/contexts/BackendContext';
import JobDetails from './JobDetails';
import { JOB_MATCHING_PROMPT } from './jobMatchingPrompt';
import { GeminiAgent } from '@/AIAgents/GeminiAgent';
import { processResponseJobs } from './utils/processResponseJobs';


const JobSearchComponent: React.FC = () => {
  const { backendActor } = useBackendContext();

  const dispatch = useDispatch();
  const { currentJobId, jobs,matchingJobs } = useSelector((state: any) => state.jobState);

  const currentJob = jobs.find((job: Job) => job.id === currentJobId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openDialogId, setOpenDialogId] = useState<string | null>(null);
  const [geminiAgent, setGeminiAgent] = useState<GeminiAgent | null>(null);

  useEffect(() => {
    setGeminiAgent(new GeminiAgent());
  }, []);

  useEffect(() => {
    const fetchMatchingJobs = async () => {
      if (!currentJobId) return;
      
      setLoading(true);
      setError(null);
      
      // try {
      //   const currentJob = jobs.find((job: Job) => job.id === currentJobId);
      //   const skills = currentJob?.skills || [];
      //   let lookingForCategory = {};
      //   if (currentJob?.category && JSON.stringify(currentJob.category) === JSON.stringify({Job: null})) {
      //       lookingForCategory = {Talent: null};
      //   } else if (currentJob?.category && JSON.stringify(currentJob.category) === JSON.stringify({Talent: null})) {
      //       lookingForCategory = {Job: null};
      //   } else {
      //       lookingForCategory = currentJob?.category || {Other: null};
      //   }
      //   const newMatches: Array<Job> = await backendActor.get_matches(currentJobId, skills, lookingForCategory);
      //   // console.log({newMatches,currentJobId, skills, lookingForCategory});
        
      //   // Filter out matches that are already in currentJob.matches
      //   let allJobMatches = newMatches.filter(
      //     (m: Match) => !currentJob?.matches?.some(
      //       (existing: Match) => existing.job_id === m.job_id
      //     )
      //   );

        
      //   // we put the matchs and old matches togather
      //   // we filter out repeated ones from the old matches
      //   // if there is ID repeattion we remove only the old one and keep new ones
      //   // if new one != old_one we set is_updated=true
      //   // if is_updated do not filter it out and put it back into the ai.
      //   // we can check that if matchingJob.dated_updated > matche.dated_updated
      //   // let oldMatches = currentJob?.matches.map(m=>jobs.find(j=>j.id==m.job_id)) || [];
      //   // console.log({oldMatches});
      //   // oldMatches = oldMatches?oldMatches.fiter(o=>!allJobMatches.some((m: Match) => m.job_id === o.id)):[];
      //   // allJobMatches.push(...oldMatches);
        
        
      //   let actualNewMatches = newMatches.filter(
      //     job => !matchingJobs.some((matchingJob:Job) => matchingJob.id === job.id)
      //   );

      //   if (actualNewMatches.length > 0) {
      //     const messageToSend = `
      //     ${JOB_MATCHING_PROMPT}
      //     candidates: ${JSON.stringify(allJobMatches)}
      //     Current: ${JSON.stringify(currentJob)}
      //     `;
          
      //     const response = await geminiAgent?.sendMessage(messageToSend);
      //       const parsed: any =response&& processResponseJobs(response).extractedData;
            
      //       parsed && dispatch({
      //         type: "UPDATE_MATCHES",
      //         matches: parsed.matches,
      //       });  
      //   }
        

      //   dispatch({
      //     type: "UPDATE_MATCHING_JOBS",
      //     matchingJobs: allJobMatches,
      //     matches: [],
      //   });
      // } catch (err) {
      //   console.log("Error fetching matching jobs:", err);
      //   setError("Failed to fetch matching jobs. Please try again.");
      // } finally {
      //   setLoading(false);
      // }
    };
    
    fetchMatchingJobs();
  }, [currentJobId, dispatch]);
  
  // if (loading) {
  //   return (
  //     <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
  //       <CircularProgress />
  //     </Box>
  //   );
  // }
  
  if (error) {
    return (
      <Box sx={{ p: 2, color: 'error.main' }}>
        <Typography>{error}</Typography>
      </Box>
    );
  }
  
  if (matchingJobs?.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography>No matching jobs found. Try updating your profile with more skills.</Typography>
      </Box>
    );
  }
  
  const handleOpenDialog = (jobId: string) => {
    setOpenDialogId(jobId);
  };

  const handleCloseDialog = () => {
    setOpenDialogId(null);
  };

  const truncateTitle = (title: string) => {
    const words = title?.split(' ');
    return words&&words.slice(0, 5).join(' ') + (words.length > 5 ? '...' : '');
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Matching Jobs ({matchingJobs.length})</Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {matchingJobs
          .map(job => ({
            job,
            match: currentJob?.matches?.find((m: Match) => m.job_id === job.id)
          }))
          .sort((a, b) => (b.match?.score || 0) - (a.match?.score || 0))
          .map(({ job, match }) => (
            <Card 
              key={job.id}
              sx={{ cursor: 'pointer', width: '100%' }}
              onClick={() => handleOpenDialog(job.id)}
            >
              <CardContent>
                <Typography variant="h6">
                  {job?.job_titles&&truncateTitle(job?.job_titles[0])}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Matching Score: {match?.score || 'N/A'}
                </Typography>
                {job.emails?.[0] && (
                  <Typography variant="body2" color="text.secondary">
                    Contact: {job.emails[0]}
                  </Typography>
                )}
              </CardContent>
              <CardActions>
                <ConnectButton jobId={job.id} />
              </CardActions>
            </Card>
          ))}
      </Box>
      
      {matchingJobs.map((job: Job) => (
        <Dialog
          key={job.id}
          open={openDialogId === job.id}
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
        >
          <JobDetails job={job} />
        </Dialog>
      ))}
    </Box>
  );
};

export default JobSearchComponent;