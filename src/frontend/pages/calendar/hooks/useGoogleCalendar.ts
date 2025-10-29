// Google Calendar Integration Hook
import { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { backendActor } from "@/utils/backendUtils";
import { serializeEventToGoogleEvent } from "../utils/googleConverters";

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const SCOPES =
  "email profile https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events";

export const useGoogleCalendar = () => {
  const dispatch = useDispatch();
  const { calendar } = useSelector((state: any) => state.calendarState);
  const { profile } = useSelector((state: unknown) => state.filesState);

  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ CRITICAL FIX: Detect if viewing shared calendar
  const isSharedCalendar = calendar && calendar.owner !== profile?.id;

  // ✅ CRITICAL FIX: Use correct email source based on context
  const getGoogleIds = useCallback(() => {
    if (isSharedCalendar) {
      // When viewing shared calendar, use USER's own Google IDs from localStorage
      const userId = profile?.id;
      if (!userId) return [];

      const storedEmails = localStorage.getItem(`userGoogleEmails_${userId}`);
      const userEmails = storedEmails ? JSON.parse(storedEmails) : [];
      return userEmails;
    } else {
      // When viewing own calendar, use calendar's Google IDs
      return calendar?.google_ids || [];
    }
  }, [isSharedCalendar, calendar, profile]);

  const [emails, setEmails] = useState<string[]>(getGoogleIds());

  const hasInitializedRef = useRef(false);

  // Check for existing token
  useEffect(() => {
    const token = localStorage.getItem("googleCalendarToken");
    if (token) {
      setIsConnected(true);
    }

    // Load Google OAuth script
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Update emails when context changes
  useEffect(() => {
    const newEmails = getGoogleIds();
    setEmails(newEmails);

    // ✅ FIX: Update isConnected based on whether we have emails
    // Check if user has a valid token
    const userId = profile?.id;
    const hasToken =
      userId &&
      newEmails.some((email) =>
        localStorage.getItem(`googleCalendarToken_${userId}_${email}`),
      );

    setIsConnected(!!hasToken);
  }, [getGoogleIds, isSharedCalendar, profile]);

  const connectGoogleCalendar = useCallback(async () => {
    return new Promise((resolve, reject) => {
      setError("");
      setLoading(true);

      if (!window.google) {
        setLoading(false);
        setError("Google OAuth not available");
        return reject(new Error("Google OAuth not available"));
      }

      window.google.accounts.oauth2
        .initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES,
          hint: "",
          callback: async (response: any) => {
            if (!response.access_token) {
              setLoading(false);
              setError("No access token received");
              return reject(new Error("No access token received"));
            }

            try {
              const userRes = await fetch(
                "https://www.googleapis.com/oauth2/v2/userinfo",
                {
                  headers: { Authorization: `Bearer ${response.access_token}` },
                },
              );

              if (!userRes.ok)
                throw new Error("Failed to fetch user information");

              const userInfo = await userRes.json();
              const userId = profile?.id;

              // 🔗 GENERATE iCal PUBLIC URL
              const icalPublicUrl = `https://calendar.google.com/calendar/ical/${encodeURIComponent(userInfo.email)}/public/basic.ics`;

              // 🔓 Make calendar public via ACL (so the iCal URL works)
              try {
                await fetch(
                  `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(userInfo.email)}/acl`,
                  {
                    method: "POST",
                    headers: {
                      Authorization: `Bearer ${response.access_token}`,
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      role: "reader",
                      scope: { type: "default" },
                    }),
                  },
                );
              } catch (aclError) {
                // Calendar might already be public, continue
              }

              localStorage.setItem(
                `googleCalendarToken_${userId}_${userInfo.email}`,
                response.access_token,
              );
              localStorage.setItem(
                `googleCalendarToken_${userId}`,
                response.access_token,
              );

              if (userId) {
                const currentEmails = getGoogleIds();
                const updatedEmails = [...currentEmails, userInfo.email];
                localStorage.setItem(
                  `userGoogleEmails_${userId}`,
                  JSON.stringify(updatedEmails),
                );
                setEmails(updatedEmails);
              }

              if (isSharedCalendar) {
                try {
                  const myCalendar = await backendActor.get_my_calendar();
                  if (myCalendar?.id) {
                    const result = await backendActor.add_google_calendar_id(
                      myCalendar.id,
                      [userInfo.email],
                    );
                    if ("Ok" in result) {
                      dispatch({
                        type: "SET_USER_CALENDAR",
                        calendar: myCalendar,
                      });
                    }
                  }
                } catch (err) {
                  console.error("Error updating user's calendar:", err);
                }
              } else {
                if (calendar?.id) {
                  // Store Google Calendar ID
                  const result = await backendActor.add_google_calendar_id(
                    calendar.id,
                    [userInfo.email],
                  );
                  if ("Ok" in result) {
                    dispatch({
                      type: "ADD_CALENDAR_EMAIL",
                      id: result.Ok,
                      email: userInfo.email,
                    });
                  }

                  // Store iCal public URL in backend
                  try {
                    await backendActor.store_calendar_public_url(
                      calendar.id,
                      icalPublicUrl,
                    );
                  } catch (urlError) {
                    console.error("Error storing iCal URL:", urlError);
                  }
                }
              }

              setIsConnected(true);
              setLoading(false);
              resolve({ email: userInfo.email });
            } catch (err: unknown) {
              setLoading(false);
              setError(err.message || "Failed to connect");
              reject(err);
            }
          },
          error_callback: (error: unknown) => {
            setLoading(false);
            setError(
              error.type === "popup_closed"
                ? "Connection cancelled"
                : "Authentication failed",
            );
            reject(new Error(`OAuth failed: ${error.type}`));
          },
        })
        .requestAccessToken();
    });
  }, [calendar, dispatch, isSharedCalendar, profile, getGoogleIds]);

  const refreshGoogleCalendarEvents = useCallback(async () => {
    if (emails.length === 0) return;

    try {
      const allEvents = [];

      const userId = profile?.id;

      for (const email of emails) {
        const token = localStorage.getItem(
          `googleCalendarToken_${userId}_${email}`,
        );
        if (!token) continue;

        const now = new Date().toISOString();
        const response = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(email)}/events?timeMin=${now}&maxResults=50&singleEvents=true&orderBy=startTime`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (response.ok) {
          const data = await response.json();
          const events = (data.items || []).map((event: unknown) => ({
            id: `${email}_${event.id}`,
            originalId: event.id,
            title: event.summary || "Untitled",
            description: event.description || "",
            start_time:
              new Date(event.start.dateTime || event.start.date).getTime() *
              1000000,
            end_time:
              new Date(event.end.dateTime || event.end.date).getTime() *
              1000000,
            created_by: email,
            isGoogleEvent: true,
            attendees: [],
            recurrence: [],
          }));
          allEvents.push(...events);
        }
      }

      dispatch({ type: "SET_GOOGLE_CALENDAR", events: allEvents });
    } catch (error) {
      console.error("Error refreshing Google Calendar events:", error);
    }
  }, [emails, dispatch, profile]);

  const executeGoogleAction = useCallback(
    async (action: unknown) => {
      const targetEmail = emails[0];
      if (!targetEmail) return false;

      const userId = profile?.id;
      const token = localStorage.getItem(
        `googleCalendarToken_${userId}_${targetEmail}`,
      );
      if (!token) return false;

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };
      const baseUrl = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(targetEmail)}/events`;

      try {
        let response;
        let requestBody;

        switch (action.type) {
          case "ADD_EVENT": {
            const serializedEvent = serializeEventToGoogleEvent(action.event);
            requestBody = JSON.stringify(serializedEvent);
            response = await fetch(baseUrl, {
              method: "POST",
              headers,
              body: requestBody,
            });
            break;
          }

          case "UPDATE_EVENT": {
            const serializedUpdateEvent = serializeEventToGoogleEvent(
              action.event,
            );
            requestBody = JSON.stringify(serializedUpdateEvent);
            response = await fetch(`${baseUrl}/${action.event.id}`, {
              method: "PUT",
              headers,
              body: requestBody,
            });
            break;
          }

          case "DELETE_EVENT":
            response = await fetch(`${baseUrl}/${action.id}`, {
              method: "DELETE",
              headers,
            });
            return response.ok;

          default:
            return false;
        }

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem(
              `googleCalendarToken_${userId}_${targetEmail}`,
            );
            localStorage.removeItem(`googleCalendarToken_${userId}`);
            setIsConnected(false);
          }
          return false;
        }

        return true;
      } catch (error) {
        return false;
      }
    },
    [emails, profile],
  );

  const disConnectCalendar = useCallback(() => {
    const userId = profile?.id;
    emails.forEach((email) => {
      localStorage.removeItem(`googleCalendarToken_${userId}_${email}`);
    });
    localStorage.removeItem(`googleCalendarToken_${userId}`);
    localStorage.removeItem(`userGoogleEmails_${userId}`);
    setEmails([]);
    setIsConnected(false);
    dispatch({ type: "CLEAR_GOOGLE_CALENDAR" });
  }, [emails, dispatch, profile]);

  const removeEmail = useCallback(
    async (email: string) => {
      const userId = profile?.id;

      // Remove from backend
      if (isSharedCalendar) {
        // Remove from user's own calendar
        try {
          const myCalendar = await backendActor.get_my_calendar();
          if (myCalendar?.id) {
            await backendActor.remove_google_calendar_id(myCalendar.id, email);
          }
        } catch (err) {
          console.error("Error removing from user calendar:", err);
        }
      } else {
        // Remove from current calendar
        if (calendar?.id) {
          await backendActor.remove_google_calendar_id(calendar.id, email);
        }
      }

      // Remove from localStorage
      localStorage.removeItem(`googleCalendarToken_${userId}_${email}`);

      // Update stored emails
      const updatedEmails = emails.filter((e) => e !== email);
      setEmails(updatedEmails);
      if (userId) {
        localStorage.setItem(
          `userGoogleEmails_${userId}`,
          JSON.stringify(updatedEmails),
        );
      }

      dispatch({ type: "REMOVE_CALENDAR_EMAIL", email });
    },
    [calendar, dispatch, profile, isSharedCalendar, emails],
  );

  const setDefaultEmail = useCallback((email: string) => {
    setEmails((prev) => [email, ...prev.filter((e) => e !== email)]);
  }, []);

  // Auto-refresh events when connected
  useEffect(() => {
    if (isConnected && emails.length > 0 && !hasInitializedRef.current) {
      hasInitializedRef.current = true;
      refreshGoogleCalendarEvents();
    }
  }, [isConnected, emails, refreshGoogleCalendarEvents]);

  return {
    isConnected,
    loading,
    error,
    emails,
    connectGoogleCalendar,
    refreshGoogleCalendarEvents,
    executeGoogleAction,
    disConnectCalendar,
    removeEmail,
    setDefaultEmail,
    connectCal: refreshGoogleCalendarEvents,
    calendarId: emails[0] || null,
    emailCompleted: emails.length > 0,
    availabilityCompleted: (calendar?.availabilities || []).length > 0,
    emailInput: "",
    setEmailInput: () => {},
    verificationCode: "",
    setVerificationCode: () => {},
    showVerification: false,
    handleSendVerification: async () => false,
    handleVerifyCode: async () => false,
  };
};
