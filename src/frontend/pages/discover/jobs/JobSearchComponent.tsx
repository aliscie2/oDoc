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


const JobSearchComponent: React.FC = () => {
  const dispatch = useDispatch();
  const { currentJobId, jobs,matchingJobs } = useSelector((state: any) => state.jobState);
  const currentJob = jobs.find((job: Job) => job.id === currentJobId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openDialogId, setOpenDialogId] = useState<string | null>(null);

  useEffect(() => {
    const fetchMatchingJobs = async () => {
      if (!currentJobId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // TODO keep this for later
        // const currentJob = jobs.find((job: Job) => job.id === currentJobId);
        // const skills = currentJob?.skills || [];
        // const matchingJobs = await backendActor.get_matches(currentJobId, skills);
        const matchingJobs = dummyMatchingJobs;

        const messageToSend = `
        ${JOB_MATCHING_PROMPT}
        candidates: ${JSON.stringify(matchingJobs)}
        Current : ${JSON.stringify(currentJob)}
        `;
        // TODO do not touch this line keep it
        // const response = await geminiAgent.sendMessage(messageToSend);
  
        //TODO keep this part do not remove it
        //  const response = "```" + gmeniResponseExample + "```";
        // export interface Match {
        //   'matching_skills' : Array<string>,
        //   'user_id' : string,
        //   'score' : number,
        //   'job_id' : string,
        //   'date_updated' : bigint,
        //   'is_connected' : boolean,
        // }
        // const parsed: Array<Match> = processResponseJobs(response).extractedData;
        
        dispatch({
          type: "UPDATE_MATCHING_JOBS",
          matchingJobs,
          matches:dummyMatches,
        });
      } catch (err) {
        console.error("Error fetching matching jobs:", err);
        setError("Failed to fetch matching jobs. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchMatchingJobs();
  }, [currentJobId, dispatch]);
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }
  
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
                  {truncateTitle(job?.job_titles[0])}
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