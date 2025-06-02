import { useBackendContext } from "@/contexts/BackendContext";
import { 
  Button, 
  IconButton, 
  Menu, 
  MenuItem, 
  Tooltip, 
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Divider,
  Alert,
  CircularProgress,
  Fab,
  Collapse,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton
} from "@mui/material";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import DeleteIcon from '@mui/icons-material/Delete';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import EmailIcon from '@mui/icons-material/Email';
import GoogleIcon from '@mui/icons-material/Google';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import SettingsIcon from '@mui/icons-material/Settings';
import CloseIcon from '@mui/icons-material/Close';
import ScheduleIcon from '@mui/icons-material/Schedule';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import sendEmail from './utils/sendEmail';
import { jobReducer } from "@/redux/reducers/jobReducer";
import { Job } from "$/declarations/backend/backend.did";

const GmailConnection = () => {

  const { profile } = useSelector((state: any) => state.filesState);
  const { calendar } = useSelector((state: any) => state.calendarState);
  const { currentJobId, jobs } = useSelector((state: any) => state.jobState);
  const currentJob = jobs.find((job: Job) => job.id === currentJobId);


  const { backendActor } = useBackendContext();
  const dispatch = useDispatch();
  
  // Main menu states
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [fabExpanded, setFabExpanded] = useState(false);
  const [showCloseAlert, setShowCloseAlert] = useState(false);
  
  // Dialog states
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [availabilityDialogOpen, setAvailabilityDialogOpen] = useState(false);
  
  // Email verification states
  const [verificationCode, setVerificationCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [trials, setTrials] = useState(0);
  const [lastTrialTime, setLastTrialTime] = useState<number>(0);


  const [emailInput, setEmailInput] = useState("");

    useEffect(() => {
      if (currentJob?.emails?.[0] && !emailInput) {
        setEmailInput(currentJob.emails[0]);
      }
    }, [currentJob?.emails, emailInput]);
      

  const open = Boolean(anchorEl);

  useEffect(() => {
    // Load Google OAuth script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const [emails, setEmails] = useState<string[]>(calendar?.googleIds || []);

  useEffect(() => {
    // Sync with calendar.googleIds when it changes
    if (calendar?.googleIds) {
      setEmails(calendar.googleIds);
    }
  }, [calendar?.googleIds]);

  // Check completion status
  const emailCompleted = (calendar?.googleIds || []).length > 0;
  const availabilityCompleted = (calendar?.availabilities || []).length > 0;
  const allCompleted = emailCompleted && availabilityCompleted;
  const hasIncomplete = !emailCompleted || !availabilityCompleted;

  // Don't show if no profile or all steps completed
  if (!profile || allCompleted) return null;

  // Check if user can make more trials
  const canMakeTrial = () => {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    
    if (now - lastTrialTime > oneHour) {
      setTrials(0);
      setLastTrialTime(now);
      return true;
    }
    
    return trials < 3;
  };

  // Helper function to add email to backend and dispatch action
  const addEmailToBackend = async (email: string) => {
    try {
      const calendar_id: {Ok: string} | {Err: string} = await backendActor.add_google_calendar_id(calendar.id, [email]);
      
      if ('Err' in calendar_id) {
        alert("Error adding google calendar id");
        console.log({error_add_google_calendar_id: calendar_id.Err});
        return false;
      }
      
      // Update local state
      setEmails(prev => [...prev, email]);
      
      // Dispatch action to update Redux store
      dispatch({
        type: "ADD_CALENDAR_EMAIL", 
        id: calendar_id.Ok, 
        email: email
      });
      
      return true;
    } catch (error) {
      console.error('Error adding email to backend:', error);
      alert("Error adding google calendar id");
      return false;
    }
  };

  const handleGoogleAuth = async () => {
    try {
      if (window.google) {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          scope: 'email profile',
          callback: async (response: any) => {
            if (response.access_token) {
              try {
                const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                  headers: {
                    'Authorization': `Bearer ${response.access_token}`
                  }
                });
                const userInfo = await res.json();
                console.log('Gmail OAuth Email:', userInfo.email);
                
                // Add email to backend and update state
                const success = await addEmailToBackend(userInfo.email);
                if (success) {
                  setEmailDialogOpen(false);
                  resetEmailDialog();
                }
              } catch (err) {
                console.error('Error getting user info:', err);
                setError('Failed to get user information');
              }
            }
          }
        });
        client.requestAccessToken();
      }
    } catch (error) {
      console.error('Google OAuth error:', error);
      setError('Failed to initialize Google OAuth');
    }
  };

  const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleSendVerification = async () => {
    if (!canMakeTrial()) {
      setError('Maximum trials reached. Please try again in 1 hour.');
      return;
    }

    if (!emailInput || !emailInput.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const code = generateVerificationCode();
      setGeneratedCode(code);
      let res = await sendEmail("Email Verification Code",`
        <div>
          <h2>Email Verification</h2>
          <p>Your verification code is: <strong>${code}</strong></p>
          <p>This code will expire in 10 minutes.</p>
          </div>
        `,[emailInput])

      
      setShowVerification(true);
      setTrials(prev => prev + 1);
      setLastTrialTime(Date.now());
    } catch (error) {
      console.error('Error sending verification email:', error);
      setError('Failed to send verification email');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (verificationCode === generatedCode) {
      // Add email to backend and update state
      const success = await addEmailToBackend(emailInput);
      if (success) {
        setEmailDialogOpen(false);
        resetEmailDialog();
      }
    } else {
      setError('Invalid verification code');
    }
  };

  const resetEmailDialog = () => {
    setEmailInput('');
    setVerificationCode('');
    setGeneratedCode('');
    setShowVerification(false);
    setError('');
    setLoading(false);
  };

  const handleFabClick = () => {
    setFabExpanded(!fabExpanded);
  };

  const handleEmailSetup = () => {
    setEmailDialogOpen(true);
    setFabExpanded(false);
    resetEmailDialog();
  };

  const handleAvailabilitySetup = () => {
    setAvailabilityDialogOpen(true);
    setFabExpanded(false);
    // Add availability setup logic here
  };

  const handleCloseDialog = (dialogType: 'email' | 'availability') => {
    if (hasIncomplete) {
      setShowCloseAlert(true);
      return;
    }
    
    if (dialogType === 'email') {
      setEmailDialogOpen(false);
      resetEmailDialog();
    } else {
      setAvailabilityDialogOpen(false);
    }
  };

  const forceCloseDialog = (dialogType: 'email' | 'availability') => {
    if (dialogType === 'email') {
      setEmailDialogOpen(false);
      resetEmailDialog();
    } else {
      setAvailabilityDialogOpen(false);
    }
    setShowCloseAlert(false);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleRemoveEmail = async (emailId: string) => {
    setEmails(prev => prev.filter(email => email !== emailId));
  };

  const handleSetDefaultEmail = (emailId: string) => {
    if (emails[0] === emailId) return;
    
    setEmails(prev => {
      const filtered = prev.filter(email => email !== emailId);
      return [emailId, ...filtered];
    });
  };
  
  return (
    <>
      {/* Floating Action Button */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000,
        }}
      >
        {/* Expanded Menu */}
        <Collapse in={fabExpanded}>
          <Card sx={{ mb: 2, minWidth: 280 }}>
            <CardContent sx={{ pb: 1 }}>
              <Typography variant="h6" gutterBottom>
                Setup Required
              </Typography>
              <List dense>
                <ListItemButton onClick={handleEmailSetup}>
                  <ListItemIcon>
                    {emailCompleted ? (
                      <CheckCircleIcon color="success" />
                    ) : (
                      <EmailIcon color="warning" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary="Email Setup"
                    secondary={emailCompleted ? "Completed" : "Set up email notifications"}
                  />
                </ListItemButton>
                
                <ListItemButton onClick={handleAvailabilitySetup}>
                  <ListItemIcon>
                    {availabilityCompleted ? (
                      <CheckCircleIcon color="success" />
                    ) : (
                      <ScheduleIcon color="warning" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary="Calendar Availability Setup"
                    secondary={availabilityCompleted ? "Completed" : "Set your available times"}
                  />
                </ListItemButton>
              </List>
            </CardContent>
          </Card>
        </Collapse>

        {/* Main FAB */}
        <Fab
          color={hasIncomplete ? "warning" : "primary"}
          onClick={handleFabClick}
          sx={{
            width: 64,
            height: 64,
          }}
        >
          {hasIncomplete ? (
            fabExpanded ? <ExpandMoreIcon /> : <WarningIcon />
          ) : (
            <CheckCircleIcon />
          )}
        </Fab>
      </Box>

      {/* Email Setup Dialog */}
      <Dialog open={emailDialogOpen} onClose={() => handleCloseDialog('email')} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Email Setup
            <IconButton onClick={() => handleCloseDialog('email')}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {!showVerification ? (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Choose an option:
              </Typography>
              
              {/* Gmail OAuth Section */}
              <Box sx={{ mb: 3 }}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<GoogleIcon />}
                  onClick={handleGoogleAuth}
                  sx={{ mb: 2 }}
                >
                  Connect with Gmail
                </Button>
              </Box>

              <Divider sx={{ my: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  OR
                </Typography>
              </Divider>

              {/* Manual Email Section */}
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Add Email Manually
                </Typography>
                <TextField
                  fullWidth
                  label={"Email Address"}
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={handleSendVerification}
                  disabled={loading || !canMakeTrial()}
                  startIcon={loading ? <CircularProgress size={20} /> : <EmailIcon />}
                >
                  {loading ? 'Sending...' : 'Send Verification Code'}
                </Button>
                {trials > 0 && (
                  <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                    Trials used: {trials}/3 per hour
                  </Typography>
                )}
              </Box>
            </Box>
          ) : (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1" gutterBottom>
                We've sent a verification code to <strong>{emailInput}</strong>
              </Typography>
              <TextField
                fullWidth
                label="Verification Code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                inputProps={{ maxLength: 6 }}
                sx={{ mb: 2 }}
              />
              <Button
                variant="contained"
                fullWidth
                onClick={handleVerifyCode}
                disabled={verificationCode.length !== 6}
              >
                Verify Code
              </Button>
              <Button
                variant="text"
                fullWidth
                onClick={() => setShowVerification(false)}
                sx={{ mt: 1 }}
              >
                Back to Email Entry
              </Button>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Availability Setup Dialog */}
      <Dialog open={availabilityDialogOpen} onClose={() => handleCloseDialog('availability')} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Availability Setup
            <IconButton onClick={() => handleCloseDialog('availability')}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" gutterBottom>
              You can tell your calenar e.g. "I am available every day from 9AM to 6PM except Fridays."
            </Typography>
            {/* Navigate to calendar availability setup page */}
            <Button
              variant="contained"
              fullWidth
              component={Link}
              to="/dashboard"
              sx={{ mt: 2 }}
              onClick={() => setAvailabilityDialogOpen(false)}
            >
              Go to dashboard to set up calendar availabilities
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => forceCloseDialog('availability')}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Close Alert Dialog */}
      <Dialog open={showCloseAlert}>
        <DialogTitle>Setup Required</DialogTitle>
        <DialogContent>
          <Typography>
            Please complete the required setup steps before closing. 
            You can click the warning button in the bottom right corner to continue setup.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCloseAlert(false)}>Continue Setup</Button>
          <Button 
            onClick={() => {
              forceCloseDialog('email');
              forceCloseDialog('availability');
            }}
            color="error"
          >
            Close Anyway
          </Button>
        </DialogActions>
      </Dialog>

      {/* Email Management Menu (for when emails exist) */}
      {emails.length > 0 && (
        <>
          <Button
            variant="contained"
            onClick={handleMenuClick}
            sx={{ minWidth: 150 }}
          >
            {emails.length > 1 ? "Emails" : emails[0]}
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleMenuClose}
          >
            {emails.map((email: string, index: number) => (
              <MenuItem key={email}>
                <Typography sx={{ flexGrow: 1 }}>{email}</Typography>
                {index === 0 ? (
                  <Tooltip title="When others create new events you will be notified by this email" placement="top">
                    <IconButton size="small">
                      <StarIcon color="primary" />
                    </IconButton>
                  </Tooltip>
                ) : (
                  <Tooltip title="Set as default email">
                    <IconButton 
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetDefaultEmail(email);
                      }}
                    >
                      <StarBorderIcon />
                    </IconButton>
                  </Tooltip>
                )}
                <Tooltip title="Remove email">
                  <IconButton 
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveEmail(email);
                    }}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </MenuItem>
            ))}
            <MenuItem onClick={handleEmailSetup}>
              Add Another Email
            </MenuItem>
          </Menu>
        </>
      )}
    </>
  );
};

export default GmailConnection;