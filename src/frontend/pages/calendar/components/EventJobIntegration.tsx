import { useEffect } from "react";
import { Typography } from "@mui/material";
import { useJobIntegration } from "../hooks/useJobIntegration";

interface Job {
  job_titles?: string[];
  proficiency_level?: string;
  skills?: string[];
  description?: string;
  contacts?: string[];
  emails?: string[];
}

interface EventData {
  title: string;
  description: string;
  recurrence: {
    frequency: string;
    interval: number;
    count: null | number;
    until: null | string;
  };
  attendees: string[];
}

interface EventJobIntegrationProps {
  isEditMode: boolean;
  onJobDataLoaded: (job: Job | null) => void;
  onEventDataGenerated: (eventData: Partial<EventData>) => void;
}

/**
 * EventJobIntegration Component
 * Fetches job data from URL parameter and auto-populates event form
 */
const EventJobIntegration: React.FC<EventJobIntegrationProps> = ({
  isEditMode,
  onJobDataLoaded,
  onEventDataGenerated,
}) => {
  const {
    job,
    isLoadingJob,
    jobError,
    fetchJobData,
    generateEventDataFromJob,
  } = useJobIntegration();

  // Fetch job data on mount
  useEffect(() => {
    fetchJobData();
  }, []);

  // Notify parent and generate event data when job is loaded
  useEffect(() => {
    onJobDataLoaded(job);

    // Generate event data from job if we have job data and we're creating a new event
    if (job && !isEditMode) {
      const jobEventData = generateEventDataFromJob(job);
      onEventDataGenerated(jobEventData);
    }
  }, [job, isEditMode, onJobDataLoaded, onEventDataGenerated]);

  // Display loading state
  if (isLoadingJob) {
    return (
      <Typography variant="body2" sx={{ mb: 2, fontStyle: "italic" }}>
        Loading job information...
      </Typography>
    );
  }

  // Display error state
  if (jobError) {
    return (
      <Typography variant="body2" color="error" sx={{ mb: 2 }}>
        {jobError}
      </Typography>
    );
  }

  // No UI needed when job is loaded successfully
  return null;
};

export default EventJobIntegration;
