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
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  AccountBalanceWallet as AccountBalanceWalletIcon,
  CalendarToday as CalendarIcon,
  DarkMode as DarkModeIcon,
  Handshake as HandshakeIcon,
  LightMode as LightModeIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  MenuOpen as MenuOpenIcon,
  Person2 as Person2Icon,
} from "@mui/icons-material";
import GradeIcon from "@mui/icons-material/Grade";
import ReceiptIcon from "@mui/icons-material/Receipt";

import { Route, Routes, useLocation, useNavigate } from "react-router-dom";

import MultiSaveButton from "@/components/Actions/MultiSave";
import ChatsComponent from "@/components/Chat";
import BasicMenu from "@/components/MuiComponents/BasicMenu";
import BreadPage from "@/components/MuiComponents/Breadcrumbs";
import ShareButton from "@/components/MuiComponents/CopyLink";
import NotificationsButton from "@/components/NotifcationList";
import WorkspaceManager from "../Workspaces";
import EnhancedUserAvatar from "./EnhancedUserAvatar";
import LoginButton from "./loginButton";
import ActivityLevelIcon from "./ActivityLevelIcon";

import { useAuth } from "@/hooks/useAuth";
import { logout } from "@/utils/backendUtils";
import getStyles from "./styles";

// Configuration-driven navigation - optimized for robustness
const NAV_CONFIG = {
  mobile: {
    loggedIn: ["notifications", "chat", "profile"],
    loggedOut: ["login"],
    registered: ["notifications", "chat", "profile"],
    unregistered: ["profile"],
    nullRegistered: [],
  },
  desktop: {
    loggedIn: ["notifications", "chat", "profile"],
    loggedOut: ["theme", "whitepaper", "login"],
    registered: ["notifications", "chat", "profile"],
    unregistered: ["theme", "whitepaper", "profile"],
    nullRegistered: ["theme", "whitepaper"],
  },
} as const;

// Special case items that need dynamic conditions
const CONDITIONAL_ITEMS = {
  notifications: (state) => state.notifications.length > 0,
};

// Profile menu configuration based on registration status
const getProfileMenuConfig = (isRegistered) => {
  if (isRegistered === false) {
    return [{ content: "Logout", to: "/", icon: LogoutIcon, action: "logout" }];
  }
  if (isRegistered === null) {
    return [];
  }
  return [
    { content: "Profile", to: "/profile", icon: Person2Icon },
    { content: "Wallet", to: "/wallet", icon: AccountBalanceWalletIcon },
    { content: "Affiliate", to: "/affiliate", icon: HandshakeIcon },
    { content: "Achievements", to: "/achievementCard", icon: GradeIcon },
    { content: "Logout", to: "/", icon: LogoutIcon, action: "logout" },
  ];
};

// Custom hook for navigation state management
const useNavigationState = () => {
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { isNavOpen, isDarkMode, isFetching, authStatus } = useSelector(
    (state) => state.uiState,
  );
  const isLoggedIn =
    authStatus === "authenticated" || authStatus === "registered";
  const { notifications } = useSelector((state) => state.notificationState);

  const currentPath = location.pathname;
  const isHomePage = currentPath === "/" || currentPath === "";

  return {
    location,
    theme,
    isMobile,
    currentPath,
    isHomePage,
    isNavOpen,
    isDarkMode,
    isFetching,
    isLoggedIn,
    authStatus,
    notifications,
  };
};

// Navigation item factory
const createNavItem = (key, config, state, handlers) => {
  const itemConfigs = {
    theme: {
      label: state.isDarkMode ? "Light Mode" : "Dark Mode",
      icon: state.isDarkMode ? <LightModeIcon /> : <DarkModeIcon />,
      onClick: () => handlers.dispatch({ type: "TOGGLE_DARK" }),
    },
    whitepaper: {
      label: "White Paper",
      icon: <ReceiptIcon />,
      onClick: () => handlers.navigate("/white_paper"),
    },
    calendar: {
      label: "Calendar",
      icon: <CalendarIcon />,
      onClick: () => handlers.navigate("/calendar"),
    },
    notifications: {
      label: "Notifications",
      icon: <NotificationsButton />,
      component: true,
    },
    chat: {
      label: "Chat",
      icon: <ChatsComponent />,
      component: true,
    },
    profile: {
      label: "Profile",
      icon: (
        <EnhancedUserAvatar
          photo={state.imageLink}
          style={{
            width: state.isMobile ? 28 : 34,
            height: state.isMobile ? 28 : 34,
          }}
        />
      ),
      onClick: state.isMobile ? handlers.onProfileClick : null,
      menu: !state.isMobile ? handlers.profileMenuOptions : null,
    },
    login: {
      icon: <LoginButton isMobile={state.isMobile} />,
      component: true,
      flex: state.isHomePage ? 2 : 1.5,
    },
  };

  return {
    key,
    ...itemConfigs[key],
    ...config,
  };
};

