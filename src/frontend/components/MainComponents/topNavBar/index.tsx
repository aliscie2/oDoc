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
import HomeIcon from "@mui/icons-material/Home";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import ReceiptIcon from "@mui/icons-material/Receipt";

import BreadPage from "@/components/MuiComponents/Breadcrumbs";
import BasicMenu from "@/components/MuiComponents/BasicMenu";
import ShareButton from "@/components/MuiComponents/CopyLink";
import NotificationsButton from "@/components/NotifcationList";
import MultiSaveButton from "@/components/Actions/MultiSave";
import ChatsComponent from "@/components/Chat";
import WorkspaceManager from "../Workspaces";
import LoginButton from "./loginButton";

import { useBackendContext } from "@/contexts/BackendContext";
import { convertToBlobLink } from "@/DataProcessing/imageToVec";

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

  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const { isNavOpen, isDarkMode, isFetching, isLoggedIn, searchTool } =
    useSelector((state) => state.uiState);
  const { profile, profile_history, current_file } = useSelector(
    (state) => state.filesState,
  );

  const imageLink = profile ? convertToBlobLink(profile.photo) : "";

  useEffect(() => {
    if (!isMobile) return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setShowMobileMenu(currentScrollY < lastScrollY || currentScrollY < 10);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY, isMobile]);

  const handleMobileMenuToggle = (event) => {
    setMobileMenuAnchor(event ? event.currentTarget : null);
  };

  const handleLogout = async () => {
    logout();
    dispatch({ type: "LOGOUT" });
    navigate("/");
  };

  const loggedInMenuOptions = [
    { content: "Profile", to: "/profile", icon: <Person2Icon /> },
    { content: "Contracts", to: "/contracts", icon: <GavelIcon /> },
    { content: "Wallet", to: "/wallet", icon: <AccountBalanceWalletIcon /> },
    { content: "Affiliate", to: "/affiliate", icon: <HandshakeIcon /> },
    { content: "Logout", to: "/", icon: <LogoutIcon />, onClick: handleLogout },
  ];

  const guestActions = [
    { label: "Home", to: "/", icon: <HomeIcon /> },
    {
      label: isDarkMode ? "Light Mode" : "Dark Mode",
      icon: isDarkMode ? <LightModeIcon /> : <DarkModeIcon />,
      onClick: () => dispatch({ type: "TOGGLE_DARK" }),
    },
    { label: "White Paper", to: "/white_paper", icon: <ReceiptIcon /> },
  ];

  const renderLoggedInButtons = () => (
    <>
      {location.pathname !== "/" && location.pathname !== "" && (
        <BottomNavigationAction
          label="Home"
          icon={<HomeIcon />}
          onClick={() => navigate("/")}
          sx={{ minWidth: 0, flex: 1 }}
        />
      )}
      <BottomNavigationAction
        label="Notifications"
        icon={<NotificationsButton isMobile={true} />}
        sx={{ minWidth: 0, flex: 1 }}
      />
      <BottomNavigationAction
        label="Chat"
        icon={<ChatsComponent isMobile={true} />}
        sx={{ minWidth: 0, flex: 1 }}
      />
      <BottomNavigationAction
        label="Profile"
        icon={
          <EnhancedUserAvatar
            actions_rate={profile_history?.actions_rate ?? 0}
            photo={imageLink}
            style={{ width: 20, height: 20 }}
          />
        }
        onClick={handleMobileMenuToggle}
        sx={{ minWidth: 0, flex: 1 }}
      />
      <MultiSaveButton />
    </>
  );

  const renderGuestButtons = () => (
    <>
      {location.pathname !== "/" && location.pathname !== "" && (
        <BottomNavigationAction
          label="Home"
          icon={<HomeIcon />}
          onClick={() => navigate("/")}
          sx={{ minWidth: 0, flex: 1 }}
        />
      )}
      {guestActions.slice(1).map((action, index) => (
        <BottomNavigationAction
          key={index}
          label={action.label}
          icon={action.icon}
          onClick={() => {
            if (action.onClick) action.onClick();
            if (action.to) navigate(action.to);
          }}
          sx={{ minWidth: 0, flex: 1 }}
        />
      ))}
      <BottomNavigationAction
        label="Get Started"
        icon={<LoginButton isMobile={true} />}
        sx={{
          minWidth: 0,
          flex: location.pathname === "/" || location.pathname === "" ? 2 : 1.5,
          "& .MuiBottomNavigationAction-label": {
            fontSize: "0.85rem",
            fontWeight: 600,
            whiteSpace: "nowrap",
          },
        }}
      />
    </>
  );

  const renderMobileContent = () => (
    <>
      {isLoggedIn && showMobileMenu && (
        <IconButton
          sx={{
            position: "fixed",
            top: 16,
            left: 16,
            zIndex: 1300,
            backgroundColor: alpha(theme.palette.background.paper, 0.9),
            backdropFilter: "blur(10px)",
            boxShadow: theme.shadows[2],
            "&:hover": {
              backgroundColor: alpha(theme.palette.background.paper, 0.95),
            },
          }}
          onClick={() => dispatch({ type: "TOGGLE_NAV" })}
        >
          {isNavOpen ? <MenuOpenIcon /> : <MenuIcon />}
        </IconButton>
      )}

      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1200,
          borderRadius: 0,
          overflow: "hidden",
        }}
      >
        <Paper elevation={3} sx={{ borderRadius: 0 }}>
          <BottomNavigation
            sx={{ borderRadius: 0 }}
            showLabels
            value={location.pathname}
          >
            {isLoggedIn ? renderLoggedInButtons() : renderGuestButtons()}
          </BottomNavigation>

          <Menu
            anchorEl={mobileMenuAnchor}
            open={Boolean(mobileMenuAnchor)}
            onClose={() => handleMobileMenuToggle(null)}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
            transformOrigin={{ vertical: "bottom", horizontal: "center" }}
          >
            {loggedInMenuOptions.map((option, index) => (
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
        </Paper>
      </Box>
    </>
  );

  const renderDesktopContent = () => (
    <Toolbar
      variant="dense"
      sx={{ ...styles.toolbar, ...(isNavOpen && styles.toolbarShift) }}
    >
      <Box sx={{ display: "flex", alignItems: "center" }}>
        {isLoggedIn && (
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => dispatch({ type: "TOGGLE_NAV" })}
            sx={styles.iconButton}
          >
            {isNavOpen ? <MenuOpenIcon /> : <MenuIcon />}
          </IconButton>
        )}

        {!isLoggedIn && (
          <>
            <Tooltip title="Toggle Theme">
              <IconButton
                color="inherit"
                onClick={() => dispatch({ type: "TOGGLE_DARK" })}
                sx={styles.iconButton}
              >
                {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip title="White Paper">
              <IconButton
                color="inherit"
                onClick={() => navigate("/white_paper")}
                sx={styles.iconButton}
              >
                <ReceiptIcon />
              </IconButton>
            </Tooltip>
          </>
        )}

        <Routes>
          <Route path="*" element={<BreadPage />} />
        </Routes>
        {isLoggedIn && (
          <ShareButton fileId={current_file?.id} currentFile={current_file} />
        )}
      </Box>

      <Box sx={{ flexGrow: 1, mx: 2 }}>
        {isLoggedIn && (
          <Tooltip title={'You can press "Command+F"'} placement="top">
            <IconButton
              color="inherit"
              onClick={() => dispatch({ type: "SEARCH_TOOL" })}
              sx={styles.iconButton}
            >
              {searchTool ? <CloseIcon /> : <SearchIcon />}
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {isLoggedIn ? (
          <>
            {location.pathname !== "/" && location.pathname !== "" && (
              <IconButton
                color="inherit"
                onClick={() => navigate("/")}
                sx={styles.iconButton}
              >
                <HomeIcon />
              </IconButton>
            )}
            <NotificationsButton />
            <ChatsComponent />
            <WorkspaceManager />
            <BasicMenu options={loggedInMenuOptions}>
              <EnhancedUserAvatar
                actions_rate={profile_history?.actions_rate ?? 0}
                photo={imageLink}
                style={{ width: 24, height: 24 }}
              />
            </BasicMenu>
            <MultiSaveButton />
          </>
        ) : (
          <LoginButton />
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
          borderRadius: 0,
        }}
      >
        {isFetching && <LinearProgress />}
        {renderDesktopContent()}
      </AppBar>
      {isMobile && renderMobileContent()}
    </>
  );
}
