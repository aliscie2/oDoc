import React, { useState } from 'react';
import { Button, CircularProgress, Box, Typography, Card, CardContent, Chip, Link } from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';

// Define the job interface
interface Job {
  title: string;
  description: string;
  matchingScore: number;
  applyLink: string;
  source: string;
  potentialCoverLetter: string;
  missingSkills: string[];
}

interface JobSearchProps {
  modelProvider?: 'anthropic' | 'deepseek';
}

const JobSearch: React.FC<JobSearchProps> = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFindJobs = () => {
    setLoading(true);
    setError(null);
    
    // Simulate API call with timeout
    setTimeout(() => {
      const dummyJobs: Job[] = [
        {
          title: 'Frontend Developer',
          description: 'Develop user interfaces using React and Material-UI.',
          matchingScore: 85,
          applyLink: '',
          source: 'LinkedIn',
          potentialCoverLetter: '',
          missingSkills: ['TypeScript', 'GraphQL']
        },
        {
          title: 'Full Stack Engineer',
          description: 'Build end-to-end web applications with React and Node.js.',
          matchingScore: 75,
          applyLink: '',
          source: 'Indeed',
          potentialCoverLetter: '',
          missingSkills: ['AWS', 'Docker']
        },
        {
          title: 'UI/UX Designer',
          description: 'Create beautiful and functional user interfaces.',
          matchingScore: 65,
          applyLink: '',
          source: 'Glassdoor',
          potentialCoverLetter: '',
          missingSkills: ['Figma', 'User Research']
        }
      ];
      
      setJobs(dummyJobs);
      setLoading(false);
    }, 1000);
  };
  };

  const renderJobList = () => {
    if (jobs.length === 0) {
      return null;
    }

    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="h5" gutterBottom>Matching Jobs</Typography>
        {jobs.map((job, index) => (
          <Card key={index} sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6">{job.title}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Source: {job.source} | Matching Score: {job.matchingScore}%
              </Typography>
              <Typography variant="body1" paragraph>
                {job.description}
              </Typography>
              
              {job.missingSkills.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2">Missing Skills:</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                    {job.missingSkills.map((skill, idx) => (
                      <Chip key={idx} label={skill} size="small" />
                    ))}
                  </Box>
                </Box>
              )}
              
              {job.applyLink ? (
                <Link href={job.applyLink} target="_blank" rel="noopener">
                  <Button variant="outlined" size="small">Apply Now</Button>
                </Link>
              ) : (
                <Typography variant="caption" color="text.secondary">
                  No direct application link available. Visit {job.source} to apply.
                </Typography>
              )}
            </CardContent>
          </Card>
        ))}
      </Box>
    );
  };

  return (
    <Box>
      <Button 
        variant="contained" 
        color="primary" 
        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <WorkIcon />}
        onClick={handleFindJobs}
        size="large"
        disabled={loading}
      >
        {loading ? 'Searching...' : 'Find Jobs'}
      </Button>
      
      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}
      
      {renderJobList()}
    </Box>
  );
};

export default JobSearch;