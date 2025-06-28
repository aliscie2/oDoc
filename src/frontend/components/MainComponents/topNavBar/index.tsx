import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  alpha,
  AppBar,
  BottomNavigation,
  BottomNavigationAction,
  Box,
  IconButton,
  LinearProgress,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Toolbar,
  Tooltip,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import {
  AccountBalanceWallet as AccountBalanceWalletIcon,
  Close as CloseIcon,
  DarkMode as DarkModeIcon,
  Gavel as GavelIcon,
  LightMode as LightModeIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  MenuOpen as MenuOpenIcon,
  Person2 as Person2Icon,
  Search as SearchIcon,
  Handshake as HandshakeIcon,
} from "@mui/icons-material";

import { Route, Routes, useLocation, useNavigate } from "react-router-dom";

import BreadPage from "../../MuiComponents/Breadcrumbs";
import BasicMenu from "../../MuiComponents/BasicMenu";
import ShareButton from "../../MuiComponents/CopyLink";
import NotificationsButton from "../../NotifcationList";
import MultiSaveButton from "../../Actions/MultiSave";
import ChatsComponent from "../../Chat";
import WorkspaceManager from "../Workspaces";
import LoginButton from "./loginButton";

import { useBackendContext } from "../../../contexts/BackendContext";
import { convertToBlobLink } from "../../../DataProcessing/imageToVec";
import { Z_INDEX_TOP_NAVBAR } from "../../../constants/zIndex";
import { RootState } from "../../../redux/reducers";
import getStyles from "./styles";
import EnhancedUserAvatar from "./EnhancedUserAvatar";

