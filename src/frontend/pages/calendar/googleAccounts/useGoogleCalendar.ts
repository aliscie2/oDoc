import { useState, useEffect } from "react";
import { serlizeEeventToGooggleEvent } from "./eventConverter";
import { useDispatch, useSelector } from "react-redux";
import { useBackendContext } from "@/contexts/BackendContext";
const accessToken = "";

export const useGoogleCalendar = () => {
  const { profile } = useSelector((state) => state.filesState);
  const { calendar } = useSelector((state) => state.calendarState);
  const { currentJobId, jobs } = useSelector((state) => state.jobState);
  const { backendActor } = useBackendContext();
  const dispatch = useDispatch();

  const [isConnected, setIsConnected] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [showVerification, setShowVerification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [emails, setEmails] = useState(calendar?.googleIds || []);

  const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const SCOPES =
    "email profile https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events";

  let accessToken = localStorage.getItem("googleCalendarToken") || "";
  const calendarId = localStorage.getItem("googleCalendarId");
  const emailCompleted = emails.length > 0;
  const availabilityCompleted = (calendar?.availabilities || []).length > 0;

  useEffect(() => {
    if (accessToken) setIsConnected(true);
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = script.defer = true;
    document.body.appendChild(script);
    return () =>
      document.body.contains(script) && document.body.removeChild(script);
  }, []);

  useEffect(() => {
    const currentJob = jobs.find((job) => job.id === currentJobId);
    if (currentJob?.emails?.[0] && !emailInput)
      setEmailInput(currentJob.emails[0]);
  }, [currentJobId, jobs, emailInput]);

  useEffect(() => {
    if (calendar?.googleIds) setEmails(calendar.googleIds);
  }, [calendar?.googleIds]);

  const storeTokens = (token, calId) => {
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

  const addEmailToBackend = async (email) => {
    const result = await backendActor.add_google_calendar_id(calendar.id, [
      email,
    ]);
    if ("Err" in result) throw new Error("Error adding google calendar id");
    setEmails((prev) => [...prev, email]);
    dispatch({ type: "ADD_CALENDAR_EMAIL", id: result.Ok, email });
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
        callback: async (response) => {
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
            console.log({ y: calData.id });
            localStorage.setItem(
              "googleCalendarToken" + calData.id,
              response.access_token,
            );
          } catch (err) {
            console.error("Error fetching calendar:", err);
          }
        },
        error_callback: () => clearTokens(),
      })
      .requestAccessToken();
  };

  const disConnectCalendar = () => clearTokens();

  const connectGoogleCalendar = () =>
    new Promise((resolve, reject) => {
      if (!window.google)
        return reject(new Error("Google OAuth not available"));

      window.google.accounts.oauth2
        .initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES,
          callback: async (response) => {
            if (!response.access_token)
              return reject(new Error("No access token"));

            try {
              storeTokens(response.access_token, "");

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

              const [userInfo, calData] = await Promise.all([
                userRes.json(),
                calRes.json(),
              ]);
              const primaryCalendar =
                calData.items.find((cal) => cal.primary) || calData.items[0];

              localStorage.setItem("googleCalendarId", primaryCalendar.id);

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
              } catch (aclErr) {
                console.warn("ACL already exists:", aclErr);
              }

              await addEmailToBackend(userInfo.email);
              resetDialog();
              resolve({
                email: userInfo.email,
                calendarId: primaryCalendar.id,
              });
            } catch (err) {
              setError("Failed to get user information");
              reject(err);
            }
          },
          error_callback: (error) =>
            reject(new Error(`OAuth failed: ${error.type}`)),
        })
        .requestAccessToken();
    });

  const executeGoogleAction = async (action) => {
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
      console.error("Error executing Google action:", error);
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

  const setDefaultEmail = (email) =>
    setEmails((prev) => [email, ...prev.filter((e) => e !== email)]);
  const removeEmail = (email) =>
    setEmails((prev) => prev.filter((e) => e !== email));

  const connectCal = async () => {
    // First try to use existing access token
    const currentAccessToken =
      accessToken || localStorage.getItem("googleCalendarToken");

    if (!currentAccessToken) {
      console.error(
        "No access token available. Please connect calendar first.",
      );
      return;
    }

    try {
      const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const emails = calendar?.googleIds;
      const now = new Date().toISOString();
      const allEvents = [];

      for (const email of emails) {
        try {
          const x = localStorage.getItem("googleCalendarToken" + email);
          console.log({ x, email });
          const eventsRes = await fetch(
            `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(email)}/events?timeMin=${now}&maxResults=50&singleEvents=true&orderBy=startTime&timeZone=${userTimeZone}`,
            {
              headers: { Authorization: `Bearer ${x}` },
            },
          );

          // If token expired, try to refresh or reconnect
          if (eventsRes.status === 401) {
            console.log("Token expired, need to reconnect");
            disConnectCalendar();
            return;
          }

          const eventsData = await eventsRes.json();
          const processedEvents = (eventsData.items || []).map((event) => ({
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
          }));

          allEvents.push(...processedEvents);
        } catch (emailErr) {
          console.error(`Error fetching events for ${email}:`, emailErr);
        }
      }

      dispatch({ type: "SET_GOOGLE_CALENDAR", events: allEvents });
    } catch (err) {
      console.error("Error fetching calendar data:", err);
    }
  };

  useEffect(() => {
    const isShareCalendarPage =
      window.location.pathname === "/calendar" &&
      window.location.search.includes("id=");
    if (!isShareCalendarPage && calendar?.googleIds?.length > 0) {
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
