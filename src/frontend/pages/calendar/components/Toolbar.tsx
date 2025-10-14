// Calendar Toolbar Component
import React, { useState } from "react";
import {
  Box,
  Button,
  ButtonGroup,
  IconButton,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
  Menu,
  MenuItem,
  Divider,
} from "@mui/material";
import { useSelector } from "react-redux";
import {
  NavigateBefore,
  NavigateNext,
  MoreVert,
} from "@mui/icons-material";
import GoogleAccountManager from "./GoogleAccountManager";
import AvailabilityManager from "./AvailabilityManager";
import TimezoneDisplay from "./TimezoneDisplay";
import ShareCalendarButton from "./ShareCalendarButton";
import UserAvatarMenu from "@/components/MainComponents/UserAvatarMenu";

interface ToolbarProps {
  onNavigate: (action: string) => void;
  onView: (view: string) => void;
  label: string;
  view: string;
  views: string[];
}

const Toolbar: React.FC<ToolbarProps> = ({
  onNavigate,
  onView,
  label,
  view,
  views,
}) => {
  const { calendar } = useSelector((state: unknown) => state.calendarState);
  const { profile } = useSelector((state: unknown) => state.filesState);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

  const isShareCalendarPage =
    window.location.pathname === "/calendar" &&
    window.location.search.includes("id=");

  const isOwnCalendar =
    !isShareCalendarPage &&
    (!calendar?.owner || calendar.owner === profile?.id);

  const shareLink = `${window.location.origin}/calendar?id=${calendar?.id}`;

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  if (isMobile) {
    return (
      <Box
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          px: 2,
          py: 1,
          backgroundColor: "background.paper",
          color: "text.primary",
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <IconButton onClick={handleMenuOpen} size="small">
              <MoreVert fontSize="small" />
            </IconButton>
            {!isShareCalendarPage && calendar?.id && (
              <ShareCalendarButton shareLink={shareLink} variant="icon" size="small" />
            )}
          </Stack>

          <Stack direction="row" alignItems="center" spacing={1}>
            <IconButton onClick={() => onNavigate("PREV")} size="small">
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

            <IconButton onClick={() => onNavigate("NEXT")} size="small">
              <NavigateNext fontSize="small" />
            </IconButton>
          </Stack>

          <Button
            onClick={() => onNavigate("TODAY")}
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

        {/* Mobile Menu */}
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleMenuClose}
          slotProps={{
            paper: {
              sx: {
                mt: 0.5,
                borderRadius: 1,
                minWidth: 200,
              },
            },
          }}
        >
          {!isOwnCalendar && calendar?.owner && (
            <>
              <MenuItem sx={{ py: 1, display: "flex", alignItems: "center", gap: 1 }}>
                <UserAvatarMenu
                  user_id={calendar.owner}
                  sx={{
                    width: 24,
                    height: 24,
                    "& .MuiAvatar-root": {
                      fontSize: "0.75rem",
                    },
                  }}
                />
                <Typography variant="caption" color="text.secondary">
                  📅 Viewing shared calendar
                </Typography>
              </MenuItem>
              <Divider />
            </>
          )}
          
          <MenuItem onClick={handleMenuClose} sx={{ py: 1.5 }}>
            <GoogleAccountManager size="small" isSharedCalendar={!isOwnCalendar} />
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleMenuClose} sx={{ py: 1 }}>
            <AvailabilityManager />
          </MenuItem>
        </Menu>
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
        color: "text.primary",
        boxShadow: theme.palette.mode === 'dark' 
          ? "0 1px 3px rgba(0,0,0,0.3)" 
          : "0 1px 3px rgba(0,0,0,0.1)",
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        {/* Left Section */}
        <Stack direction="row" spacing={1.5} alignItems="center">
          {!isOwnCalendar && calendar?.owner && (
            <>
              <UserAvatarMenu
                user_id={calendar.owner}
                sx={{
                  width: 32,
                  height: 32,
                  "& .MuiAvatar-root": {
                    fontSize: "0.875rem",
                  },
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  fontStyle: "italic",
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                📅 Viewing shared calendar
              </Typography>
            </>
          )}
          
          <GoogleAccountManager size="small" isSharedCalendar={!isOwnCalendar} />
          <AvailabilityManager />
          
          {isOwnCalendar && !isShareCalendarPage && calendar?.id && (
            <ShareCalendarButton shareLink={shareLink} variant="button" size="small" />
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
              },
            }}
          >
            <IconButton onClick={() => onNavigate("PREV")} size="small">
              <NavigateBefore fontSize="small" />
            </IconButton>
            <Button
              onClick={() => onNavigate("TODAY")}
              sx={{
                textTransform: "none",
                fontWeight: 500,
                minWidth: 60,
              }}
            >
              Today
            </Button>
            <IconButton onClick={() => onNavigate("NEXT")} size="small">
              <NavigateNext fontSize="small" />
            </IconButton>
          </ButtonGroup>

          <Typography
            variant="h6"
            sx={{
              minWidth: 200,
              textAlign: "center",
              fontWeight: 600,
            }}
          >
            {label}
          </Typography>
        </Stack>

        {/* Right Section - Views */}
        <Stack direction="row" spacing={1.5} alignItems="center">
          <TimezoneDisplay />
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
        </Stack>
      </Stack>
    </Box>
  );
};

export default Toolbar;
