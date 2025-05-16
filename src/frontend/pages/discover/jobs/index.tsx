import React, { useState, useCallback, useEffect } from 'react';
import { Box } from '@mui/material';
import { GeminiAgent } from '@/AIAgents/GeminiAgent';
import AiChat from '@/components/AiChat';
import { v4 as uuidv4 } from 'uuid';
import { processResponseJobs } from './utils/processResponseJobs';
import { useDispatch, useSelector } from 'react-redux';
import { Job,JobUpdate } from '$/declarations/backend/backend.did';
import { BUILD_JOB_PROMPT } from './buildProfilePrompt';
import { gmeniResponseExample } from './gmeniResponseExample';
import JobSelector from '@/pages/discover/jobs/JobSelector';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface ProcessedJobResponse {
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

  const { currentJobId, jobs } = useSelector((state: any) => state.jobState);
  let current_job = jobs.find((job: Job) => job.id === currentJobId);

  const dispatch = useDispatch();
  const [showJobSearch, setShowJobSearch] = useState(false);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [geminiAgent, setGeminiAgent] = useState<GeminiAgent | null>(null);

  useEffect(() => {
    // Initialize GeminiAgent when component mounts
    setGeminiAgent(new GeminiAgent());
  }, []);

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
      
      const messageToSend = `
      ${BUILD_JOB_PROMPT}
      User Input: ${content}
      Current Job Data: ${JSON.stringify(current_job)} // !IMPORTANT if there are missing fields ask user please provide more infor about your {fieldNmae}
      `;
      
      // const response = await geminiAgent.sendMessage(messageToSend);

      const  response= "```"+gmeniResponseExample+"```";
      const parsed: ProcessedJobResponse = processResponseJobs(response).extractedData;
      console.log({response,parsed})
      dispatch({
        type: "UPDATE_FIELDS",
        updates:parsed.updates,
        category:parsed.category, // parsed.category =="Job"|"Talent"
        
      });


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
  }, [geminiAgent]);

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
    </Box>
  );
};

export default JobsPage;