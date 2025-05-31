import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Card, 
  CardContent, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
  LinearProgress,
  useTheme,
  useMediaQuery,
  IconButton,
  Divider
} from '@mui/material';
import { Visibility, Star, Email } from '@mui/icons-material';
import { Job } from '$/declarations/backend/backend.did';
import ConnectButton from './ConnectButton';
import { useBackendContext } from '@/contexts/BackendContext';
import JobDetails from './JobDetails';
import { JOB_MATCHING_PROMPT } from './utils/jobMatchingPrompt';
import { processResponseJobs } from './utils/processResponseJobs';
import { convertColumnTypes } from 'ag-grid-community/dist/types/src/columns/columnUtils';


// Helper function to determine the category for job matching
const determineLookingForCategory = (currentJob: Job | undefined) => {
  let key = Object.keys(currentJob?.category || {})[0];
  if (key == "Job") {
    return { "Talent": null }
  } else {
    return { "Job": null }
  }
};

const JobSearchComponent: React.FC = () => {
  const { backendActor } = useBackendContext();
  const dispatch = useDispatch();
  const { currentJobId, jobs, matchingJobs } = useSelector((state: any) => state.jobState);
  const currentJob = jobs.find((job: Job) => job.id === currentJobId);
  const skills = currentJob?.skills || [];
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // State management
  const [loading, setLoading] = useState(false);
  const [openDialogId, setOpenDialogId] = useState<string | null>(null);
  const { geminiAgent } = useSelector((state: any) => state.AIState);
  console.log({geminiAgent})
 

  const fetchNewMatches = async () => {
    const lookingForCategory = determineLookingForCategory(currentJob);
    const matchingJobs: Array<Job> = await backendActor.get_matches(
      currentJobId,
      skills,
      lookingForCategory
    );
    return matchingJobs;
  }

  // Process matches with AI and dispatch results
  const processAndDispatchMatches = async (newMatches) => {
    try {
      const messageToSend = `
        ${JOB_MATCHING_PROMPT}
        candidates: ${JSON.stringify(newMatches)}
        Current: ${JSON.stringify(currentJob)}
      `;
      
      const response = await geminiAgent.sendMessage(messageToSend);
      const parsed = response && processResponseJobs(response).extractedData;
      
      if (parsed?.matches) {
        return parsed.matches.map((match: any) => ({
          job_id: match.job_id,
          score: match.score,
          missmatching_skills: match.missmatching_skills,
          date_updated: 0,
          is_connected: false,
          user_id: '',
          cover_letter:match.cover_letter,
        }));
      }
    } catch (err) {
      console.error('AI processing failed:', err);
      dispatch({
        type: "UPDATE_MATCHING_JOBS",
        matchingJobs: newMatches,
        matches: [],
      });
    }
  }

  useEffect(() => {
    if (!geminiAgent) {
      return;
    }
    (async () => {
      setLoading(true);
      const matchingJobs = await fetchNewMatches();
      if (matchingJobs.length > 0) {
        let matches = await processAndDispatchMatches(matchingJobs);
        
        if (matches && matches.length > 0) {
          dispatch({
            type: "UPDATE_MATCHING_JOBS",
            matchingJobs,
            matches
          });
        }
      }
      setLoading(false);
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

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  // Loading State
  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 200,
        gap: 2
      }}>
        <CircularProgress size={40} />
        <Typography color="text.secondary">
          {!geminiAgent ? 'Initializing AI agent...' : 'Finding matches...'}
        </Typography>
      </Box>
    );
  }


  // No current job selected
  if (!currentJob) {
    return (
      <Box sx={{ 
        p: 4, 
        textAlign: 'center',
        color: 'text.secondary',
        bgcolor: theme.palette.background.paper,
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`
      }}>
        <Typography variant="h6">Please select a job to view matches</Typography>
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

  return (
    <Box sx={{ mt: 4 }}>
      {/* Header */}
      <Box sx={{ 
        mb: 4, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Typography variant="h4" sx={{ fontWeight: 300, color: theme.palette.text.primary }}>
          Job Matches
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip 
            label={`${currentJob.matches.length} matches`} 
            color="primary" 
            variant="outlined"
          />
          {!geminiAgent && (
            <Chip 
              label="AI scoring pending..." 
              color="warning" 
              size="small"
              variant="outlined"
            />
          )}
        </Box>
      </Box>

      {sortedMatches.length === 0 ? (
        <Box sx={{ 
          p: 6, 
          textAlign: 'center',
          bgcolor: theme.palette.background.paper,
          borderRadius: 3,
          border: `1px solid ${theme.palette.divider}`
        }}>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            No matching jobs found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your job criteria or check back later
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {sortedMatches.map(({ job, match }) => {
            if (!job) {
              return (
                <Card 
                  key={match.job_id}
                  onClick={() => dispatch({ type: "DELETE_MATCH", id: match.job_id })}
                  sx={{ 
                    cursor: 'pointer',
                    bgcolor: theme.palette.error.light + '20',
                    border: `1px solid ${theme.palette.error.main}`,
                    borderRadius: 2
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <Typography color="error">Job deleted - Click to remove</Typography>
                  </CardContent>
                </Card>
              );
            }

            return (
              <Card 
                key={job.id}
                sx={{ 
                  cursor: 'pointer',
                  borderRadius: 3,
                  border: `1px solid ${theme.palette.divider}`,
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': { 
                    boxShadow: theme.shadows[8],
                    transform: 'translateY(-4px)',
                    borderColor: theme.palette.primary.main
                  }
                }}
                onClick={() => handleOpenDialog(job.id)}
              >
                <CardContent sx={{ p: 3 }}>
                  {/* Header with score */}
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start',
                    mb: 2
                  }}>
                    <Typography variant="h6" sx={{ 
                      flex: 1, 
                      fontWeight: 500,
                      mr: 2
                    }}>
                      {job?.job_titles && truncateTitle(job.job_titles[0])}
                    </Typography>
                    
                    {match?.score ? (
                      <Chip 
                        label={`${match.score*10}%`}
                        color={getScoreColor(match.score*10)}
                        size="small"
                        icon={<Star fontSize="small" />}
                      />
                    ) : (
                      <Chip 
                        label="Calculating..."
                        color="default"
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>

                  {/* Score bar */}
                  {match?.score && (
                    <Box sx={{ mb: 2 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={match.score*10} 
                        color={getScoreColor(match.score*10)}
                        sx={{ 
                          height: 6, 
                          borderRadius: 3,
                          bgcolor: theme.palette.grey[200]
                        }}
                      />
                    </Box>
                  )}

                  {/* Contact info */}
                  {job.emails?.[0] && (
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1, 
                      mb: 2,
                      color: theme.palette.text.secondary
                    }}>
                      <Email fontSize="small" />
                      <Typography variant="body2">
                        {job.emails[0]}
                      </Typography>
                    </Box>
                  )}
                  
                  {/* Missing skills */}
                  {match?.missmatching_skills?.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                        Missing skills:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {match.missmatching_skills.slice(0, 3).map((skill, index) => (
                          <Chip 
                            key={index}
                            label={skill} 
                            size="small" 
                            color="warning"
                            variant="outlined"
                          />
                        ))}
                        {match.missmatching_skills.length > 3 && (
                          <Chip 
                            label={`+${match.missmatching_skills.length - 3} more`}
                            size="small"
                            color="warning"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </Box>
                  )}
                </CardContent>

                <Divider />
                
                <Box sx={{ 
                  p: 2, 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <ConnectButton jobId={job.id} />
                  <IconButton 
                    size="small"
                    sx={{ color: theme.palette.text.secondary }}
                  >
                    <Visibility fontSize="small" />
                  </IconButton>
                </Box>
              </Card>
            );
          })}
        </Box>
      )}
      
      {/* Job Details Dialog */}
      {matchingJobs.map((job: Job) => (
        <Dialog
          key={job.id}
          open={openDialogId === job.id}
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              maxHeight: '80vh'
            }
          }}
        >
          <DialogTitle sx={{ 
            borderBottom: `1px solid ${theme.palette.divider}`,
            pb: 2
          }}>
            <Typography variant="h6" sx={{ fontWeight: 500 }}>
              Job Details
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ p: 0 }}>
            <JobDetails job={job} />
          </DialogContent>
          <DialogActions sx={{ 
            p: 3, 
            borderTop: `1px solid ${theme.palette.divider}`
          }}>
            <Button 
              onClick={handleCloseDialog}
              variant="contained"
              sx={{ borderRadius: 2 }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      ))}
    </Box>
  );
};

export default JobSearchComponent;