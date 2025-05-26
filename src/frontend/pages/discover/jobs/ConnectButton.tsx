import React, { useState } from 'react';
import { Button, CircularProgress } from '@mui/material';
import { useSnackbar } from 'notistack';
import { sendEmail } from './utils/sendEmail';

interface ConnectButtonProps {
  jobId: string;
}

const ConnectButton: React.FC<ConnectButtonProps> = ({ jobId }) => {
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const handleConnect = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setConnecting(true);
    
    try {

      const options = {
        from: {
          Email: "weplutus.1@gmail.com",
          Name: "Sender Name"
        },
        to: [
          {
            Email: "alihushamsci@icloud.com",
            Name: "Recipient Name"
          }
        ],
        subject: "Test Email",
        textPart: "Hello from Mailjet!",
        htmlPart: "<h1>Hello from Mailjet!</h1><p>This is a test email.</p>"
      }

      const result = await sendEmail(options);
      
      setConnected(true);
      enqueueSnackbar('Email sent successfully!', { variant: 'success' });
    } catch (error) {
      console.log('Error sending email:', error);
      enqueueSnackbar('Failed to send email', { variant: 'error' });
    } finally {
      setConnecting(false);
    }
  };

  return (
    <Button
      variant="contained"
      color={connected ? "success" : "primary"}
      size="small"
      onClick={handleConnect}
      disabled={connecting || connected}
      sx={{ minWidth: '100px' }}
    >
      {connecting ? <CircularProgress size={24} /> : connected ? "Connected" : "Connect"}
    </Button>
  );
};

export default ConnectButton;