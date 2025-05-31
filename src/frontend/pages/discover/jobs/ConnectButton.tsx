import React, { useState } from 'react';
import { Button, CircularProgress, Tooltip, Box } from '@mui/material';
import { useSnackbar } from 'notistack';
import sendEmail from './utils/sendEmail';
import { useDispatch, useSelector } from 'react-redux';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { useBackendContext } from '@/contexts/BackendContext';
import { Calendar, Job, Match } from '$/declarations/backend/backend.did';

interface ConnectButtonProps {
  jobId: string;
}

const ConnectButton: React.FC<ConnectButtonProps> = ({ jobId }) => {
  
  const { calendar } = useSelector((state: any) => state.calendarState);
  const { backendActor } = useBackendContext();


  const { currentJobId, jobs, matches } = useSelector((state: any) => state.jobState);
  const currentJob: Job = jobs?.find((job: any) => job.id === currentJobId);
  const matchJob: Job = jobs?.find((job: any) => job.id === jobId);
  let match: Match = currentJob.matches?.find((match: any) => match.job_id === jobId);

  const dispatch = useDispatch();
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  let bookEvent = `${window.location.origin}/calendar?id=${calendar.id}&jobid=${currentJob.id}`;
  let category = Object.keys(currentJob.category)[0];
  let message = category == "Job" ? 'We find a new job opertunity for you.' : 'We found a new talent that may meets your requrments.';

  const handleConnect = async (e: React.MouseEvent) => {
    setConnecting(true);
    e.stopPropagation();
    if (match?.score <= 6){
      if (!window.confirm("Are you sure you want to connect? This will send an email to them despite the matching score is not that good.")){
        setConnecting(false);
        return;
      }
    };

    let res: [Calendar] = await backendActor.get_calendar_by_authoer(matchJob?.user_id);
    let calendar = res[0];
    let emails = calendar.googleIds;
    emails.push(...currentJob.emails);
    
    for (let email of emails) {
      let jobData = {
        job: {...currentJob,category},
        match:{...match, score: match?.score * 10 },
        bookEvent,
      }
      let isEmailSent = await sendEmail("oDoc AI job matcher",message ,[email],jobData,"odoc_job_match")
      
      if (isEmailSent== true){
        setConnected(true);
        dispatch({
          type: "UPDATE_MATCHES",
          matches: [{...match,is_connected:true}]
        });    
        
        enqueueSnackbar("Email sent.", {
          variant: 'success',
        })
        break;
      }
    }
    // !connected && enqueueSnackbar("Email not sent. Try to contact them manilly by viaing thier contacts in the job post, or thier profile send them friend request.", {
    //   variant:'error',
    // })
    setConnecting(false);
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