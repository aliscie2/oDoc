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
} from "@mui/material";
import { useState } from "react";
import { useSelector } from "react-redux";
import CalendarManagement from "./AvailabilityComonent";

import CopyButton from "@/components/MuiComponents/copyButton";
import {
  MoreVert,
  NavigateBefore,
  NavigateNext,
  Today,
} from "@mui/icons-material";
import GmailConnection from "./GmailConnection";
import GoogleCalendarIntegration from "./googleAccounts";
import TimeZoneSelector from "./timezone";

const CustomToolbar = ({ onNavigate, onView, label, view, views }) => {
  const { calendar } = useSelector((state) => state.calendarState);
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));

  const [menuAnchor, setMenuAnchor] = useState(null);

  const handleNavigate = (action) => {
    onNavigate(action);
    setMenuAnchor(null);
  };

  const isShareCalendarPage =
    window.location.pathname === "/calendar" &&
    window.location.search.includes("id=");
  const shareLink = `${window.location.origin}/calendar?id=${calendar?.id}`;

  const ActionMenu = () => (
    <Menu
      anchorEl={menuAnchor}
      open={Boolean(menuAnchor)}
      onClose={() => setMenuAnchor(null)}
      PaperProps={{ sx: { mt: 0.5, borderRadius: 1, minWidth: 160 } }}
    >
      <MenuItem sx={{ py: 0.5 }}>
        <TimeZoneSelector />
      </MenuItem>
      <Divider />
      {!isShareCalendarPage && (
        <MenuItem sx={{ py: 0.5 }}>
          <CopyButton title="Share" value={shareLink} />
        </MenuItem>
      )}
      <MenuItem sx={{ py: 0.5 }}>
        <CalendarManagement />
      </MenuItem>
      <MenuItem sx={{ py: 0.5 }}>
        <GoogleCalendarIntegration />
      </MenuItem>
      <MenuItem sx={{ py: 0.5 }}>
        <GmailConnection />
      </MenuItem>
    </Menu>
  );

  if (isMobile) {
    return (
      <Box sx={{ borderBottom: 1, borderColor: "divider", px: 1, py: 0.5 }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <IconButton
            onClick={(e) => setMenuAnchor(e.currentTarget)}
            size="small"
          >
            <MoreVert fontSize="small" />
          </IconButton>

          <Stack direction="row" alignItems="center" spacing={0.5}>
            <IconButton onClick={() => handleNavigate("PREV")} size="small">
              <NavigateBefore fontSize="small" />
            </IconButton>
            <Typography
              variant="subtitle2"
              sx={{ minWidth: 120, textAlign: "center" }}
            >
              {label}
            </Typography>
            <IconButton onClick={() => handleNavigate("NEXT")} size="small">
              <NavigateNext fontSize="small" />
            </IconButton>
          </Stack>

          <IconButton
            onClick={() => handleNavigate("TODAY")}
            size="small"
            sx={{ bgcolor: "primary.main", color: "primary.contrastText" }}
          >
            <Today fontSize="small" />
          </IconButton>

          <ActionMenu />
        </Stack>
      </Box>
    );
  }

  return (
    <Box sx={{ borderBottom: 1, borderColor: "divider", px: 2, py: 0.5 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack direction="row" spacing={0.5}>
          {!isShareCalendarPage && (
            <CopyButton title="Share" value={shareLink} size="small" />
          )}
          <CalendarManagement size="small" />
          <GoogleCalendarIntegration size="small" />
          <GmailConnection size="small" />
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          <ButtonGroup size="small">
            <IconButton onClick={() => handleNavigate("PREV")} size="small">
              <NavigateBefore fontSize="small" />
            </IconButton>
            <IconButton onClick={() => handleNavigate("TODAY")} size="small">
              <Today fontSize="small" />
            </IconButton>
            <IconButton onClick={() => handleNavigate("NEXT")} size="small">
              <NavigateNext fontSize="small" />
            </IconButton>
          </ButtonGroup>

          <Typography
            variant="subtitle1"
            sx={{ minWidth: 150, textAlign: "center" }}
          >
            {label}
          </Typography>
        </Stack>

        <Stack direction="row" spacing={0.5} alignItems="center">
          {views.length > 1 && (
            <ButtonGroup size="small">
              {views.map((name) => (
                <Button
                  key={name}
                  onClick={() => onView(name)}
                  variant={view === name ? "contained" : "outlined"}
                  sx={{ textTransform: "capitalize", py: 0.25, px: 1 }}
                  size="small"
                >
                  {name}
                </Button>
              ))}
            </ButtonGroup>
          )}
          <TimeZoneSelector size="small" />
        </Stack>
      </Stack>
    </Box>
  );
};

export default CustomToolbar;
