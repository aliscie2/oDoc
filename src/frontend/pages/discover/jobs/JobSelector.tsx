import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Job } from '$/declarations/backend/backend.did';
import { Box, Typography, Select, MenuItem, Paper, Divider, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';
import JobDetails from './JobDetails';
import { useBackendContext } from '@/contexts/BackendContext';

const JobSelector: React.FC = () => {
    const dispatch = useDispatch();
    const { currentJobId, jobs } = useSelector((state: any) => state.jobState);
    const [expanded, setExpanded] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    
    const currentJob = jobs.find((job: Job) => job.id === currentJobId);

    const handleJobSelect = (jobId: string | null) => {
        if (jobId === null) {
            dispatch({
                type: "SET_CURRENT_JOB",
                job: null
            });
        } else {
            const job = jobs.find((j: Job) => j.id === jobId);
            dispatch({
                type: "SET_CURRENT_JOB",
                job: job
            });
        }
        setExpanded(false);
    };

    const handleShowDetails = (job: Job, event: React.MouseEvent) => {
        event.stopPropagation();
        setSelectedJob(job);
        setDialogOpen(true);
    };

    const truncateDescription = (desc: string) => {
        const words = desc.split(' ');
        return words.length > 5 ? words.slice(0, 5).join(' ') + '...' : desc;
    };
    const { backendActor } = useBackendContext();

    return (
        <Box sx={{ width: '100%', maxWidth: 800, margin: '0 auto' }}>
            <Paper elevation={3} sx={{ padding: 2 }}>
                <Select
                    value={currentJobId || ''}
                    displayEmpty
                    fullWidth
                    renderValue={(selected) => (
                        <Typography>
                            {currentJob ? `Selected: ${currentJob.category ? Object.keys(currentJob.category)[0] || '' : ''} - ${currentJob.description ? truncateDescription(currentJob.description) : 'Untitled Job'}` : 'Select a Job'}
                        </Typography>
                    )}
                    onClick={() => setExpanded(!expanded)}
                    open={expanded}
                >
                    <MenuItem 
                        value=""
                        onClick={() => handleJobSelect(null)}
                        disabled={jobs.length >= 4}
                        title={jobs.length >= 4 ? "You've reached the maximum number of posts (4)" : ""}
                    >
                        Create New Job Post
                        {jobs.length >= 4 && (
                            <Typography variant="caption" color="textSecondary" component="div">
                                (Maximum reached)
                            </Typography>
                        )}
                    </MenuItem>
                    {jobs.map((job: Job) => (
                        <MenuItem 
                            key={job.id} 
                            value={job.id}
                            onClick={() => handleJobSelect(job.id)}
                            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                        >
                            <Box sx={{ flex: 1 }}>
                                {job.category ? Object.keys(job.category)[0] || '' : ''} - {job.description ? truncateDescription(job.description) : 'Untitled Job'}
                            </Box>
                            <Button
                                color='warning'
                                size="small"
                                variant="outlined"
                                onClick={(event) => handleShowDetails(job, event)}
                                sx={{ ml: 2, minWidth: 'auto' }}
                            >
                                Show Details
                            </Button>
                            <Button 
                                color='error' 
                                size="small" 
                                variant="outlined" 
                                disabled={currentJob?.skills.lenght==0 && jobs.length === 1}
                                onClick={() => {
                                    if (window.confirm('Are you sure you want to delete this job?')) {
                                        backendActor?.delete_job(job.id);
                                        dispatch({
                                            type: "DELETE_JOB",
                                            id:job.id
                                        });
                                    }
                                }}
                                sx={{ ml: 2, minWidth: 'auto' }}
                            >
                                Delete
                            </Button>
                        </MenuItem>
                    ))}
                </Select>
            </Paper>

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Job Details</DialogTitle>
                <DialogContent dividers>
                    {selectedJob && <JobDetails job={selectedJob} />}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)} variant="contained">Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default JobSelector;