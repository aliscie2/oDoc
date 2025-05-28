import React, { useState } from 'react';
import { Button, CircularProgress, Tooltip, Box } from '@mui/material';
import { useSnackbar } from 'notistack';
import sendEmail from './utils/sendEmail';
import { useDispatch, useSelector } from 'react-redux';
import DoneAllIcon from '@mui/icons-material/DoneAll';

interface ConnectButtonProps {
  jobId: string;
}

const ConnectButton: React.FC<ConnectButtonProps> = ({ jobId }) => {

  const { currentJobId, jobs, matches } = useSelector((state: any) => state.jobState);
  const currentJob = jobs?.find((job: any) => job.id === currentJobId);
  let match = currentJob.matches?.find((match: any) => match.job_id === jobId);
  console.log("match", match);
  const dispatch = useDispatch();
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const handleConnect = async (e: React.MouseEvent) => {
    e.stopPropagation();
    // setConnecting(true);
    
    dispatch({
      type: "UPDATE_MATCHES",
      matches: [{...match,is_connected:true}]
    });
    let res = await sendEmail("test","<h1>title is her</h1>",['alihushamsci@icloud.com'])
    console.log("res", res);
    // try {

    //   const options =
    //    {
    //     fromEmail: "weplutus.1@gmail.com",
    //     fromName: "Sender Name",
    //     to: [
    //       {
    //         Email: "alihushamsci@icloud.com",
    //         Name: "Recipient Name"
    //       }
    //     ],
    //     subject: "Test Email",
    //     textPart: "Hello from Mailjet!",
    //     htmlPart: "<h1>Hello from Mailjet!</h1><p>This is a test email.</p>"
    //   };

    //   const result = await sendEmail(options);
      
    //   setConnected(true);
    //   enqueueSnackbar('Email sent successfully!', { variant: 'success' });
    // } catch (error) {
    //   console.log('Error sending email:', error);
    //   enqueueSnackbar('Failed to send email', { variant: 'error' });
    // } finally {
    //   setConnecting(false);
    // }
  };

  return (
    <>
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
    </>
  );
};

export default ConnectButton;