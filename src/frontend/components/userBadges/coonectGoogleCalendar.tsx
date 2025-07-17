import React, { useState, useEffect } from "react";
import {
 Dialog,
 DialogContent,
 Box,
 Typography,
 Button,
 IconButton,
 Card,
 List,
 ListItem,
 ListItemIcon,
 ListItemText,
 Divider,
} from "@mui/material";
import {
 Google as GoogleIcon,
 Close as CloseIcon,
 CheckCircle as CheckIcon,
 CalendarToday as CalendarIcon,
 Sync as SyncIcon,
} from "@mui/icons-material";
import { useSelector } from "react-redux";
import { useGoogleAuth } from "./setUpConnect";

const GoogleCalendarOnboarding = () => {
 const [open, setOpen] = useState(false);
 const [loading, setLoading] = useState(false);
 const [hasTriedToClose, setHasTriedToClose] = useState(false);

 const { jobs } = useSelector((state: any) => state.jobState);
 const { calendar } = useSelector((state: any) => state.calendarState);
 const { handleGoogleAuth } = useGoogleAuth();

 const hasActiveJobs = jobs.some(job => job.active);
 const hasAvailabilities = calendar?.availabilities?.length > 0;
 const isGoogleConnected = calendar?.googleIds?.length > 0;
 const shouldShow = hasActiveJobs && hasAvailabilities && !isGoogleConnected;

 // Auto-open scenario
 useEffect(() => {
   if (shouldShow && !hasTriedToClose) {
     const timer = setTimeout(() => setOpen(true), 1000);
     return () => clearTimeout(timer);
   }
 }, [shouldShow, hasTriedToClose]);

 // Listen for window close attempt
useEffect(() => {
  const handleBeforeUnload = (e) => {
    if (shouldShow && !isGoogleConnected) {
      e.preventDefault();
      e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      setOpen(true);
      return 'You have unsaved changes. Are you sure you want to leave?';
    }
  };

  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, [shouldShow, isGoogleConnected]);
const handleClose = () => {
  setOpen(false);
  setHasTriedToClose(true);
};

 const handleGoogleConnect = async () => {
   setLoading(true);
   try {
     await handleGoogleAuth();
     setOpen(false);
   } catch (error) {
     console.error("Google auth failed:", error);
   } finally {
     setLoading(false);
   }
 };

 if (!shouldShow) return null;

 return (
   <Dialog 
     open={open} 
     onClose={handleClose}
     maxWidth="sm"
     fullWidth
     PaperProps={{
       sx: {
         borderRadius: 3,
         background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
         color: 'white',
         position: 'relative',
         overflow: 'visible'
       }
     }}
   >
     <IconButton
       onClick={handleClose}
       sx={{ position: 'absolute', top: 8, right: 8, color: 'white' }}
     >
       <CloseIcon />
     </IconButton>

     <DialogContent sx={{ p: 4, textAlign: 'center' }}>
       <CalendarIcon sx={{ fontSize: 64, mb: 2, opacity: 0.9 }} />
       
       <Typography variant="h5" fontWeight="bold" gutterBottom>
         Connect Your Google Calendar
       </Typography>
       
       <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
         Complete your setup for seamless scheduling
       </Typography>

       <Card sx={{ p: 3, mb: 3, backgroundColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
         <List dense>
           <ListItem>
             <ListItemIcon>
               <CheckIcon sx={{ color: '#4CAF50' }} />
             </ListItemIcon>
             <ListItemText 
               primary="Prevent double bookings"
               secondary="Automatically check your Google Calendar for conflicts"
               sx={{ color: 'white' }}
             />
           </ListItem>
           <Divider sx={{ my: 1, backgroundColor: 'rgba(255,255,255,0.2)' }} />
           <ListItem>
             <ListItemIcon>
               <SyncIcon sx={{ color: '#2196F3' }} />
             </ListItemIcon>
             <ListItemText 
               primary="Auto-sync appointments"
               secondary="New bookings appear instantly in your Google Calendar"
               sx={{ color: 'white' }}
             />
           </ListItem>
           <Divider sx={{ my: 1, backgroundColor: 'rgba(255,255,255,0.2)' }} />
           <ListItem>
             <ListItemIcon>
               <CalendarIcon sx={{ color: '#FF9800' }} />
             </ListItemIcon>
             <ListItemText 
               primary="Two-way synchronization"
               secondary="Create events from either calendar and stay synchronized"
               sx={{ color: 'white' }}
             />
           </ListItem>
         </List>
       </Card>

       <Button
         variant="contained"
         size="large"
         fullWidth
         startIcon={loading ? null : <GoogleIcon />}
         onClick={handleGoogleConnect}
         disabled={loading}
         sx={{
           backgroundColor: 'white',
           color: '#667eea',
           fontWeight: 'bold',
           py: 1.5,
           '&:hover': {
             backgroundColor: 'rgba(255,255,255,0.9)',
           },
           '&:disabled': {
             backgroundColor: 'rgba(255,255,255,0.7)',
           }
         }}
       >
         {loading ? 'Connecting...' : 'Connect Google Calendar'}
       </Button>

       <Typography variant="caption" sx={{ display: 'block', mt: 2, opacity: 0.7 }}>
         Your calendar data is secure and only used for scheduling
       </Typography>
     </DialogContent>
   </Dialog>
 );
};

export default GoogleCalendarOnboarding;