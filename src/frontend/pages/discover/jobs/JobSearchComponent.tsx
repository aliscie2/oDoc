import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Typography, CircularProgress, Card, CardContent, CardActions, Dialog } from '@mui/material';
import { Job, Match } from '$/declarations/backend/backend.did';
import ConnectButton from './ConnectButton';
import { useBackendContext } from '@/contexts/BackendContext';
import JobDetails from './JobDetails';
import { JOB_MATCHING_PROMPT } from './utils/jobMatchingPrompt';
import { GeminiAgent } from '@/AIAgents/GeminiAgent';
import { processResponseJobs } from './utils/processResponseJobs';
import DummyMatches from './utils/makeDummyMatches';

// Helper function to determine the category for job matching
const determineLookingForCategory = (currentJob: Job | undefined) => {
  let key = Object.keys(currentJob?.category || {})[0];
  if (key == "Job"){
    return {"Talent":null}
  } else {
    return {"Job":null}
  }
};

const JobSearchComponent: React.FC = () => {
  const { backendActor } = useBackendContext();
  const dispatch = useDispatch();
  const { currentJobId, jobs, matchingJobs } = useSelector((state: any) => state.jobState);
  const currentJob = jobs.find((job: Job) => job.id === currentJobId);
  const skills = currentJob?.skills || [];
  // State management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openDialogId, setOpenDialogId] = useState<string | null>(null);
  const [geminiAgent, setGeminiAgent] = useState<GeminiAgent | null>(null);

  // Initialize Gemini Agent once
  useEffect(() => {
    const initAgent = async () => {
      try {
        setGeminiAgent(new GeminiAgent());
      } catch (err) {
        console.error('Failed to initialize Gemini Agent:', err);
        setError('Failed to initialize AI agent');
      }
    };
    
    initAgent();
  }, []);

  const fetchNewMtches = async ()=>{
    // !currentJob && return [];
    const lookingForCategory = determineLookingForCategory(currentJob);

      // Backend handles all filtering logic
      const matchingJobs: Array<Job> = await backendActor.get_matches(
        currentJobId,
        skills,
        lookingForCategory
      );
      // Process with AI and dispatch
      return matchingJobs
  }
  // Process matches with AI and dispatch results
  const processAndDispatchMatches = async (newMatches)=>{
    {
      // if (!geminiAgent || newMatches.length === 0) {
        
      //   return;
      // }
  
      try {
        // Process with AI
        const messageToSend = `
          ${JOB_MATCHING_PROMPT}
          candidates: ${JSON.stringify(newMatches)}
          Current: ${JSON.stringify(currentJob)}
        `;
        
        const response = await geminiAgent.sendMessage(messageToSend);
        const parsed = response && processResponseJobs(response).extractedData;
        
        // Dispatch results
        if (parsed?.matches) {
          return parsed.matches.map((match: any) => ({
            job_id: match.job_id,
            score: match.score,
            missmatching_skills: match.missmatching_skills,
            date_updated: 0,
            is_connected: false,
            user_id: '',
          }));
        }
        
  
      } catch (err) {
        console.error('AI processing failed:', err);
        // Still dispatch the jobs even if AI processing fails
        dispatch({
          type: "UPDATE_MATCHING_JOBS",
          matchingJobs: newMatches,
          matches: [],
        });
      }
    }

  }

  // Fetch matches from backend
  


  useEffect(() => {
    if (!geminiAgent){
      return
    }
    (async()=>{
      setLoading(true);
      const matchingJobs = await fetchNewMtches();
      console.log("matches", {matchingJobs, currentJob})
      let matches = await processAndDispatchMatches(matchingJobs);
      // let matches = DummyMatches(matchingJobs)
      setLoading(false);
      if (matches && matches.length>0){  
        dispatch({
          type: "UPDATE_MATCHING_JOBS",
          matchingJobs,
          matches
        });
      }
    })()
  }, [currentJobId, backendActor, geminiAgent]);

  // UI Event Handlers
  const handleOpenDialog = useCallback((jobId: string) => {
    setOpenDialogId(jobId);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setOpenDialogId(null);
  }, []);

  const truncateTitle = useCallback((title: string) => {
    if (!title) return '';
    const words = title.split(' ');
    return words.slice(0, 5).join(' ') + (words.length > 5 ? '...' : '');
  }, []);


  // Loading State
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>
          {!geminiAgent ? 'Initializing AI agent...' : 'Finding matches...'}
        </Typography>
      </Box>
    );
  }

  // Error State
  if (error) {
    return (
      <Box sx={{ p: 2, color: 'error.main' }}>
        <Typography>{error}</Typography>
      </Box>
    );
  }

  // No current job selected
  if (!currentJob) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography>Please select a job to view matches.</Typography>
      </Box>
    );
  }

  // Prepare sorted matches for display
  const sortedMatches = currentJob.matches
    .map(match => ({
      job: matchingJobs.find((j: Job) => j.id === match.job_id),
      match
    }))
    .sort((a, b) => (b.match?.score || 0) - (a.match?.score || 0));
    
  console.log("sortedMatches", { sortedMatches })
  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Matching Jobs ({currentJob.matches.length})
        {!geminiAgent && (
          <Typography component="span" variant="caption" sx={{ ml: 1, color: 'warning.main' }}>
            (AI scoring pending...)
          </Typography>
        )}
      </Typography>
      
      {sortedMatches.length === 0 ? (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">
            No matching jobs found. Try adjusting your job criteria.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {sortedMatches.map(({ job, match }) => {
            if (!job) return <Card onClick={()=> dispatch({type:"DELETE_MATCH", id:match.job_id})} >Job deleted</Card>
            return (
            <Card 
              key={job.id}
              sx={{ 
                cursor: 'pointer', 
                width: '100%',
                '&:hover': { 
                  boxShadow: 2,
                  transform: 'translateY(-2px)',
                  transition: 'all 0.2s ease-in-out'
                }
              }}
              onClick={() => handleOpenDialog(job.id)}
            >
              <CardContent>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  {job?.job_titles && truncateTitle(job.job_titles[0])}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Matching Score: {match?.score ? `${match.score}%` : 'Calculating...'}
                </Typography>
                
                {job.emails?.[0] && (
                  <Typography variant="body2" color="text.secondary">
                    Contact: {job.emails[0]}
                  </Typography>
                )}
                
                {match?.missmatching_skills?.length > 0 && (
                  <Typography variant="caption" color="warning.main" sx={{ display: 'block', mt: 1 }}>
                    Missing skills: {match.missmatching_skills.slice(0, 3).join(', ')}
                    {match.missmatching_skills.length > 3 && '...'}
                  </Typography>
                )}
              </CardContent>
              
              <CardActions>
                <ConnectButton jobId={job.id} />
              </CardActions>
            </Card>
          )})}
        </Box>
      )}
      
      {/* Job Details Dialogs */}
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