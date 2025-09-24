import { useState, useEffect } from "react";
import { serlizeEeventToGooggleEvent } from "./eventConverter";
import { useDispatch, useSelector } from "react-redux";
import { backendActor } from "@/utils/backendUtils";
import sendEmail from "@/utils/sendEmail";

// Extend Window interface for Google OAuth
interface GoogleOAuthResponse {
  access_token?: string;
  error?: string;
}

interface GoogleOAuthError {
  type: string;
  message?: string;
}

interface GoogleCalendarEvent {
  id: string;
  summary?: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
}

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            hint?: string;
            callback: (response: GoogleOAuthResponse) => void;
            error_callback: (error: GoogleOAuthError) => void;
          }) => {
            requestAccessToken: () => void;
          };
        };
      };
    };
  }
}

interface Availability {
  id: string;
  day: string;
  start_time: string;
  end_time: string;
}

interface Job {
  id: string;
  emails?: string[];
  active?: boolean;
}

interface RootState {
  filesState: {
    profile: unknown;
  };
  calendarState: {
    calendar: {
      id: string;
      google_ids?: string[];
      availabilities?: Availability[];
    } | null;
  };
  jobState: {
    currentJobId: string;
    jobs: Job[];
  };
}

export const useGoogleCalendar = () => {
  const { calendar } = useSelector((state: RootState) => state.calendarState);
  const { currentJobId, jobs } = useSelector((state: RootState) => state.jobState);
  // Using direct backendActor import
  const dispatch = useDispatch();

  const [isConnected, setIsConnected] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [showVerification, setShowVerification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [emails, setEmails] = useState(calendar?.google_ids || []);

  const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  // OAuth scopes for Google Calendar integration:
  // - email profile: Get user's email and basic profile info
  // - calendar: Full calendar access (read/write events)
  // - calendar.events: Manage calendar events
  const SCOPES =
    "email profile https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events";

  let accessToken = localStorage.getItem("googleCalendarToken") || "";
  const calendarId = localStorage.getItem("googleCalendarId");
  const emailCompleted = emails.length > 0;
  const availabilityCompleted = (calendar?.availabilities || []).length > 0;

  useEffect(() => {
    const token = localStorage.getItem("googleCalendarToken");
    if (token) {
      accessToken = token;
      setIsConnected(true);
    } else {
      setIsConnected(false);
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = script.defer = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    const currentJob = jobs.find((job) => job.id === currentJobId);
    if (currentJob?.emails?.[0] && !emailInput)
      setEmailInput(currentJob.emails[0]);
  }, [currentJobId, jobs, emailInput]);

  useEffect(() => {
    if (calendar?.google_ids) setEmails(calendar.google_ids);
  }, [calendar?.google_ids]);

  const storeTokens = (token: string, calId: string) => {
    localStorage.setItem("googleCalendarToken", token);
    localStorage.setItem("googleCalendarId", calId);
    accessToken = token;
    setIsConnected(true);
  };

  const clearTokens = () => {
    localStorage.removeItem("googleCalendarToken");
    localStorage.removeItem("googleCalendarId");
    accessToken = "";
    setIsConnected(false);
  };

  const resetDialog = () => {
    setEmailInput("");
    setVerificationCode("");
    setGeneratedCode("");
    setShowVerification(false);
    setError("");
    setLoading(false);
  };

  const addEmailToBackend = async (email: string) => {
    try {
      // If no calendar exists, get the user's calendar first
      let currentCalendar = calendar;
      if (!currentCalendar?.id) {
        const calendarResult = await backendActor.get_my_calendar();
        currentCalendar = calendarResult;
        dispatch({ type: "SET_CALENDAR", calendar: currentCalendar });
      }

      if (!currentCalendar?.id) {
        throw new Error("No calendar available");
      }
      
      const result = await backendActor.add_google_calendar_id(currentCalendar.id, [
        email,
      ]);
      if ("Err" in result) {
        throw new Error("Error adding google calendar id");
      }
      
      setEmails((prev) => [...prev, email]);
      dispatch({ type: "ADD_CALENDAR_EMAIL", id: result.Ok, email });
    } catch (error) {
      throw error;
    }
  };

  const connectCalendar = () => {
    if (!window.google) return;
    google.accounts.oauth2
      .initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES.replace(
          "email profile ",
          "https://www.googleapis.com/auth/calendar.readonly ",
        ),
        callback: async (response: GoogleOAuthResponse) => {
          if (!response.access_token) return;
          storeTokens(response.access_token, "primary");
          try {
            const calRes = await fetch(
              "https://www.googleapis.com/calendar/v3/calendars/primary",
              {
                headers: { Authorization: `Bearer ${response.access_token}` },
              },
            );
            const calData = await calRes.json();
            localStorage.setItem("googleCalendarId", calData.id);

            localStorage.setItem(
              "googleCalendarToken" + calData.id,
              response.access_token,
            );
          } catch (err: unknown) {
            // Error fetching calendar
          }
        },
        error_callback: () => clearTokens(),
      })
      .requestAccessToken();
  };

  const disConnectCalendar = () => {
    // Clear all stored tokens for all connected accounts
    emails.forEach(email => {
      localStorage.removeItem(`googleCalendarToken_${email}`);
      localStorage.removeItem(`googleCalendarId_${email}`);
    });
    
    // Clear main tokens
    clearTokens();
    setEmails([]);
    
    // Clear any backend calendar data
    dispatch({ type: "CLEAR_GOOGLE_CALENDAR" });
  };

  const connectGoogleCalendar = () =>
    new Promise((resolve, reject) => {
      // Clear any previous errors
      setError("");
      setLoading(true);
      
      if (!window.google) {
        setLoading(false);
        return reject(new Error("Google OAuth not available"));
      }

      // Force account selection for multiple accounts
      // This ensures users can choose which Google account to connect
      window.google.accounts.oauth2
        .initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES,
          // Force account picker for multi-account support
          hint: "", // This forces the account picker
          callback: async (response: GoogleOAuthResponse) => {
            if (!response.access_token) {
              setLoading(false);
              return reject(new Error("No access token received"));
            }

            try {
              // Get user info and calendar data
              const [userRes, calRes] = await Promise.all([
                fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
                  headers: { Authorization: `Bearer ${response.access_token}` },
                }),
                fetch(
                  "https://www.googleapis.com/calendar/v3/users/me/calendarList",
                  {
                    headers: {
                      Authorization: `Bearer ${response.access_token}`,
                    },
                  },
                ),
              ]);

              if (!userRes.ok || !calRes.ok) {
                throw new Error("Failed to fetch user information or calendar data");
              }

              const [userInfo, calData] = await Promise.all([
                userRes.json(),
                calRes.json(),
              ]);

              // Check if this email is already connected
              if (emails.includes(userInfo.email)) {
                setLoading(false);
                setError("This Google account is already connected");
                return reject(new Error("Account already connected"));
              }

              const primaryCalendar =
                calData.items?.find((cal) => cal.primary) || calData.items?.[0];

              if (!primaryCalendar) {
                throw new Error("No calendar found for this account");
              }

              // Store token with email-specific key for multi-account support
              localStorage.setItem(`googleCalendarToken_${userInfo.email}`, response.access_token);
              localStorage.setItem(`googleCalendarId_${userInfo.email}`, primaryCalendar.id);
              
              // If this is the first account, also store as default
              if (emails.length === 0) {
                storeTokens(response.access_token, primaryCalendar.id);
              }

              // Set up calendar permissions (optional, for sharing)
              try {
                await fetch(
                  `https://www.googleapis.com/calendar/v3/calendars/${primaryCalendar.id}/acl`,
                  {
                    method: "POST",
                    headers: {
                      Authorization: `Bearer ${response.access_token}`,
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      role: "freeBusyReader",
                      scope: { type: "default" },
                    }),
                  },
                );
              } catch (aclErr: unknown) {
                // ACL setup failed (may already exist)
              }

              // Add email to backend
              await addEmailToBackend(userInfo.email);
              
              setLoading(false);
              resetDialog();
              resolve({
                email: userInfo.email,
                calendarId: primaryCalendar.id,
              });
            } catch (err: unknown) {
              setLoading(false);
              
              // Set appropriate error message
              if (err.message?.includes("No calendar available") || 
                  err.message?.includes("Error adding google calendar id")) {
                setError("Failed to complete connection. Please try again.");
              } else if (err.message?.includes("Account already connected")) {
                setError("This Google account is already connected");
              } else {
                setError("Failed to connect Google account. Please try again.");
              }
              reject(err);
            }
          },
          error_callback: (error: GoogleOAuthError) => {
            setLoading(false);
            
            if (error.type === "popup_closed") {
              setError("Connection cancelled");
            } else if (error.type === "access_denied") {
              setError("Access denied. Calendar permissions are required.");
            } else {
              setError("Authentication failed. Please try again.");
            }
            reject(new Error(`OAuth failed: ${error.type}`));
          },
        })
        .requestAccessToken();
    });

  const executeGoogleAction = async (action: {
    type: string;
    event?: unknown;
    id?: string;
  }) => {
    if (!isConnected || !accessToken) return false;

    const headers = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    };
    const baseUrl =
      "https://www.googleapis.com/calendar/v3/calendars/primary/events";

    try {
      let response;
      switch (action.type) {
        case "ADD_EVENT":
          response = await fetch(baseUrl, {
            method: "POST",
            headers,
            body: JSON.stringify(serlizeEeventToGooggleEvent(action.event)),
          });
          break;
        case "UPDATE_EVENT":
          response = await fetch(`${baseUrl}/${action.event.id}`, {
            method: "PUT",
            headers,
            body: JSON.stringify(serlizeEeventToGooggleEvent(action.event)),
          });
          break;
        case "DELETE_EVENT":
          response = await fetch(`${baseUrl}/${action.id}`, {
            method: "DELETE",
            headers,
          });
          return response.ok;
        default:
          return false;
      }
      return await response.json();
    } catch (error) {
      clearTokens();
      return false;
    }
  };

  const handleSendVerification = async () => {
    if (!emailInput?.includes("@"))
      return setError("Please enter a valid email"), false;

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
      return true;
    } catch {
      return setError("Failed to send verification email"), false;
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (verificationCode !== generatedCode)
      return setError("Invalid verification code"), false;

    try {
      await addEmailToBackend(emailInput);
      resetDialog();
      return true;
    } catch {
      return setError("Failed to add email"), false;
    }
  };

  const setDefaultEmail = (email: string) => {
    setEmails((prev) => [email, ...prev.filter((e) => e !== email)]);
    
    // Update the main stored token to the new default
    const emailToken = localStorage.getItem(`googleCalendarToken_${email}`);
    const emailCalendarId = localStorage.getItem(`googleCalendarId_${email}`);
    if (emailToken && emailCalendarId) {
      storeTokens(emailToken, emailCalendarId);
    }
  };

  const removeEmail = async (email: string) => {
    try {
      // Remove from backend first
      if (calendar?.id) {
        const result = await backendActor.remove_google_calendar_id(calendar.id, email);
        
        if ("Err" in result) {
          throw new Error("Failed to remove email from backend");
        }
      }

      // Remove stored tokens for this email
      localStorage.removeItem(`googleCalendarToken_${email}`);
      localStorage.removeItem(`googleCalendarId_${email}`);
      
      // Update local state
      setEmails((prev) => {
        const newEmails = prev.filter((e) => e !== email);
        
        // If we removed the default email, set a new default
        if (prev[0] === email && newEmails.length > 0) {
          const newDefaultEmail = newEmails[0];
          const newDefaultToken = localStorage.getItem(`googleCalendarToken_${newDefaultEmail}`);
          const newDefaultCalendarId = localStorage.getItem(`googleCalendarId_${newDefaultEmail}`);
          if (newDefaultToken && newDefaultCalendarId) {
            storeTokens(newDefaultToken, newDefaultCalendarId);
          }
        }
        
        // If no emails left, clear all tokens
        if (newEmails.length === 0) {
          clearTokens();
          setIsConnected(false);
        }
        
        return newEmails;
      });

      // Update Redux state
      dispatch({ type: "REMOVE_CALENDAR_EMAIL", email });
      
      // Clear any error state
      setError("");
      
    } catch (error) {
      setError("Failed to remove account. Please try again.");
    }
  };

  const connectCal = async () => {
    if (!emails || emails.length === 0) {
      return;
    }

    try {
      const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const now = new Date().toISOString();
      const allEvents = [];

      for (const email of emails) {
        try {
          // Use the new email-specific token storage
          const emailToken = localStorage.getItem(`googleCalendarToken_${email}`);
          const emailCalendarId = localStorage.getItem(`googleCalendarId_${email}`) || email;

          if (!emailToken) {
            continue;
          }

          const eventsRes = await fetch(
            `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(emailCalendarId)}/events?timeMin=${now}&maxResults=50&singleEvents=true&orderBy=startTime&timeZone=${userTimeZone}`,
            {
              headers: { Authorization: `Bearer ${emailToken}` },
            },
          );

          // If token expired for this specific account
          if (eventsRes.status === 401) {
            await removeEmail(email);
            continue;
          }

          if (!eventsRes.ok) {
            continue;
          }

          const eventsData = await eventsRes.json();
          const processedEvents = (eventsData.items || []).map((event: GoogleCalendarEvent) => ({
            id: event.id,
            title: event.summary || "Untitled",
            start_time:
              new Date(event.start.dateTime || event.start.date).getTime() *
              1000000,
            end_time:
              new Date(event.end.dateTime || event.end.date).getTime() *
              1000000,
            description: event.description || "",
            created_by: email,
            isGoogleEvent: true,
            googleCalendarId: emailCalendarId,
          }));

          allEvents.push(...processedEvents);
        } catch (emailErr: unknown) {
          // Error fetching events for this email
        }
      }

      dispatch({ type: "SET_GOOGLE_CALENDAR", events: allEvents });
    } catch (err: unknown) {
      // Error fetching calendar data
    }
  };

  useEffect(() => {
    const isShareCalendarPage =
      window.location.pathname === "/calendar" &&
      window.location.search.includes("id=");
    if (!isShareCalendarPage && (calendar?.google_ids?.length ?? 0) > 0) {
      (async () => {
        connectCal();
      })();
    }
  }, [calendar, backendActor]);

  return {
    connectCal,
    emailCompleted,
    availabilityCompleted,
    connectGoogleCalendar,
    loading,
    emailInput,
    setEmailInput,
    verificationCode,
    setVerificationCode,
    showVerification,
    setShowVerification,
    error,
    handleSendVerification,
    handleVerifyCode,
    executeGoogleAction,
    isConnected,
    calendarId,
    emails,
    setDefaultEmail,
    removeEmail,
    connectCalendar,
    disConnectCalendar,
  };
};
