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
  AlertTitle,
  LinearProgress,
  Stack,
  Chip,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import DeleteIcon from "@mui/icons-material/Delete";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import EmailIcon from "@mui/icons-material/Email";
import GoogleIcon from "@mui/icons-material/Google";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";
import CloseIcon from "@mui/icons-material/Close";
import ScheduleIcon from "@mui/icons-material/Schedule";
import sendEmail from "./utils/sendEmail";
import { Job } from "$/declarations/backend/backend.did";

const SetupBanner = () => {
  const { profile } = useSelector((state: any) => state.filesState);
  const { calendar } = useSelector((state: any) => state.calendarState);
  const { currentJobId, jobs } = useSelector((state: any) => state.jobState);
  const currentJob = jobs.find((job: Job) => job.id === currentJobId);
  const { backendActor } = useBackendContext();
  const dispatch = useDispatch();

  // States
  const [dismissed, setDismissed] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [availabilityDialogOpen, setAvailabilityDialogOpen] = useState(false);
  const [showCloseAlert, setShowCloseAlert] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [showVerification, setShowVerification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [trials, setTrials] = useState(0);
  const [lastTrialTime, setLastTrialTime] = useState<number>(0);
  const [emailInput, setEmailInput] = useState("");
  const [emails, setEmails] = useState<string[]>(calendar?.googleIds || []);

  const open = Boolean(anchorEl);

  // Setup status
  const emailCompleted = (calendar?.googleIds || []).length > 0;
  const availabilityCompleted = (calendar?.availabilities || []).length > 0;
  const allCompleted = emailCompleted && availabilityCompleted;
  const hasIncomplete = !emailCompleted || !availabilityCompleted;
  const completedCount =
    (emailCompleted ? 1 : 0) + (availabilityCompleted ? 1 : 0);
  const progress = (completedCount / 2) * 100;

  // Effects
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
    return () =>
      document.body.contains(script) && document.body.removeChild(script);
  }, []);

  useEffect(() => {
    if (currentJob?.emails?.[0] && !emailInput) {
      setEmailInput(currentJob.emails[0]);
    }
  }, [currentJob?.emails, emailInput]);

  useEffect(() => {
    if (calendar?.googleIds) {
      setEmails(calendar.googleIds);
    }
  }, [calendar?.googleIds]);

  // Don't render if no profile, setup complete, or dismissed
  if (!profile || allCompleted || dismissed) {
    // Still render email management if emails exist and setup is complete
    if (allCompleted && emails.length > 0) {
      return (
        <Box sx={{ mb: 2 }}>
          <Button
            variant="contained"
            onClick={(e) => setAnchorEl(e.currentTarget)}
            sx={{
              minWidth: { xs: 120, sm: 150 },
              fontSize: { xs: "0.875rem", sm: "1rem" },
            }}
          >
            {emails.length > 1 ? "Emails" : emails[0]}
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={() => setAnchorEl(null)}
          >
            {emails.map((email: string, index: number) => (
              <MenuItem key={email} sx={{ minWidth: { xs: 250, sm: 300 } }}>
                <Typography
                  sx={{ flexGrow: 1, fontSize: { xs: "0.875rem", sm: "1rem" } }}
                >
                  {email}
                </Typography>
                {index === 0 ? (
                  <Tooltip title="Default notification email">
                    <IconButton size="small">
                      <StarIcon color="primary" />
                    </IconButton>
                  </Tooltip>
                ) : (
                  <Tooltip title="Set as default">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEmails((prev) => {
                          const filtered = prev.filter((e) => e !== email);
                          return [email, ...filtered];
                        });
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
                      setEmails((prev) => prev.filter((e) => e !== email));
                    }}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </MenuItem>
            ))}
            <MenuItem
              onClick={() => {
                setEmailDialogOpen(true);
                setAnchorEl(null);
                resetEmailDialog();
              }}
            >
              Add Another Email
            </MenuItem>
          </Menu>
        </Box>
      );
    }
    return null;
  }

  // Utilities
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

  const resetEmailDialog = () => {
    setEmailInput("");
    setVerificationCode("");
    setGeneratedCode("");
    setShowVerification(false);
    setError("");
    setLoading(false);
  };

  const addEmailToBackend = async (email: string) => {
    try {
      const calendar_id = await backendActor.add_google_calendar_id(
        calendar.id,
        [email],
      );
      if ("Err" in calendar_id) {
        alert("Error adding google calendar id");
        return false;
      }
      setEmails((prev) => [...prev, email]);
      dispatch({
        type: "ADD_CALENDAR_EMAIL",
        id: calendar_id.Ok,
        email: email,
      });
      return true;
    } catch (error) {
      console.error("Error adding email to backend:", error);
      alert("Error adding google calendar id");
      return false;
    }
  };

  // Handlers
  const handleGoogleAuth = async () => {
    try {
      if (window.google) {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          scope: "email profile",
          callback: async (response: any) => {
            if (response.access_token) {
              try {
                const res = await fetch(
                  "https://www.googleapis.com/oauth2/v2/userinfo",
                  {
                    headers: {
                      Authorization: `Bearer ${response.access_token}`,
                    },
                  },
                );
                const userInfo = await res.json();
                const success = await addEmailToBackend(userInfo.email);
                if (success) {
                  setEmailDialogOpen(false);
                  resetEmailDialog();
                }
              } catch (err) {
                setError("Failed to get user information");
              }
            }
          },
        });
        client.requestAccessToken();
      }
    } catch (error) {
      setError("Failed to initialize Google OAuth");
    }
  };

  const handleSendVerification = async () => {
    if (!canMakeTrial()) {
      setError("Maximum trials reached. Please try again in 1 hour.");
      return;
    }
    if (!emailInput || !emailInput.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedCode(code);
      await sendEmail(
        "Email Verification Code",
        `Your verification code is: ${code}`,
        [emailInput],
      );
      setShowVerification(true);
      setTrials((prev) => prev + 1);
      setLastTrialTime(Date.now());
    } catch (error) {
      setError("Failed to send verification email");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (verificationCode === generatedCode) {
      const success = await addEmailToBackend(emailInput);
      if (success) {
        setEmailDialogOpen(false);
        resetEmailDialog();
      }
    } else {
      setError("Invalid verification code");
    }
  };

  const handleCloseDialog = (dialogType: "email" | "availability") => {
    if (hasIncomplete) {
      setShowCloseAlert(true);
      return;
    }
    dialogType === "email"
      ? setEmailDialogOpen(false)
      : setAvailabilityDialogOpen(false);
    if (dialogType === "email") resetEmailDialog();
  };

  const forceCloseDialog = (dialogType: "email" | "availability") => {
    if (dialogType === "email") {
      setEmailDialogOpen(false);
      resetEmailDialog();
    } else {
      setAvailabilityDialogOpen(false);
    }
    setShowCloseAlert(false);
  };

  const handleEmailSetup = () => {
    setEmailDialogOpen(true);
    resetEmailDialog();
  };

  const handleAvailabilitySetup = () => {
    setAvailabilityDialogOpen(true);
  };

  return (
    <>
      {/* Main Setup Banner */}
      <Alert
        severity="warning"
        sx={{
          mb: 2,
          borderRadius: 2,
          "& .MuiAlert-message": { width: "100%" },
        }}
        action={
          <IconButton
            aria-label="dismiss"
            color="inherit"
            size="small"
            onClick={() => setDismissed(true)}
          >
            <CloseIcon fontSize="inherit" />
          </IconButton>
        }
      >
        <AlertTitle sx={{ mb: 1 }}>
          Complete Your Account Setup ({completedCount}/2)
        </AlertTitle>

        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{ mb: 2, height: 6, borderRadius: 3 }}
        />

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems="flex-start"
        >
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Please complete these steps to get the most out of your account:
            </Typography>

            <Stack
              direction="row"
              spacing={1}
              flexWrap="wrap"
              useFlexGap
              sx={{ mb: { xs: 2, sm: 0 } }}
            >
              <Chip
                icon={emailCompleted ? <CheckCircleIcon /> : <EmailIcon />}
                label="Email Verification"
                color={emailCompleted ? "success" : "warning"}
                size="small"
                variant={emailCompleted ? "filled" : "outlined"}
              />
              <Chip
                icon={
                  availabilityCompleted ? <CheckCircleIcon /> : <ScheduleIcon />
                }
                label="Calendar Setup"
                color={availabilityCompleted ? "success" : "warning"}
                size="small"
                variant={availabilityCompleted ? "filled" : "outlined"}
              />
            </Stack>
          </Box>

          <Stack direction={{ xs: "row", sm: "column" }} spacing={1}>
            {!emailCompleted && (
              <Button
                size="small"
                variant="contained"
                color="warning"
                onClick={handleEmailSetup}
                startIcon={<EmailIcon />}
              >
                Setup Email
              </Button>
            )}
            {!availabilityCompleted && (
              <Button
                size="small"
                variant="contained"
                color="warning"
                onClick={handleAvailabilitySetup}
                startIcon={<ScheduleIcon />}
              >
                Set Availability
              </Button>
            )}
          </Stack>
        </Stack>
      </Alert>

      {/* Email Management - Show when emails exist */}
      {emails.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Button
            variant="contained"
            onClick={(e) => setAnchorEl(e.currentTarget)}
            sx={{
              minWidth: { xs: 120, sm: 150 },
              fontSize: { xs: "0.875rem", sm: "1rem" },
            }}
          >
            {emails.length > 1 ? "Emails" : emails[0]}
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={() => setAnchorEl(null)}
          >
            {emails.map((email: string, index: number) => (
              <MenuItem key={email} sx={{ minWidth: { xs: 250, sm: 300 } }}>
                <Typography
                  sx={{ flexGrow: 1, fontSize: { xs: "0.875rem", sm: "1rem" } }}
                >
                  {email}
                </Typography>
                {index === 0 ? (
                  <Tooltip title="Default notification email">
                    <IconButton size="small">
                      <StarIcon color="primary" />
                    </IconButton>
                  </Tooltip>
                ) : (
                  <Tooltip title="Set as default">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEmails((prev) => {
                          const filtered = prev.filter((e) => e !== email);
                          return [email, ...filtered];
                        });
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
                      setEmails((prev) => prev.filter((e) => e !== email));
                    }}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </MenuItem>
            ))}
            <MenuItem
              onClick={() => {
                setEmailDialogOpen(true);
                setAnchorEl(null);
                resetEmailDialog();
              }}
            >
              Add Another Email
            </MenuItem>
          </Menu>
        </Box>
      )}

      {/* Email Setup Dialog */}
      <Dialog
        open={emailDialogOpen}
        onClose={() => handleCloseDialog("email")}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            m: { xs: 1, sm: 2 },
            maxHeight: { xs: "90vh", sm: "80vh" },
            overflow: "auto",
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontSize: { xs: "1.125rem", sm: "1.25rem" } }}
            >
              Email Setup
            </Typography>
            <IconButton onClick={() => handleCloseDialog("email")} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ px: { xs: 2, sm: 3 } }}>
          {error && (
            <Alert
              severity="error"
              sx={{ mb: 2, fontSize: { xs: "0.875rem", sm: "1rem" } }}
            >
              {error}
            </Alert>
          )}

          {!showVerification ? (
            <Box sx={{ mt: 1 }}>
              <Typography
                variant="h6"
                sx={{ fontSize: { xs: "1rem", sm: "1.125rem" }, mb: 2 }}
              >
                Choose an option:
              </Typography>

              {/* Gmail OAuth */}
              <Button
                variant="contained"
                fullWidth
                startIcon={<GoogleIcon />}
                onClick={handleGoogleAuth}
                sx={{
                  mb: 2,
                  py: { xs: 1, sm: 1.5 },
                  fontSize: { xs: "0.875rem", sm: "1rem" },
                }}
              >
                Connect with Gmail
              </Button>

              <Divider sx={{ my: 2 }}>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                >
                  OR
                </Typography>
              </Divider>

              {/* Manual Email */}
              <Box>
                <Typography
                  variant="subtitle1"
                  sx={{ fontSize: { xs: "0.875rem", sm: "1rem" }, mb: 1 }}
                >
                  Add Email Manually
                </Typography>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  sx={{
                    mb: 2,
                    "& .MuiInputBase-input": {
                      fontSize: { xs: "0.875rem", sm: "1rem" },
                    },
                  }}
                />
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={handleSendVerification}
                  disabled={loading || !canMakeTrial()}
                  startIcon={
                    loading ? <CircularProgress size={20} /> : <EmailIcon />
                  }
                  sx={{
                    py: { xs: 1, sm: 1.5 },
                    fontSize: { xs: "0.875rem", sm: "1rem" },
                  }}
                >
                  {loading ? "Sending..." : "Send Verification Code"}
                </Button>
                {trials > 0 && (
                  <Typography
                    variant="caption"
                    color="textSecondary"
                    sx={{
                      mt: 1,
                      display: "block",
                      fontSize: { xs: "0.6875rem", sm: "0.75rem" },
                    }}
                  >
                    Trials used: {trials}/3 per hour
                  </Typography>
                )}
              </Box>
            </Box>
          ) : (
            <Box sx={{ mt: 1 }}>
              <Typography
                variant="body1"
                sx={{ mb: 2, fontSize: { xs: "0.875rem", sm: "1rem" } }}
              >
                We've sent a verification code to <strong>{emailInput}</strong>
              </Typography>
              <TextField
                fullWidth
                label="Verification Code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                inputProps={{ maxLength: 6 }}
                sx={{
                  mb: 2,
                  "& .MuiInputBase-input": {
                    fontSize: { xs: "0.875rem", sm: "1rem" },
                  },
                }}
              />
              <Button
                variant="contained"
                fullWidth
                onClick={handleVerifyCode}
                disabled={verificationCode.length !== 6}
                sx={{
                  mb: 1,
                  py: { xs: 1, sm: 1.5 },
                  fontSize: { xs: "0.875rem", sm: "1rem" },
                }}
              >
                Verify Code
              </Button>
              <Button
                variant="text"
                fullWidth
                onClick={() => setShowVerification(false)}
                sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
              >
                Back to Email Entry
              </Button>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Availability Setup Dialog */}
      <Dialog
        open={availabilityDialogOpen}
        onClose={() => handleCloseDialog("availability")}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            m: { xs: 1, sm: 2 },
            maxHeight: { xs: "90vh", sm: "80vh" },
          },
        }}
      >
        <DialogTitle>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontSize: { xs: "1.125rem", sm: "1.25rem" } }}
            >
              Availability Setup
            </Typography>
            <IconButton
              onClick={() => handleCloseDialog("availability")}
              size="small"
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ px: { xs: 2, sm: 3 } }}>
          <Typography
            variant="body1"
            sx={{ mt: 1, mb: 2, fontSize: { xs: "0.875rem", sm: "1rem" } }}
          >
            You can tell your calendar e.g. "I am available every day from 9AM
            to 6PM except Fridays."
          </Typography>
          <Button
            variant="contained"
            fullWidth
            component={Link}
            to="/dashboard"
            onClick={() => setAvailabilityDialogOpen(false)}
            sx={{
              py: { xs: 1, sm: 1.5 },
              fontSize: { xs: "0.875rem", sm: "1rem" },
            }}
          >
            Go to Dashboard to Set Calendar Availability
          </Button>
        </DialogContent>
        <DialogActions sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 3 } }}>
          <Button
            onClick={() => forceCloseDialog("availability")}
            sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Close Alert Dialog */}
      <Dialog
        open={showCloseAlert}
        PaperProps={{
          sx: { m: { xs: 1, sm: 2 } },
        }}
      >
        <DialogTitle sx={{ fontSize: { xs: "1.125rem", sm: "1.25rem" } }}>
          Setup Required
        </DialogTitle>
        <DialogContent sx={{ px: { xs: 2, sm: 3 } }}>
          <Typography sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}>
            Please complete the required setup steps before closing. You can use
            the setup buttons above to continue.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 3 } }}>
          <Button
            onClick={() => setShowCloseAlert(false)}
            sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
          >
            Continue Setup
          </Button>
          <Button
            onClick={() => {
              forceCloseDialog("email");
              forceCloseDialog("availability");
            }}
            color="error"
            sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
          >
            Close Anyway
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SetupBanner;
