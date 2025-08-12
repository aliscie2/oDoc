import React from 'react';
import { Job } from '$/declarations/backend/backend.did';
import { Box, LinearProgress, Tooltip, Typography, useTheme } from '@mui/material';

interface JobCompletionProgressProps {
  job: Job | null;
  className?: string;
}

const JobCompletionProgress: React.FC<JobCompletionProgressProps> = ({ job, className }) => {
  const theme = useTheme();

  if (!job) return null;

  const calculateProgress = () => {
    let totalWeight = 0;
    let completedWeight = 0;
    const missingFields: string[] = [];

    // Critical fields (high weight)
    const criticalFields = [
      { field: 'description', weight: 25, label: 'Job Description' },
      { field: 'job_titles', weight: 25, label: 'Job Title' }
    ];

    // Important fields (medium weight)
    const importantFields = [
      { field: 'skills', weight: 15, label: 'Skills' },
      { field: 'category', weight: 10, label: 'Category' },
      { field: 'experience', weight: 8, label: 'Experience Requirements' },
      { field: 'education', weight: 7, label: 'Education Requirements' }
    ];

    // Optional fields (low weight)
    const optionalFields = [
      { field: 'contacts', weight: 3, label: 'Contact Information' },
      { field: 'emails', weight: 3, label: 'Email Contacts' },
      { field: 'links', weight: 2, label: 'Related Links' },
      { field: 'certifications', weight: 2, label: 'Required Certifications' }
    ];

    const allFields = [...criticalFields, ...importantFields, ...optionalFields];

    allFields.forEach(({ field, weight, label }) => {
      totalWeight += weight;
      const value = job[field as keyof Job];
      
      let completionRatio = 0;
      let isComplete = false;

      if (field === 'skills' && Array.isArray(value)) {
        // Special handling for skills - progressive completion
        const skillsCount = value.length;
        if (skillsCount === 0) {
          completionRatio = 0;
        } else if (skillsCount <= 3) {
          completionRatio = skillsCount / 4; // 1 skill = 25%, 2 skills = 50%, 3 skills = 75%
        } else {
          completionRatio = 1; // 4+ skills = 100%
        }
        isComplete = skillsCount > 0;
      } else if (field === 'description' && typeof value === 'string') {
        // Special handling for description - quality-based completion
        const wordCount = value.trim().split(/\s+/).filter(word => word.length > 0).length;
        if (wordCount === 0) {
          completionRatio = 0;
        } else if (wordCount < 10) {
          completionRatio = 0.3; // Very short description = 30%
        } else if (wordCount < 25) {
          completionRatio = 0.6; // Short description = 60%
        } else if (wordCount < 50) {
          completionRatio = 0.8; // Good description = 80%
        } else {
          completionRatio = 1; // Detailed description = 100%
        }
        isComplete = wordCount > 0;
      } else if (field === 'job_titles' && Array.isArray(value)) {
        // Job titles should have meaningful content
        const hasGoodTitle = value.some(title => title.trim().length >= 3);
        completionRatio = hasGoodTitle ? 1 : 0;
        isComplete = hasGoodTitle;
      } else if (Array.isArray(value)) {
        isComplete = value.length > 0;
        completionRatio = isComplete ? 1 : 0;
      } else if (typeof value === 'object' && value !== null) {
        isComplete = Object.keys(value).length > 0;
        completionRatio = isComplete ? 1 : 0;
      } else if (typeof value === 'string') {
        isComplete = value.trim().length > 0;
        completionRatio = isComplete ? 1 : 0;
      } else {
        isComplete = value !== null && value !== undefined;
        completionRatio = isComplete ? 1 : 0;
      }

      completedWeight += weight * completionRatio;
      
      if (!isComplete) {
        missingFields.push(label);
      }
    });

    const progressPercentage = totalWeight > 0 ? (completedWeight / totalWeight) * 100 : 0;
    
    return {
      percentage: Math.min(100, Math.max(0, progressPercentage)),
      missingFields,
      skillsCount: job.skills?.length || 0
    };
  };

  const { percentage, missingFields, skillsCount } = calculateProgress();

  const getProgressColor = () => {
    if (percentage >= 80) return theme.palette.success.main;
    if (percentage >= 60) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const getTooltipContent = () => {
    const lines = [`Completion: ${Math.round(percentage)}%`];
    
    // Check description quality
    const description = job?.description || '';
    const wordCount = description.trim().split(/\s+/).filter(word => word.length > 0).length;
    if (wordCount > 0 && wordCount < 25) {
      lines.push(`📝 Description could be more detailed (${wordCount} words)`);
    }
    
    // Check skills
    if (skillsCount <= 3 && skillsCount > 0) {
      lines.push(`💡 Consider adding more skills (currently ${skillsCount})`);
    }
    
    if (missingFields.length > 0) {
      lines.push('', 'Missing fields:');
      missingFields.forEach(field => lines.push(`• ${field}`));
    }
    
    return lines.join('\n');
  };

  return (
    <Tooltip 
      title={
        <Typography 
          component="div" 
          sx={{ whiteSpace: 'pre-line', fontSize: '0.75rem' }}
        >
          {getTooltipContent()}
        </Typography>
      }
      arrow
      placement="top"
    >
      <Box className={className} sx={{ width: '100%', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
          <Typography variant="caption" color="textSecondary" sx={{ mr: 1 }}>
            Profile Completion
          </Typography>
          <Typography variant="caption" sx={{ color: getProgressColor(), fontWeight: 500 }}>
            {Math.round(percentage)}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={percentage}
          sx={{
            height: 6,
            borderRadius: 3,
            backgroundColor: theme.palette.grey[200],
            '& .MuiLinearProgress-bar': {
              backgroundColor: getProgressColor(),
              borderRadius: 3,
            },
          }}
        />
      </Box>
    </Tooltip>
  );
};

export default JobCompletionProgress;