// Main navigation component
export default function TopNavBar() {
  const { authStatus } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isRegistered = authStatus === "registered";
  const state = useNavigationState();
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);

  const { profile, profile_history, current_file } = useSelector(
    (state) => state.filesState,
  );

  const imageLinkRef = React.useRef(null);
  const imageLink = useMemo(() => {
    if (!profile?.photo) {
      if (imageLinkRef.current?.url) {
        URL.revokeObjectURL(imageLinkRef.current.url);
        imageLinkRef.current = null;
      }
      return "";
    }
    if (imageLinkRef.current?.photo === profile.photo) {
      return imageLinkRef.current.url;
    }
    if (imageLinkRef.current?.url) {
      URL.revokeObjectURL(imageLinkRef.current.url);
    }
    const url = profile.photo;
    imageLinkRef.current = { photo: profile.photo, url };
    return url;
  }, [profile?.photo]);

  useEffect(() => {
    return () => {
      if (imageLinkRef.current?.url) {
        URL.revokeObjectURL(imageLinkRef.current.url);
      }
    };
  }, []);

  const styles = useMemo(() => getStyles(state.theme), [state.theme]);

  const handleLogout = async () => {
    try {
      await logout();
      dispatch({ type: "LOGOUT" });
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const profileMenuOptions = useMemo(() => {
    return getProfileMenuConfig(isRegistered).map((option) => ({
      ...option,
      icon:
        option.content === "Achievements" ? (
          <Box sx={{ mr: 1, display: "flex", alignItems: "center" }}>
            <ActivityLevelIcon
              level={profile_history?.actions_rate ?? 0}
              size={24}
            />
          </Box>
        ) : (
          <option.icon
            sx={{ color: state.theme.palette.text.primary, mr: 1 }}
          />
        ),
      onClick: option.action === "logout" ? handleLogout : undefined,
    }));
  }, [
    isRegistered,
    profile_history?.actions_rate,
    state.theme.palette.text.primary,
  ]);

  const handlers = useMemo(
    () => ({
      dispatch,
      navigate,
      onProfileClick: (e) => setMobileMenuAnchor(e.currentTarget),
      profileMenuOptions,
    }),
    [dispatch, navigate, profileMenuOptions],
  );

  const getNavItems = () => {
    const context = state.isMobile ? "mobile" : "desktop";
    let authState;
    if (!state.isLoggedIn) {
      authState = "loggedOut";
    } else if (authStatus === "authenticated") {
      authState = "unregistered";
    } else if (authStatus === "registered") {
      authState = "registered";
    } else {
      authState = "nullRegistered";
    }
    const configuredItems = NAV_CONFIG[context][authState] || [];
    const items = [];
    for (const itemKey of configuredItems) {
      const condition = CONDITIONAL_ITEMS[itemKey];
      if (!condition || condition(state)) {
        items.push(
          createNavItem(itemKey, {}, { ...state, imageLink }, handlers),
        );
      }
    }
    return items;
  };

  const navItems = useMemo(
    () => getNavItems(),
    [
      state.isMobile,
      state.isLoggedIn,
      authStatus,
      state.isHomePage,
      state.currentPath,
      state.notifications.length,
      state.isDarkMode,
      imageLink,
      handlers,
    ],
  );

  const renderNavItem = (item, context = "desktop") => {
    if (item.component) {
      return context === "mobile" ? (
        <BottomNavigationAction
          key={item.key}
          label={item.label}
          icon={item.icon}
          onClick={item.onClick}
          sx={{
            minWidth: 0,
            flex: item.flex || 1,
            ...(item.key === "login" && {
              "& .MuiBottomNavigationAction-label": {
                fontSize: "0.85rem",
                fontWeight: 600,
                whiteSpace: "nowrap",
              },
            }),
          }}
        />
      ) : (
        <Box key={item.key}>{item.icon}</Box>
      );
    }
    if (context === "mobile") {
      return (
        <BottomNavigationAction
          key={item.key}
          label={item.label}
          icon={item.icon}
          onClick={item.onClick}
          sx={{ minWidth: 0, flex: item.flex || 1 }}
        />
      );
    }
    if (item.menu) {
      return (
        <BasicMenu key={item.key} options={item.menu}>
          {item.icon}
        </BasicMenu>
      );
    }
    return (
      <Tooltip key={item.key} title={item.label || ""}>
        <IconButton
          color="inherit"
          onClick={item.onClick}
          sx={styles.iconButton}
        >
          {item.icon}
        </IconButton>
      </Tooltip>
    );
  };
  const MobileNav = () => {
    const mobileNavButtonSx = { minWidth: 0, flex: 1 };
    const imgStyles = {
      width: 32,
      height: 32,
      objectFit: "contain",
      filter:
        state?.theme?.palette?.mode === "dark"
          ? "brightness(0.85) contrast(0.9) saturate(1.1) drop-shadow(0 2px 6px rgba(0,0,0,0.8))"
          : "brightness(1.05) contrast(1.05) drop-shadow(0 2px 6px rgba(0,0,0,0.7))",
      opacity: state?.theme?.palette?.mode === "dark" ? 0.9 : 1,
    };
    const getMobileNavButtons = () => {
      const buttons = [
        {
          path: "/",
          label: "Work",
          icon: <img src="/job.png" alt="Work" style={imgStyles} />,
          isHome: true,
        },
        {
          path: "/calendar",
          label: "Calendar",
          icon: <img src="/calendar.png" alt="Calendar" style={imgStyles} />,
        },
        {
          path: "/contracts",
          label: "Contracts",
          icon: <img src="/contract.png" alt="Contracts" style={imgStyles} />,
        },
      ];
      return buttons
        .filter((btn) =>
          btn.isHome ? !state.isHomePage : state.currentPath !== btn.path,
        )
        .map((btn) => (
          <BottomNavigationAction
            key={btn.path}
            label={btn.label}
            icon={btn.icon}
            onClick={() => navigate(btn.path)}
            sx={mobileNavButtonSx}
          />
        ));
    };

    const location = useLocation();

    const includesAny = (str, arr) => arr.some((item) => str.includes(item));
    const hideToggleNav = includesAny(location.pathname, [
      "notification",
      "chat",
      "chsts",
    ]);

    return (
      <>
        {!hideToggleNav && state.isLoggedIn && (
          <IconButton
            sx={{
              position: "fixed",
              top: 16,
              left: 16,
              zIndex: 1300,
              backgroundColor: alpha(state.theme.palette.background.paper, 0.9),
              backdropFilter: "blur(10px)",
              boxShadow: state.theme.shadows[2],
            }}
            onClick={() => dispatch({ type: "TOGGLE_NAV" })}
            aria-label="Toggle navigation menu"
          >
            {state.isNavOpen ? <MenuOpenIcon /> : <MenuIcon />}
          </IconButton>
        )}
        <Box
          sx={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 1200 }}
        >
          <Paper elevation={3} sx={{ borderRadius: 0 }}>
            <BottomNavigation
              showLabels
              value={state.currentPath}
              sx={{ flex: 1 }}
            >
              {state.isLoggedIn && getMobileNavButtons()}
              {navItems.map((item) => renderNavItem(item, "mobile"))}
              {!state.isLoggedIn && (
                <BottomNavigationAction
                  label={state.isDarkMode ? "Light" : "Dark"}
                  icon={state.isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
                  onClick={() => dispatch({ type: "TOGGLE_DARK" })}
                  sx={{ minWidth: 0, flex: 1 }}
                />
              )}
              <MultiSaveButton />
            </BottomNavigation>
            <Menu
              anchorEl={mobileMenuAnchor}
              open={Boolean(mobileMenuAnchor)}
              onClose={() => setMobileMenuAnchor(null)}
              anchorOrigin={{ vertical: "top", horizontal: "right" }}
              transformOrigin={{ vertical: "bottom", horizontal: "right" }}
              slotProps={{
                paper: {
                  sx: {
                    bottom: 56, // Height of BottomNavigation
                    top: "auto !important",
                    right: 8,
                    left: "auto !important",
                    position: "fixed",
                  },
                },
              }}
            >
              {handlers.profileMenuOptions.map((option, index) => (
                <MenuItem
                  key={`${option.content}-${index}`}
                  onClick={() => {
                    setMobileMenuAnchor(null);
                    if (option.onClick) option.onClick();
                    if (option.to) navigate(option.to);
                  }}
                >
                  <ListItemIcon
                    sx={{ color: state.theme.palette.text.primary }}
                  >
                    {option.icon}
                  </ListItemIcon>
                  <ListItemText primary={option.content} />
                </MenuItem>
              ))}
            </Menu>
          </Paper>
        </Box>
      </>
    );
  };

  const DesktopNav = () => {
    const imgStyles = {
      width: 28,
      height: 28,
      objectFit: "contain",
      filter:
        state?.theme?.palette?.mode === "dark"
          ? "brightness(0.85) contrast(0.9) saturate(1.1) drop-shadow(0 2px 4px rgba(0,0,0,0.4))"
          : "brightness(1.05) contrast(1.05) drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
      opacity: state?.theme?.palette?.mode === "dark" ? 0.9 : 1,
      transition: "all 0.2s ease",
    };

    return (
      <Toolbar
        sx={{
          ...styles.toolbar,
          ...(state.isNavOpen && styles.toolbarShift),
          display: "grid",
          gridTemplateColumns: state.isLoggedIn ? "1fr auto 1fr" : "1fr auto",
          gap: 2,
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            minWidth: 0,
            justifyContent: "flex-start",
          }}
        >
          {state.isLoggedIn && (
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => dispatch({ type: "TOGGLE_NAV" })}
              sx={styles.iconButton}
              aria-label="Toggle navigation menu"
            >
              {state.isNavOpen ? <MenuOpenIcon /> : <MenuIcon />}
            </IconButton>
          )}
          {navItems
            .filter((item) => ["theme", "whitepaper"].includes(item.key))
            .map((item) => renderNavItem(item))}
          {!state.isHomePage && (
            <Routes>
              <Route path="*" element={<BreadPage />} />
            </Routes>
          )}
          {state.isLoggedIn && (
            <ShareButton fileId={current_file?.id} currentFile={current_file} />
          )}
        </Box>
        {state.isLoggedIn && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Tooltip title="Jobs">
              <IconButton
                color="inherit"
                onClick={() => navigate("/")}
                sx={{
                  ...styles.iconButton,
                  opacity: state.isHomePage ? 0.5 : 1,
                }}
              >
                <img src="/job.png" alt="Work" style={imgStyles} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Calendar">
              <IconButton
                color="inherit"
                onClick={() => navigate("/calendar")}
                sx={{
                  ...styles.iconButton,
                  opacity: state.currentPath === "/calendar" ? 0.5 : 1,
                }}
              >
                <img src="/calendar.png" alt="Calendar" style={imgStyles} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Contracts">
              <IconButton
                color="inherit"
                onClick={() => navigate("/contracts")}
                sx={{
                  ...styles.iconButton,
                  opacity: state.currentPath === "/contracts" ? 0.5 : 1,
                }}
              >
                <img src="/contract.png" alt="Contract" style={imgStyles} />
              </IconButton>
            </Tooltip>
          </Box>
        )}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            justifyContent: "flex-end",
            marginRight: state.isLoggedIn ? 0 : 4,
          }}
        >
          {navItems
            .filter((item) => !["theme", "whitepaper"].includes(item.key))
            .map((item) => renderNavItem(item))}
          {state.isLoggedIn && <WorkspaceManager />}
          {state.isLoggedIn && <MultiSaveButton />}
        </Box>
      </Toolbar>
    );
  };

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          ...styles.appBar,
          display: state.isMobile ? "none" : "block",
          borderRadius: 0,
        }}
      >
        {state.isFetching && <LinearProgress />}
        <DesktopNav />
      </AppBar>
      {state.isMobile && <MobileNav />}
    </>
  );
}
