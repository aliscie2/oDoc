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
import { NavigateBefore, NavigateNext, MoreVert } from "@mui/icons-material";
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
  const { calendar, sharedCalendar } = useSelector(
    (state: unknown) => state.calendarState,
  );
  const { profile } = useSelector((state: unknown) => state.filesState);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

  const isShareCalendarPage =
    window.location.pathname === "/share_calendar" &&
    window.location.search.includes("id=");
  const displayCalendar = isShareCalendarPage ? sharedCalendar : calendar;
  const isOwnCalendar =
    !isShareCalendarPage &&
    (!displayCalendar?.owner || displayCalendar.owner === profile?.id);
  const shouldShowOwnerAvatar =
    isShareCalendarPage &&
    sharedCalendar?.owner &&
    sharedCalendar.owner !== profile?.id;

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) =>
    setMenuAnchor(event.currentTarget);
  const handleMenuClose = () => setMenuAnchor(null);

  if (isMobile) {
    return (
      <Box
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          px: 2,
          py: 1.5,
          backgroundColor: "background.paper",
          color: "text.primary",
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={1}
        >
          <Box
            sx={{ width: 80, display: "flex", justifyContent: "flex-start" }}
          >
            <Stack direction="row" spacing={0.5}>
              <IconButton onClick={handleMenuOpen} size="medium">
                <MoreVert />
              </IconButton>
              {isOwnCalendar && calendar?.id && (
                <ShareCalendarButton variant="button" />
              )}
            </Stack>
          </Box>

          <Stack
            direction="row"
            alignItems="center"
            spacing={1.5}
            sx={{ flex: 1, justifyContent: "center" }}
          >
            <IconButton onClick={() => onNavigate("PREV")} size="medium">
              <NavigateBefore />
            </IconButton>
            <Typography
              variant="subtitle1"
              sx={{
                minWidth: 140,
                textAlign: "center",
                fontWeight: 600,
                fontSize: "1rem",
              }}
            >
              {label}
            </Typography>
            <IconButton onClick={() => onNavigate("NEXT")} size="medium">
              <NavigateNext />
            </IconButton>
          </Stack>

          <Box sx={{ width: 80, display: "flex", justifyContent: "flex-end" }}>
            <Button
              onClick={() => onNavigate("TODAY")}
              variant="contained"
              sx={{
                minWidth: 70,
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.875rem",
              }}
            >
              Today
            </Button>
          </Box>
        </Stack>

        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleMenuClose}
          slotProps={{
            paper: { sx: { mt: 0.5, borderRadius: 1, minWidth: 200 } },
          }}
        >
          {shouldShowOwnerAvatar && (
            <>
              <MenuItem sx={{ py: 1.5 }}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <UserAvatarMenu
                    user_id={sharedCalendar.owner}
                    sx={{ width: 32, height: 32 }}
                  />
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontWeight: 500 }}
                  >
                    Viewing shared calendar
                  </Typography>
                </Stack>
              </MenuItem>
              <Divider />
            </>
          )}

          <MenuItem onClick={handleMenuClose} sx={{ py: 1.5 }}>
            <GoogleAccountManager
              size="small"
              isSharedCalendar={!isOwnCalendar}
            />
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleMenuClose} sx={{ py: 1.5 }}>
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
        boxShadow:
          theme.palette.mode === "dark"
            ? "0 1px 3px rgba(0,0,0,0.3)"
            : "0 1px 3px rgba(0,0,0,0.1)",
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack direction="row" spacing={1.5} alignItems="center">
          <GoogleAccountManager
            size="small"
            isSharedCalendar={!isOwnCalendar}
          />
          <AvailabilityManager />

          {isOwnCalendar && calendar?.id && (
            <ShareCalendarButton variant="button" />
          )}
        </Stack>

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
