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
} from "@mui/icons-material";
import GoogleAccountManager from "./GoogleAccountManager";
import TimeZoneSelector from "./timezone";

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
    } | null;
  };
}

const CustomToolbar: React.FC<CustomToolbarProps> = ({ 
  onNavigate, 
  onView, 
  label, 
  view, 
  views 
}) => {
  const { calendar } = useSelector((state: RootState) => state.calendarState);
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
          }
        }
      }}
    >
      <MenuItem sx={{ py: 1.5 }}>
        <GoogleAccountManager />
      </MenuItem>
      <Divider />
      <MenuItem sx={{ py: 1 }}>
        <CalendarManagement />
      </MenuItem>
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
      <Box sx={{ 
        borderBottom: 1, 
        borderColor: "divider", 
        px: 2, 
        py: 1,
        backgroundColor: "background.paper",
      }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <IconButton
            onClick={(e) => setMenuAnchor(e.currentTarget)}
            size="small"
            sx={{ 
              border: 1, 
              borderColor: "divider",
              "&:hover": { backgroundColor: "action.hover" }
            }}
          >
            <MoreVert fontSize="small" />
          </IconButton>

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
    <Box sx={{ 
      borderBottom: 1, 
      borderColor: "divider", 
      px: 3, 
      py: 1.5,
      backgroundColor: "background.paper",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        {/* Left Section - Actions */}
        <Stack direction="row" spacing={1.5} alignItems="center">
          <GoogleAccountManager size="small" />
          <CalendarManagement />
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
                "&:hover": { backgroundColor: "action.hover" }
              }
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
                }
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
