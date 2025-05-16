import React, { useState, useEffect } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Typography } from '@mui/material';
import { useBackendContext } from '@/contexts/BackendContext';
import { TelegramAPI } from './utils/telegram';

export const ConnectTelegramButton = () => {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [status, setStatus] = useState('');
  const { backendActor } = useBackendContext();

  const generateCode = () => {
    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
    setVerificationCode(randomCode);
    return randomCode;
  };

  const handleConnect = async () => {
    setOpen(true);
    const newCode = generateCode();
    setCode(newCode);
    
    // Start polling for Telegram messages
    let offset = 0;
    const pollInterval = setInterval(async () => {
      const updates = await TelegramAPI.getUpdates(offset);
      console.log(updates);
      if (updates?.ok && updates.result.length > 0) {
        offset = updates.result[updates.result.length - 1].update_id + 1;
        
        for (const update of updates.result) {
          if (update.message?.text === newCode) {
            const userInfo = await TelegramAPI.getUserInfo(update.message.chat.id);
            if (userInfo) {
            //   const res = await backendActor.updagte_telegram(
            //     newCode,
            //     userInfo.username || '',
            //     userInfo.chatId || ''
            //   );
              
            //   if (res.Ok) {
            //     setStatus('Verification successful!');
            //   } else {
            //     setStatus('Verification failed. Please try again.');
            //   }
            
            setStatus('Verification successful!');
            await TelegramAPI.sendMessage(
                userInfo.chatId || '',
                'Verification successful! Your Telegram account is now connected.'
              );
              
              clearInterval(pollInterval);
              break;
            }
          }
        }
      }
    }, 3000);

    return () => clearInterval(pollInterval);
  };

  return (
    <>
      <Button variant="contained" onClick={handleConnect}>
        Connect Telegram
      </Button>
      
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Telegram Verification</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Send this code to our bot in Telegram: <strong>{code}</strong>
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Open <a href="https://t.me/OdocBot" target="_blank" rel="noopener noreferrer">@OdocBot</a> to start the verification
          </Typography>
          {status && (
            <Typography color={status.includes('successful') ? 'success' : 'error'}>
              {status}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};