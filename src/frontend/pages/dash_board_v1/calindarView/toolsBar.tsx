import {
  Button,
  ButtonGroup,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
  Box,
  Divider,
} from "@mui/material";
import CalendarManagement from "./AvailabilityComonent";
import React, { useState } from "react";
import CopyButton from "../../../components/MuiComponents/copyButton";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/reducers";

import {
  MoreVert,
  NavigateBefore,
  NavigateNext,
  Today,
} from "@mui/icons-material";
import TimeZoneSelector from "./timezone";
import GoogleCalendarIntegration from "./googleAccounts";
import GmailConnection from "./GmailConnection";

const CustomToolbar = (toolbar) => {
  const { calendarChanged, calendar, calendar_actions } = useSelector(
    (state: RootState) => state.calendarState,
  );
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  // Menu states
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);

  const navigate = (action) => {
    toolbar.onNavigate(action);
    handleActionMenuClose();
  };

  const handleActionMenuClick = (event) => {
    setActionMenuAnchor(event.currentTarget);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
  };

  const viewNames = toolbar.views;
  const view = toolbar.view;
  const currentPage = window.location.pathname;
  const isCalendarPage = currentPage === "/calendar";
  const copyLink = React.useMemo(() => {
    return `${window.location.href}calendar?id=${calendar?.id}`;
  }, [calendar?.id]);

  // Mobile Action Menu
  const ActionMenu = () => (
    <Menu
      anchorEl={actionMenuAnchor}
      open={Boolean(actionMenuAnchor)}
      onClose={handleActionMenuClose}
      PaperProps={{
        sx: {
          mt: 1,
          borderRadius: 2,
          minWidth: 200,
          boxShadow: theme.shadows[8],
        },
      }}
    >
      <MenuItem sx={{ py: 1.5 }}>
        <TimeZoneSelector />
      </MenuItem>
      <Divider />
      {!isCalendarPage && (
        <MenuItem sx={{ py: 1.5 }}>
          <CopyButton title="Share Calendar" value={copyLink} />
        </MenuItem>
      )}
      <MenuItem sx={{ py: 1.5 }}>
        <CalendarManagement />
      </MenuItem>
      <MenuItem sx={{ py: 1.5 }}>
        <GoogleCalendarIntegration />
      </MenuItem>
      <MenuItem sx={{ py: 1.5 }}>
        <GmailConnection />
      </MenuItem>
    </Menu>
  );

  if (isMobile) {
    // Mobile Layout - Clean and minimal
    return (
      <Box
        sx={{
          backgroundColor: "inherit",
          borderBottom: `1px solid ${theme.palette.divider}`,
          px: 2,
          py: 1.5,
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          {/* Left: Menu button */}
          <IconButton
            onClick={handleActionMenuClick}
            sx={{
              backgroundColor: theme.palette.action.hover,
              "&:hover": {
                backgroundColor: theme.palette.action.focus,
              },
            }}
          >
            <MoreVert />
          </IconButton>

          {/* Center: Date and navigation */}
          <Stack direction="row" alignItems="center" spacing={1}>
            <IconButton
              onClick={() => navigate("PREV")}
              size="small"
              sx={{ color: "inherit" }}
            >
              <NavigateBefore />
            </IconButton>

            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                minWidth: 140,
                textAlign: "center",
                color: "inherit",
              }}
            >
              {toolbar.label}
            </Typography>

            <IconButton
              onClick={() => navigate("NEXT")}
              size="small"
              sx={{ color: "inherit" }}
            >
              <NavigateNext />
            </IconButton>
          </Stack>

          {/* Right: Today button */}
          <IconButton
            onClick={() => navigate("TODAY")}
            sx={{
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              "&:hover": {
                backgroundColor: theme.palette.primary.dark,
              },
            }}
          >
            <Today />
          </IconButton>

          <ActionMenu />
        </Stack>
      </Box>
    );
  }

  // Desktop/Tablet Layout - More comprehensive
  return (
    <Box
      sx={{
        backgroundColor: "inherit",
        borderBottom: `1px solid ${theme.palette.divider}`,
        px: 3,
        py: 2,
      }}
    >
      <Stack
        direction="row"
        spacing={3}
        alignItems="center"
        justifyContent="space-between"
      >
        {/* Left: Action buttons */}
        <Stack direction="row" spacing={1} alignItems="center">
          <ButtonGroup
            variant="outlined"
            size="small"
            sx={{
              "& .MuiButton-root": {
                borderColor: theme.palette.divider,
                color: "inherit",
                "&:hover": {
                  backgroundColor: theme.palette.action.hover,
                  borderColor: theme.palette.divider,
                },
              },
            }}
          >
            {!isCalendarPage && <CopyButton title="Share" value={copyLink} />}
            <CalendarManagement />
            <GoogleCalendarIntegration />
            <GmailConnection />
          </ButtonGroup>
        </Stack>

        {/* Center: Navigation and date */}
        <Stack direction="row" spacing={2} alignItems="center">
          <ButtonGroup
            variant="outlined"
            size="small"
            sx={{
              "& .MuiButton-root": {
                borderColor: theme.palette.divider,
                color: "inherit",
                minWidth: "auto",
                px: 1,
                "&:hover": {
                  backgroundColor: theme.palette.action.hover,
                  borderColor: theme.palette.divider,
                },
              },
            }}
          >
            <Tooltip title="Previous">
              <IconButton onClick={() => navigate("PREV")} size="small">
                <NavigateBefore />
              </IconButton>
            </Tooltip>
            <Tooltip title="Today">
              <IconButton onClick={() => navigate("TODAY")} size="small">
                <Today />
              </IconButton>
            </Tooltip>
            <Tooltip title="Next">
              <IconButton onClick={() => navigate("NEXT")} size="small">
                <NavigateNext />
              </IconButton>
            </Tooltip>
          </ButtonGroup>

          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              color: "inherit",
              minWidth: 200,
              textAlign: "center",
            }}
          >
            {toolbar.label}
          </Typography>
        </Stack>

        {/* Right: View controls and timezone (only show view controls if not mobile) */}
        <Stack direction="row" spacing={1} alignItems="center">
          {!isMobile && viewNames.length > 1 && (
            <ButtonGroup
              variant="outlined"
              size="small"
              sx={{
                "& .MuiButton-root": {
                  borderColor: theme.palette.divider,
                  color: "inherit",
                  "&:hover": {
                    backgroundColor: theme.palette.action.hover,
                    borderColor: theme.palette.divider,
                  },
                },
              }}
            >
              {viewNames.map((name) => (
                <Button
                  key={name}
                  onClick={() => toolbar.onView(name)}
                  variant={view === name ? "contained" : "outlined"}
                  sx={{
                    bgcolor:
                      view === name
                        ? theme.palette.primary.main
                        : "transparent",
                    color:
                      view === name
                        ? theme.palette.primary.contrastText
                        : "inherit",
                    textTransform: "capitalize",
                    "&:hover": {
                      bgcolor:
                        view === name
                          ? theme.palette.primary.dark
                          : theme.palette.action.hover,
                    },
                  }}
                >
                  {name}
                </Button>
              ))}
            </ButtonGroup>
          )}

          <Box sx={{ ml: 1 }}>
            <TimeZoneSelector />
          </Box>
        </Stack>
      </Stack>
    </Box>
  );
};

export default CustomToolbar;
