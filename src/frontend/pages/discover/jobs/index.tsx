import React, { useState, useCallback, useEffect } from 'react';
import { Box } from '@mui/material';
import { GeminiAgent } from '@/AIAgents/GeminiAgent';
import AiChat from '@/components/AiChat';
import { v4 as uuidv4 } from 'uuid';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const JobsPage: React.FC = () => {
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
      
      const response = await geminiAgent.sendMessage(content);
      const aiMessage: Message = {
        id: uuidv4(),
        content: response,
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