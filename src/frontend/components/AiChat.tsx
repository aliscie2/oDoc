import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Paper, 
  CircularProgress, 
  IconButton,
  useTheme,
  useMediaQuery,
  Divider
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AiCreditsCircle from './ContractTable/AiCreditsCircle';


export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

interface AiChatProps {
  title?: string;
  initialMessages?: Message[];
  infoMessage?: string;
  loading?: boolean;
  currentAICredits: number;
  onSendMessage: (message: string) => void;
  onBuyCredit: (value: number) => void;
}

const AiChat: React.FC<AiChatProps> = ({ 
  title, 
  initialMessages = [], 
  infoMessage = "How can I help you today?",
  loading = false,
  currentAICredits,
  onSendMessage,
  onBuyCredit
}) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Update messages when initialMessages prop changes
  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    onSendMessage(inputMessage);
    setInputMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Box sx={{ 
      maxWidth: 800, 
      mx: 'auto', 
      p: isMobile ? 2 : 3,
      height: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      {title && <Typography 
        variant="h4" 
        sx={{ 
          mb: 3,
          fontWeight: 300,
          color: theme.palette.text.primary,
          textAlign: 'center'
        }}
      >
        {title}
      </Typography>}

      {/* Messages Container */}
      <Paper 
        elevation={0}
        sx={{ 
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'transparent',
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 3,
          overflow: 'hidden'
        }}
      >
        {/* Messages Area */}
        <Box sx={{ 
          flex: 1,
          overflowY: 'auto', 
          p: 3,
          minHeight: 400
        }}>
          {messages.length === 0 ? (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              height: '100%',
              color: theme.palette.text.secondary
            }}>
              <Typography variant="body1">{infoMessage}</Typography>
            </Box>
          ) : (
            <>
              {messages.map((message, index) => (
                <Box key={message.id} sx={{ mb: 3 }}>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: theme.palette.text.secondary,
                      mb: 1,
                      display: 'block',
                      textTransform: 'uppercase',
                      letterSpacing: 0.5
                    }}
                  >
                    {message.sender === 'user' ? 'You' : 'Assistant'}
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      lineHeight: 1.6,
                      color: theme.palette.text.primary
                    }}
                  >
                    {message.content}
                  </Typography>
                  {index < messages.length - 1 && (
                    <Divider sx={{ mt: 2, opacity: 0.3 }} />
                  )}
                </Box>
              ))}
              {loading && (
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  gap: 2,
                  mb: 3
                }}>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: theme.palette.text.secondary,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5
                    }}
                  >
                    Assistant
                  </Typography>
                  <CircularProgress size={16} />
                </Box>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </Box>

        {/* Input Area */}
        <Box sx={{ 
          p: 3, 
          pt: 0,
          borderTop: `1px solid ${theme.palette.divider}`
        }}>
          <Box sx={{ 
            display: 'flex', 
            gap: 2,
            alignItems: 'flex-end'
          }}>
            {/* AI Credits Circle */}
            <AiCreditsCircle
              currentAICredits={currentAICredits}
              onBuyCredit={onBuyCredit}
            />
            
            <TextField
              fullWidth
              multiline
              maxRows={4}
              placeholder="Type your message..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: theme.palette.background.paper,
                  '& fieldset': {
                    border: 'none',
                  },
                  '&:hover': {
                    bgcolor: theme.palette.action.hover,
                  },
                  '&.Mui-focused': {
                    bgcolor: theme.palette.background.paper,
                    boxShadow: `0 0 0 2px ${theme.palette.primary.main}40`,
                  }
                },
                '& .MuiInputBase-input': {
                  fontSize: '1rem',
                  lineHeight: 1.5
                }
              }}
            />
            <IconButton
              onClick={handleSendMessage}
              disabled={loading || !inputMessage.trim()}
              sx={{
                bgcolor: theme.palette.primary.main,
                color: 'white',
                width: 48,
                height: 48,
                '&:hover': {
                  bgcolor: theme.palette.primary.dark,
                },
                '&.Mui-disabled': {
                  bgcolor: theme.palette.action.disabledBackground,
                  color: theme.palette.action.disabled
                }
              }}
            >
              {loading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <SendIcon />
              )}
            </IconButton>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default AiChat;