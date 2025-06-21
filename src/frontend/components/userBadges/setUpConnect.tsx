import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useBackendContext } from "@/contexts/BackendContext";
import sendEmail from "@/utils/sendEmail";
import { Job } from "$/declarations/backend/backend.did";

export const useSetup = () => {
  const { profile } = useSelector((state: any) => state.filesState);
  const { calendar } = useSelector((state: any) => state.calendarState);
  const { currentJobId, jobs } = useSelector((state: any) => state.jobState);
  const currentJob = jobs.find((job: Job) => job.id === currentJobId);
  const { backendActor } = useBackendContext();
  const dispatch = useDispatch();

  // States
  const [dismissed, setDismissed] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [showVerification, setShowVerification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [trials, setTrials] = useState(0);
  const [lastTrialTime, setLastTrialTime] = useState<number>(0);
  const [emailInput, setEmailInput] = useState("");
  const [emails, setEmails] = useState<string[]>(calendar?.googleIds || []);

  // Setup status calculations
  const emailCompleted = (calendar?.googleIds || []).length > 0;
  const availabilityCompleted = (calendar?.availabilities || []).length > 0;
  const allCompleted = emailCompleted && availabilityCompleted;
  const hasIncomplete = !emailCompleted || !availabilityCompleted;
  const completedCount =
    (emailCompleted ? 1 : 0) + (availabilityCompleted ? 1 : 0);
  const progress = (completedCount / 2) * 100;

  // Should show setup banner
  const shouldShowSetup = profile && !allCompleted && !dismissed;

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
        throw new Error("Error adding google calendar id");
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
      throw error;
    }
  };

  // Handlers
  const handleGoogleAuth = async () => {
    return new Promise((resolve, reject) => {
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
                  await addEmailToBackend(userInfo.email);
                  resetEmailDialog();
                  resolve(userInfo.email);
                } catch (err) {
                  setError("Failed to get user information");
                  reject(err);
                }
              } else {
                reject(new Error("No access token received"));
              }
            },
          });
          client.requestAccessToken();
        } else {
          reject(new Error("Google OAuth not available"));
        }
      } catch (error) {
        setError("Failed to initialize Google OAuth");
        reject(error);
      }
    });
  };

  const handleSendVerification = async () => {
    if (!canMakeTrial()) {
      setError("Maximum trials reached. Please try again in 1 hour.");
      return false;
    }
    if (!emailInput || !emailInput.includes("@")) {
      setError("Please enter a valid email address");
      return false;
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
      return true;
    } catch (error) {
      setError("Failed to send verification email");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (verificationCode === generatedCode) {
      try {
        await addEmailToBackend(emailInput);
        resetEmailDialog();
        return true;
      } catch (error) {
        setError("Failed to add email");
        return false;
      }
    } else {
      setError("Invalid verification code");
      return false;
    }
  };

  const setDefaultEmail = (email: string) => {
    setEmails((prev) => {
      const filtered = prev.filter((e) => e !== email);
      return [email, ...filtered];
    });
  };

  const removeEmail = (email: string) => {
    setEmails((prev) => prev.filter((e) => e !== email));
  };

  const dismissSetup = () => {
    setDismissed(true);
  };

  return {
    // State
    dismissed,
    verificationCode,
    setVerificationCode,
    showVerification,
    loading,
    error,
    setError,
    trials,
    emailInput,
    setEmailInput,
    emails,

    // Computed values
    emailCompleted,
    availabilityCompleted,
    allCompleted,
    hasIncomplete,
    completedCount,
    progress,
    shouldShowSetup,

    // Functions
    canMakeTrial,
    resetEmailDialog,
    handleGoogleAuth,
    handleSendVerification,
    handleVerifyCode,
    setDefaultEmail,
    removeEmail,
    dismissSetup,
  };
};
