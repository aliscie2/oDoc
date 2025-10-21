import { backendActor } from "@/utils/backendUtils";
import { Check, Share } from "@mui/icons-material";
import { Alert, IconButton, Snackbar, Tooltip, useMediaQuery, useTheme } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const ShareCalendarButton: React.FC = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { calendar, calendarChanged } = useSelector(
    (state: unknown) => state.calendarState,
  );

  const [copied, setCopied] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [showDisabledMessage, setShowDisabledMessage] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [localCalendarId, setLocalCalendarId] = useState(calendar.id);
  const [isFetching, setIsFetching] = useState(false);
  const [disabled, setDisabled] = useState(
    !calendar.id || calendar.id === "NOT_SET_YET",
  );

  const prevCalendarChangedRef = useRef(calendarChanged);
  const hasFetchedRef = useRef(false);

  const shareLink = `${window.location.origin}/share_calendar?id=${localCalendarId}`;

  const isShareCalendarPage = window.location.pathname === "/share_calendar";
  if (isShareCalendarPage) {
    return null;
  }

  useEffect(() => {
    const isInvalid = !localCalendarId || localCalendarId === "NOT_SET_YET";
    console.log("[ShareButton] Updating disabled state:", {
      localCalendarId,
      isInvalid,
      isFetching,
    });
    setDisabled(isInvalid || isFetching);
  }, [localCalendarId, isFetching]);

  useEffect(() => {
    console.log("[ShareButton] State changed:", {
      calendarChanged,
      prevCalendarChanged: prevCalendarChangedRef.current,
      calendarId: calendar.id,
      localCalendarId,
      isFetching,
      hasFetched: hasFetchedRef.current,
      disabled,
    });

    const fetchCalendar = async () => {
      const wasChanged = prevCalendarChangedRef.current;
      const isNowSaved = !calendarChanged;
      const shouldFetch =
        wasChanged &&
        isNowSaved &&
        calendar.id === "NOT_SET_YET" &&
        !hasFetchedRef.current;

      console.log("[ShareButton] Fetch decision:", {
        wasChanged,
        isNowSaved,
        shouldFetch,
        calendarId: calendar.id,
      });

      if (shouldFetch && !isFetching) {
        console.log("[ShareButton] Starting fetch...");
        setIsFetching(true);
        hasFetchedRef.current = true;

        try {
          const cal = await backendActor.get_my_calendar();
          console.log("[ShareButton] Fetched calendar:", cal);

          setLocalCalendarId(cal.id);
          dispatch({ type: "SET_CALENDAR", calendar: cal });

          console.log(
            "[ShareButton] Calendar updated, button should enable now",
          );
        } catch (error) {
          console.error("[ShareButton] Failed to fetch calendar:", error);
          hasFetchedRef.current = false;
        } finally {
          setIsFetching(false);
        }
      }

      prevCalendarChangedRef.current = calendarChanged;
    };

    fetchCalendar();
  }, [
    calendarChanged,
    calendar.id,
    dispatch,
    isFetching,
    localCalendarId,
    disabled,
  ]);

  useEffect(() => {
    if (calendar.id !== "NOT_SET_YET" && calendar.id !== localCalendarId) {
      console.log(
        "[ShareButton] Syncing localCalendarId with Redux:",
        calendar.id,
      );
      setLocalCalendarId(calendar.id);
    }
  }, [calendar.id, localCalendarId]);

  useEffect(() => {
    if (calendarChanged) {
      console.log("[ShareButton] Calendar changed, resetting fetch flag");
      hasFetchedRef.current = false;
    }
  }, [calendarChanged]);

  const handleCopy = async () => {
    if (disabled) {
      console.log("[ShareButton] Copy blocked - button disabled");
      if (isMobile) {
        setShowDisabledMessage(true);
      } else {
        setTooltipOpen(true);
        setTimeout(() => setTooltipOpen(false), 2000);
      }
      return;
    }

    console.log("[ShareButton] Copying link:", shareLink);

    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setShowSnackbar(true);
      setTooltipOpen(true);
      setTimeout(() => {
        setCopied(false);
        setTooltipOpen(false);
      }, 2000);
      console.log("[ShareButton] Link copied successfully");
    } catch (error) {
      console.error(
        "[ShareButton] Clipboard API failed, using fallback:",
        error,
      );
      const textArea = document.createElement("textarea");
      textArea.value = shareLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setShowSnackbar(true);
      setTooltipOpen(true);
      setTimeout(() => {
        setCopied(false);
        setTooltipOpen(false);
      }, 2000);
      console.log("[ShareButton] Link copied via fallback");
    }
  };

  const tooltipTitle = disabled
    ? "Set availabilities via the chat"
    : copied
      ? "Copied!"
      : "Copy calendar link";

  return (
    <>
      <Tooltip 
        title={tooltipTitle} 
        disableTouchListener
        open={tooltipOpen}
        onOpen={() => setTooltipOpen(true)}
        onClose={() => setTooltipOpen(false)}
      >
        <span>
          <IconButton
            onClick={handleCopy}
            disabled={!isMobile && disabled}
            size={"small"}
            sx={{
              color: copied ? "success.main" : disabled && !isMobile ? "text.disabled" : "primary.main",
              transition: "all 0.2s",
              "&:hover": {
                backgroundColor: "primary.light",
                transform: "scale(1.05)",
              },
            }}
          >
            {copied ? (
              <Check fontSize={"small"} />
            ) : (
              <Share fontSize={"small"} />
            )}
          </IconButton>
        </span>
      </Tooltip>

      <Snackbar
        open={showSnackbar}
        autoHideDuration={2000}
        onClose={() => setShowSnackbar(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setShowSnackbar(false)}
          severity="success"
          variant="filled"
          sx={{ width: "100%" }}
        >
          Calendar link copied to clipboard!
        </Alert>
      </Snackbar>

      <Snackbar
        open={showDisabledMessage}
        autoHideDuration={3000}
        onClose={() => setShowDisabledMessage(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setShowDisabledMessage(false)}
          severity="info"
          variant="filled"
          sx={{ width: "100%" }}
        >
          Set availabilities via the chat
        </Alert>
      </Snackbar>
    </>
  );
};

export default ShareCalendarButton;
