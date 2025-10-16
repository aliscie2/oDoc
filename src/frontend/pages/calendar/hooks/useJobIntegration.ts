// Job Integration Hook
import { useState } from "react";
import { backendActor } from "@/utils/backendUtils";

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

export const useJobIntegration = () => {
  const [job, setJob] = useState<Job | null>(null);
  const [isLoadingJob, setIsLoadingJob] = useState(false);
  const [jobError, setJobError] = useState<string | null>(null);

  /**
   * Helper function to safely extract jobId from URL
   */
  const getJobIdFromUrl = (): string | null => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const jobIdFromParam = urlParams.get("jobId");

      if (jobIdFromParam) {
        return jobIdFromParam;
      }

      // Fallback: parse manually if URLSearchParams doesn't work
      const searchString = window.location.search;
      const jobIdMatch = searchString.match(/[?&]jobId=([^&]*)/);
      return jobIdMatch ? decodeURIComponent(jobIdMatch[1]) : null;
    } catch (error) {
      console.warn("Error parsing jobId from URL:", error);
      return null;
    }
  };

  /**
   * Generate event title and description from job data
   */
  const generateEventDataFromJob = (
    job: Job,
  ): { title: string; description: string } => {
    const jobTitles = job.job_titles || [];
    const jobTitlesStr =
      jobTitles.length > 0 ? jobTitles.join(", ") : "Job Opportunity";

    const title = `Interview: ${jobTitlesStr}`;

    let description = `Job Interview Details:\n\n`;
    description += `Position: ${jobTitlesStr}\n`;
    description += `Proficiency Level: ${job.proficiency_level || "Not specified"}\n`;

    const skills = job.skills || [];
    if (skills.length > 0) {
      description += `Required Skills: ${skills.join(", ")}\n`;
    }

    if (job.description) {
      description += `\nJob Description:\n${job.description}\n`;
    }

    const contacts = job.contacts || [];
    if (contacts.length > 0) {
      description += `\nContact Information: ${contacts.join(", ")}\n`;
    }

    const emails = job.emails || [];
    if (emails.length > 0) {
      description += `Email: ${emails.join(", ")}\n`;
    }

    return { title, description };
  };

  /**
   * Fetch job data when component mounts or jobId changes
   */
  const fetchJobData = async () => {
    const jobId = getJobIdFromUrl();

    if (!jobId || !backendActor) {
      return;
    }

    setIsLoadingJob(true);
    setJobError(null);

    try {
      const jobData = await backendActor.get_job(jobId);

      if (jobData && jobData.length > 0) {
        setJob(jobData[0] || null);
      } else {
        setJobError("Job not found");
      }
    } catch (error) {
      console.error("Error fetching job data:", error);
      setJobError("Failed to fetch job data");
    } finally {
      setIsLoadingJob(false);
    }
  };

  return {
    job,
    isLoadingJob,
    jobError,
    fetchJobData,
    generateEventDataFromJob,
  };
};
