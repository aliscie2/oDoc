import { backendActor } from "@/utils/backendUtils";
import { Check, Share } from "@mui/icons-material";
import {
  Alert,
  IconButton,
  Snackbar,
  Tooltip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
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
    setDisabled(isInvalid || isFetching);
  }, [localCalendarId, isFetching]);

  useEffect(() => {
    const fetchCalendar = async () => {
      const wasChanged = prevCalendarChangedRef.current;
      const isNowSaved = !calendarChanged;
      const shouldFetch =
        wasChanged &&
        isNowSaved &&
        calendar.id === "NOT_SET_YET" &&
        !hasFetchedRef.current;

      if (shouldFetch && !isFetching) {
        setIsFetching(true);
        hasFetchedRef.current = true;

        try {
          const cal = await backendActor.get_my_calendar();

          setLocalCalendarId(cal.id);
          dispatch({ type: "SET_CALENDAR", calendar: cal });
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
      setLocalCalendarId(calendar.id);
    }
  }, [calendar.id, localCalendarId]);

  useEffect(() => {
    if (calendarChanged) {
      hasFetchedRef.current = false;
    }
  }, [calendarChanged]);

  const handleCopy = async () => {
    if (disabled) {
      if (isMobile) {
        setShowDisabledMessage(true);
      } else {
        setTooltipOpen(true);
        setTimeout(() => setTooltipOpen(false), 2000);
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setShowSnackbar(true);
      setTooltipOpen(true);
      setTimeout(() => {
        setCopied(false);
        setTooltipOpen(false);
      }, 2000);
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
              color: copied
                ? "success.main"
                : disabled && !isMobile
                  ? "text.disabled"
                  : "primary.main",
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
