import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import { GeminiAgent } from '@/AIAgents/GeminiAgent';
import AiChat from '@/components/AiChat';
import { v4 as uuidv4 } from 'uuid';
import { processResponseJobs } from './utils/processResponseJobs';
import { useDispatch, useSelector } from 'react-redux';
import { Job, JobUpdate } from '$/declarations/backend/backend.did';
import { BUILD_JOB_PROMPT } from './buildProfilePrompt';
import JobSelector from '@/pages/discover/jobs/JobSelector';
import JobSearchComponent from './JobSearchComponent';
import SaveChanges from './saveChanges';
import { useBackendContext } from '@/contexts/BackendContext';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
};

interface ProcessedJobResponse {
  done: boolean;
  feedback: string;
  actions: Array<
    | { type: "SET_CURRENT_JOB"; job: Job }
    | { type: "UPDATE_JOB"; update: JobUpdate }
    | { type: "SET_JOBS"; jobs: Job[] }
    | { type: "ADD_JOB"; job: Job }
    | { type: "DELETE_JOB"; id: string }
  >;
}

const JobsPage: React.FC = () => {

  const { backendActor } = useBackendContext();
  const { jobChanges, isChanged, currentJobId, jobs } = useSelector((state: any) => state.jobState);
  const currentJobRef = useRef<Job | undefined>(undefined);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [geminiAgent, setGeminiAgent] = useState<GeminiAgent | null>(null);
  const [isProfileDone, setIsProfileDone] = useState<boolean>(false);

  useEffect(() => {
    setGeminiAgent(new GeminiAgent());
  }, []);

  useEffect(() => {
    currentJobRef.current = jobs.find((job: Job) => job.id === currentJobId);
  }, [currentJobId, jobs]);


  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res: { jobs: Job[]; matching_jobs: Job[] } = await backendActor.get_my_jobs();
        dispatch({ type: "INIT_JOBS", jobs: res.jobs, matchingJobs: res.matching_jobs, });
      } catch (error) {
        console.error("Error fetching jobs:", error);
      }
    };
    
    fetchJobs();
  }, [dispatch]);

  const handleSendMessage = useCallback(async (content: string) => {
    if (!geminiAgent) return;
    
    setLoading(true);
    try {
      const newMessage: Message = {
        id: uuidv4(),
        content,
        sender: 'user',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, newMessage]);
      
     
      console.log("currentJobRef", currentJobRef.current);
      const messageToSend = `
      ${BUILD_JOB_PROMPT}
      User Input: ${content}
      Current Job Data: ${JSON.stringify(currentJobRef.current)}
      `;

      const response = await geminiAgent.sendMessage(messageToSend);

      // const response = "```" + gmeniResponseExample + "```";
      const parsed: ProcessedJobResponse = processResponseJobs(response).extractedData;
      
       // Validate before processing
       if (!currentJobId) {
        
        if (parsed.category =="Talent"&&jobs.some((j: Job) => Object.keys(j.category)[0] === "Talent")) {    
          alert("You can create only one talent profile");
          return;
        } else if (jobs.filter((j: Job) => Object.keys(j.category)[0] === "Job").length >= 3) {
          alert("You can have max 3 job posts");
          return;
        }
      }

      
      dispatch({
        type: "UPDATE_FIELDS",
        updates: parsed.updates,
        category: parsed.category,
        required_match_score:parsed.required_match_score
      });

      if (parsed.done) {
        setIsProfileDone(true);
      }

      const aiMessage: Message = {
        id: uuidv4(),
        content: parsed.feedback,
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  }, [geminiAgent, jobs, currentJobId, dispatch]);

  return (
    <Box className="jobs-page-container" sx={{ padding: 3, maxWidth: '1200px', margin: '0 auto' }}>
      <JobSelector />
      <AiChat
        title="Job Application Assistant"
        initialMessages={messages}
        infoMessage="Share your resume details or tell me about your skills, education, and experience."
        loading={loading}
        onSendMessage={handleSendMessage}
      />
      {/* {isProfileDone && <JobSearchComponent />} */}
      <JobSearchComponent />
      {isChanged && <SaveChanges />}
    </Box>
  );
};

export default JobsPage;