export default function TopNavBar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const commonIconStyles = {
    transition: theme.transitions.create(["color", "background-color"], {
      duration: theme.transitions.duration.shorter,
    }),
    color: theme.palette.text.primary,
    "&:hover": {
      backgroundColor: alpha(theme.palette.primary.main, 0.08),
    },
  };

  const styles = {
    ...getStyles(theme),
    mobileIcon: {
      ...commonIconStyles,
      fontSize: "1.5rem",
    },
    desktopIcon: {
      ...commonIconStyles,
      fontSize: "1.2rem",
    },
  };
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { logout, backendActor } = useBackendContext();

  const [mobileMenuAnchor, setMobileMenuAnchor] = useState<null | HTMLElement>(
    null,
  );
  const [mobileNotificationAnchor, setMobileNotificationAnchor] =
    useState<null | HTMLElement>(null);

  const { isNavOpen, isDarkMode, isFetching, isLoggedIn, searchTool } =
    useSelector((state: RootState) => state.uiState);

  const { profile, profile_history, current_file } = useSelector(
    (state: RootState) => state.filesState,
  );

  const handleMobileMenuToggle = (
    event: React.MouseEvent<HTMLElement> | null,
  ) => {
    setMobileMenuAnchor(event ? event.currentTarget : null);
  };

  const handleMobileNotificationToggle = (
    event: React.MouseEvent<HTMLElement> | null,
  ) => {
    setMobileNotificationAnchor(event ? event.currentTarget : null);
  };

  const imageLink = profile ? convertToBlobLink(profile.photo) : "";

  const handleLogout = async () => {
    logout();
    dispatch({ type: "LOGOUT" });
    navigate("/");
  };

  const menuOptions = [
    { content: "Profile", to: "/profile", icon: <Person2Icon /> },
    { content: "Contracts", to: "/contracts", icon: <GavelIcon /> },
    { content: "Wallet", to: "/wallet", icon: <AccountBalanceWalletIcon /> },
    { content: "Affiliate", to: "/affiliate", icon: <HandshakeIcon /> },
    { content: "Logout", to: "/", icon: <LogoutIcon />, onClick: handleLogout },
  ];

  // Render action buttons when user is logged in
  const renderActionButtons = () => {
    if (!isLoggedIn) return null;

    if (isMobile) {
      return (
        <>
          <BottomNavigationAction
            label="Notifications"
            icon={<NotificationsButton isMobile={true} />}
          />
          <BottomNavigationAction
            label="Chat"
            icon={<ChatsComponent isMobile={true} />}
          />
          <BottomNavigationAction
            label="Profile"
            icon={
              <EnhancedUserAvatar
                actions_rate={profile_history?.actions_rate ?? 0}
                photo={imageLink}
                style={{ width: 24, height: 24 }}
              />
            }
            onClick={handleMobileMenuToggle}
          />
          <MultiSaveButton />
        </>
      );
    }

    return (
      <>
        <NotificationsButton />
        <ChatsComponent />
        <WorkspaceManager />
        <BasicMenu options={menuOptions}>
          <EnhancedUserAvatar
            actions_rate={profile_history?.actions_rate ?? 0}
            photo={imageLink}
            style={{ width: 24, height: 24 }}
          />
        </BasicMenu>
        <MultiSaveButton />
      </>
    );
  };

  const renderMobileContent = () => (
    <Box
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: Z_INDEX_TOP_NAVBAR + 1,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        overflow: "hidden",
      }}
    >
      <Paper elevation={3}>
        <BottomNavigation
          sx={styles.mobileNavigation}
          showLabels
          value={location.pathname}
        >
          <BottomNavigationAction
          name='toggleNavbar'
            label="Menu"
            icon={isNavOpen ? <MenuOpenIcon /> : <MenuIcon />}
            onClick={() => dispatch({ type: "TOGGLE_NAV" })}
          />

          {isLoggedIn ? renderActionButtons() : <LoginButton isMobile={true} />}
        </BottomNavigation>

        <Menu
          anchorEl={mobileMenuAnchor}
          open={Boolean(mobileMenuAnchor)}
          onClose={() => handleMobileMenuToggle(null)}
          PaperProps={{ sx: styles.menuPaper }}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          transformOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          {menuOptions.map((option, index) => (
            <MenuItem
              key={index}
              onClick={() => {
                handleMobileMenuToggle(null);
                if (option.onClick) option.onClick();
                if (option.to) navigate(option.to);
              }}
            >
              <ListItemIcon>{option.icon}</ListItemIcon>
              <ListItemText primary={option.content} />
            </MenuItem>
          ))}
        </Menu>

        <Menu
          anchorEl={mobileNotificationAnchor}
          open={Boolean(mobileNotificationAnchor)}
          onClose={() => handleMobileNotificationToggle(null)}
          PaperProps={{
            sx: {
              ...styles.menuPaper,
              width: "300px",
            },
          }}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          transformOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <NotificationsButton />
        </Menu>
      </Paper>
    </Box>
  );

  const renderDesktopContent = () => (
    <Toolbar
      variant="dense"
      sx={{
        ...styles.toolbar,
        ...(isNavOpen && styles.toolbarShift),
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <IconButton
          role='toggleNav'
          className="toggleNav"
          edge="start"
          color="inherit"
          onClick={() => dispatch({ type: "TOGGLE_NAV" })}
          sx={styles.iconButton}
        >
          {isNavOpen ? <MenuOpenIcon /> : <MenuIcon   />}
        </IconButton>
        <Routes>
          <Route path="*" element={<BreadPage />} />
        </Routes>
        <ShareButton fileId={current_file?.id} currentFile={current_file} />
      </Box>

      <Box sx={{ flexGrow: 1, mx: 2 }}>
        <Tooltip title={'You can press "Command+F"'} placement="top">
          <IconButton
            color="inherit"
            onClick={() => dispatch({ type: "SEARCH_TOOL" })}
            sx={styles.iconButton}
          >
            {searchTool ? <CloseIcon /> : <SearchIcon />}
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {isLoggedIn ? (
          renderActionButtons()
        ) : (
          <LoginButton  />
        )}
      </Box>
    </Toolbar>
  );

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          ...styles.appBar,
          display: isMobile ? "none" : "block",
        }}
      >
        {isFetching && <LinearProgress />}
        {renderDesktopContent()}
      </AppBar>
      {isMobile && renderMobileContent()}
    </>
  );
}
