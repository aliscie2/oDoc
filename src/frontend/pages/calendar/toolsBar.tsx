import React, { useState } from "react";
import {
  Box,
  Button,
  ButtonGroup,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useSelector } from "react-redux";
import CalendarManagement from "./AvailabilityComonent";
import CopyButton from "@/components/MuiComponents/copyButton";
import {
  MoreVert,
  NavigateBefore,
  NavigateNext,
  Visibility,
  Edit,
} from "@mui/icons-material";
import GoogleAccountManager from "./GoogleAccountManager";
import TimeZoneSelector from "./timezone";
import UserAvatarMenu from "@/components/MainComponents/UserAvatarMenu";

interface CustomToolbarProps {
  onNavigate: (action: string) => void;
  onView: (view: string) => void;
  label: string;
  view: string;
  views: string[];
}

interface RootState {
  calendarState: {
    calendar: {
      id: string;
      owner?: string;
    } | null;
  };
  filesState: {
    profile: {
      id: string;
    } | null;
  };
}

const CustomToolbar: React.FC<CustomToolbarProps> = ({
  onNavigate,
  onView,
  label,
  view,
  views,
}) => {
  const { calendar } = useSelector((state: RootState) => state.calendarState);
  const { profile } = useSelector((state: RootState) => state.filesState);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

  const handleNavigate = (action: string) => {
    onNavigate(action);
    setMenuAnchor(null);
  };

  const isShareCalendarPage =
    window.location.pathname === "/calendar" &&
    window.location.search.includes("id=");
  const shareLink = `${window.location.origin}/calendar?id=${calendar?.id}`;

  const isOwnCalendar = !calendar?.owner || calendar.owner === profile?.id;

  // Professional styling based on ownership
  const getToolbarStyles = () => {
    if (isOwnCalendar) {
      return {
        backgroundColor: "background.paper",
        borderBottom: 1,
        borderColor: "divider",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      };
    } else {
      return {
        backgroundColor: "grey.50",
        borderBottom: 1,
        borderColor: "grey.200",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "2px",
          background: "linear-gradient(90deg, #2196F3 0%, #21CBF3 100%)",
        },
      };
    }
  };

  const getOwnershipIndicator = () => {
    if (isOwnCalendar) {
      return {
        icon: <Edit sx={{ fontSize: 14, color: "primary.main" }} />,
        text: "My Calendar",
        color: "primary.main",
      };
    } else {
      return {
        icon: <Visibility sx={{ fontSize: 14, color: "info.main" }} />,
        text: "Viewing",
        color: "info.main",
      };
    }
  };

  const ownershipIndicator = getOwnershipIndicator();

  const ActionMenu = () => (
    <Menu
      anchorEl={menuAnchor}
      open={Boolean(menuAnchor)}
      onClose={() => setMenuAnchor(null)}
      slotProps={{
        paper: {
          sx: {
            mt: 0.5,
            borderRadius: 1,
            minWidth: 200,
            maxHeight: 400,
          },
        },
      }}
    >
      {isOwnCalendar && (
        <>
          <MenuItem sx={{ py: 1.5 }}>
            <GoogleAccountManager />
          </MenuItem>
          <Divider />
          <MenuItem sx={{ py: 1 }}>
            <CalendarManagement />
          </MenuItem>
        </>
      )}
      {!isShareCalendarPage && (
        <MenuItem sx={{ py: 1 }}>
          <CopyButton title="Share Calendar" value={shareLink} />
        </MenuItem>
      )}
      <Divider />
      <MenuItem sx={{ py: 1 }}>
        <TimeZoneSelector onTimeZoneChange={() => {}} />
      </MenuItem>
    </Menu>
  );

  if (isMobile) {
    return (
      <Box sx={{ ...getToolbarStyles(), px: 2, py: 1 }}>
        {/* Ownership indicator for mobile */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 1 }}
        >
          <Stack direction="row" alignItems="center" spacing={0.5}>
            {ownershipIndicator.icon}
            <Typography
              variant="caption"
              sx={{
                color: ownershipIndicator.color,
                fontWeight: 500,
                fontSize: "0.7rem",
              }}
            >
              {ownershipIndicator.text}
            </Typography>
            {!isOwnCalendar && calendar?.owner && (
              <UserAvatarMenu
                user_id={calendar.owner}
                sx={{
                  width: 20,
                  height: 20,
                  ml: 0.5,
                  "& .MuiAvatar-root": {
                    fontSize: "0.6rem",
                  },
                }}
              />
            )}
          </Stack>
        </Stack>

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <IconButton
              onClick={(e) => setMenuAnchor(e.currentTarget)}
              size="small"
              sx={{
                border: 1,
                borderColor: isOwnCalendar ? "divider" : "grey.300",
                backgroundColor: isOwnCalendar
                  ? "transparent"
                  : "background.paper",
                "&:hover": { backgroundColor: "action.hover" },
              }}
            >
              <MoreVert fontSize="small" />
            </IconButton>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={1}>
            <IconButton
              onClick={() => handleNavigate("PREV")}
              size="small"
              sx={{ "&:hover": { backgroundColor: "action.hover" } }}
            >
              <NavigateBefore fontSize="small" />
            </IconButton>

            <Typography
              variant="subtitle1"
              sx={{
                minWidth: 140,
                textAlign: "center",
                fontWeight: 500,
              }}
            >
              {label}
            </Typography>

            <IconButton
              onClick={() => handleNavigate("NEXT")}
              size="small"
              sx={{ "&:hover": { backgroundColor: "action.hover" } }}
            >
              <NavigateNext fontSize="small" />
            </IconButton>
          </Stack>

          <Button
            onClick={() => handleNavigate("TODAY")}
            size="small"
            variant="contained"
            sx={{
              minWidth: 60,
              textTransform: "none",
              fontWeight: 500,
            }}
          >
            Today
          </Button>
        </Stack>
        <ActionMenu />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        borderBottom: 1,
        borderColor: "divider",
        px: 3,
        py: 1.5,
        backgroundColor: "background.paper",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        {/* Left Section - Actions */}
        <Stack direction="row" spacing={1.5} alignItems="center">
          {calendar?.owner && calendar.owner !== profile?.id && (
            <UserAvatarMenu
              user_id={calendar.owner}
              sx={{
                width: 32,
                height: 32,
                "& .MuiAvatar-root": {
                  fontSize: "0.875rem",
                },
                "& .MuiTypography-root": {
                  fontSize: "0.75rem",
                },
              }}
            />
          )}
          {isOwnCalendar && (
            <>
              <GoogleAccountManager size="small" />
              <CalendarManagement />
            </>
          )}
          {!isShareCalendarPage && (
            <CopyButton title="Share Calendar" value={shareLink} />
          )}
        </Stack>

        {/* Center Section - Navigation */}
        <Stack direction="row" spacing={2} alignItems="center">
          <ButtonGroup
            size="small"
            variant="outlined"
            sx={{
              "& .MuiButton-root": {
                minWidth: 40,
                "&:hover": { backgroundColor: "action.hover" },
              },
            }}
          >
            <IconButton onClick={() => handleNavigate("PREV")} size="small">
              <NavigateBefore fontSize="small" />
            </IconButton>
            <Button
              onClick={() => handleNavigate("TODAY")}
              sx={{
                textTransform: "none",
                fontWeight: 500,
                minWidth: 60,
              }}
            >
              Today
            </Button>
            <IconButton onClick={() => handleNavigate("NEXT")} size="small">
              <NavigateNext fontSize="small" />
            </IconButton>
          </ButtonGroup>

          <Typography
            variant="h6"
            sx={{
              minWidth: 200,
              textAlign: "center",
              fontWeight: 600,
              color: "text.primary",
            }}
          >
            {label}
          </Typography>
        </Stack>

        {/* Right Section - Views & Settings */}
        <Stack direction="row" spacing={1.5} alignItems="center">
          {views.length > 1 && (
            <ButtonGroup
              size="small"
              sx={{
                "& .MuiButton-root": {
                  textTransform: "capitalize",
                  fontWeight: 500,
                  minWidth: 65,
                  px: 1.5,
                },
              }}
            >
              {views.map((name: string) => (
                <Button
                  key={name}
                  onClick={() => onView(name)}
                  variant={view === name ? "contained" : "outlined"}
                >
                  {name}
                </Button>
              ))}
            </ButtonGroup>
          )}
          <TimeZoneSelector onTimeZoneChange={() => {}} />
        </Stack>
      </Stack>
    </Box>
  );
};

export default CustomToolbar;
