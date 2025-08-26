import React, { useEffect, useState, useMemo } from "react";
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
  DarkMode as DarkModeIcon,
  Gavel as GavelIcon,
  LightMode as LightModeIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  MenuOpen as MenuOpenIcon,
  Person2 as Person2Icon,
  Handshake as HandshakeIcon,
  CalendarToday as CalendarIcon,
} from "@mui/icons-material";
import HomeIcon from "@mui/icons-material/Home";
import GradeIcon from "@mui/icons-material/Grade";
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
import EnhancedUserAvatar from "./EnhancedUserAvatar";

import { logout } from "@/utils/backendUtils";
import { convertToBlobLink } from "@/DataProcessing/imageToVec";
import getStyles from "./styles";

// Configuration-driven navigation - optimized for robustness
const NAV_CONFIG = {
  mobile: {
    loggedIn: ["calendar", "notifications", "chat", "profile"],
    loggedOut: ["login"],
    registered: ["calendar", "notifications", "chat", "profile"],
    unregistered: ["profile"],
    nullRegistered: [],
  },
  desktop: {
    loggedIn: ["calendar", "notifications", "chat", "profile"],
    loggedOut: ["theme", "whitepaper", "login"],
    registered: ["calendar", "notifications", "chat", "profile"],
    unregistered: ["theme", "whitepaper", "profile"],
    nullRegistered: ["theme", "whitepaper"],
  },
} as const;

// Special case items that need dynamic conditions
const CONDITIONAL_ITEMS = {
  home: (state) => state.isMobile && !state.isHomePage,
  calendar: (state) => state.currentPath !== "/calendar",
  notifications: (state) => state.notifications.length > 0,
};

// Profile menu configuration
// const PROFILE_MENU_CONFIG = [
//   { content: "Profile", to: "/profile", icon: Person2Icon },
//   { content: "Contracts", to: "/contracts", icon: GavelIcon },
//   { content: "Wallet", to: "/wallet", icon: AccountBalanceWalletIcon },
//   { content: "Affiliate", to: "/affiliate", icon: HandshakeIcon },
//   { content: "Achievements", to: "/achievementCard", icon: GradeIcon },
//   { content: "Logout", to: "/", icon: LogoutIcon, action: "logout" },
// ];

// Update PROFILE_MENU_CONFIG to be a function that takes isRegistered
const getProfileMenuConfig = (isRegistered) => {
  if (isRegistered === false) {
    return [{ content: "Logout", to: "/", icon: LogoutIcon, action: "logout" }];
  }
  if (isRegistered === null) {
    return [];
  }
  return [
    { content: "Profile", to: "/profile", icon: Person2Icon },
    { content: "Contracts", to: "/contracts", icon: GavelIcon },
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
  const { isNavOpen, isDarkMode, isFetching, isLoggedIn } = useSelector(
    (state) => state.uiState,
  );
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
    notifications,
  };
};

// Custom hook for scroll behavior on mobile
const useMobileScrollBehavior = (isMobile) => {
  const [showMobileMenu, setShowMobileMenu] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

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

  return showMobileMenu;
};

// Navigation item factory
const createNavItem = (key, config, state, handlers) => {
  const itemConfigs = {
    home: {
      label: "Home",
      icon: <HomeIcon />,
      onClick: () => handlers.navigate("/"),
    },
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
      icon: <NotificationsButton isMobile={state.isMobile} />,
      component: true,
    },
    chat: {
      label: "Chat",
      icon: <ChatsComponent isMobile={state.isMobile} />,
      component: true,
    },
    profile: {
      label: "Profile",
      icon: (
        <EnhancedUserAvatar
          actions_rate={state.profile_history?.actions_rate ?? 0}
          photo={state.imageLink}
          style={{
            width: state.isMobile ? 20 : 24,
            height: state.isMobile ? 20 : 24,
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
  const { isLoggedIn, isRegistered } = useSelector(
    (state: any) => state.uiState,
  );
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // Using direct logout import
  const state = useNavigationState();
  const showMobileMenu = useMobileScrollBehavior(state.isMobile);

  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);

  // Memoized selectors
  const { profile, profile_history, current_file } = useSelector(
    (state) => state.filesState,
  );
  const imageLink = useMemo(
    () => (profile ? convertToBlobLink(profile.photo) : ""),
    [profile],
  );
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
  // Action handlers
  // Update handlers to use the new profile menu function
  const handlers = useMemo(
    () => ({
      dispatch,
      navigate,
      onProfileClick: (e) => setMobileMenuAnchor(e.currentTarget),
      profileMenuOptions: getProfileMenuConfig(isRegistered).map((option) => ({
        ...option,
        icon: (
          <option.icon
            sx={{ color: state.theme.palette.text.primary, mr: 1 }}
          />
        ),
        onClick: option.action === "logout" ? handleLogout : undefined,
      })),
    }),
    [dispatch, navigate, isRegistered, state.theme],
  );

  // Get navigation items based on configuration
  // Update the getNavItems function
  const getNavItems = () => {
    const context = state.isMobile ? "mobile" : "desktop";
    let authState;

    if (!state.isLoggedIn) {
      authState = "loggedOut";
    } else if (state.isRegistered === null) {
      authState = "nullRegistered";
    } else if (state.isRegistered === false) {
      authState = "unregistered";
    } else {
      authState = "registered";
    }

    const configuredItems = NAV_CONFIG[context][authState] || [];
    const items = [];

    if (CONDITIONAL_ITEMS.home(state)) {
      items.push(createNavItem("home", {}, state, handlers));
    }

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

  // Update the navItems dependency array to include isRegistered
  const navItems = useMemo(
    () => getNavItems(),
    [
      state.isMobile,
      state.isLoggedIn,
      isRegistered,
      state.isHomePage,
      state.currentPath,
      state.notifications.length,
      state.isDarkMode,
      imageLink,
      handlers,
    ],
  );

  // Render navigation item based on context
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
          sx={{
            minWidth: 0,
            flex: item.flex || 1,
          }}
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

  // Mobile navigation component
  const MobileNav = () => (
    <>
      {state.isLoggedIn && showMobileMenu && (
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
            {navItems.map((item) => renderNavItem(item, "mobile"))}
            <MultiSaveButton />
          </BottomNavigation>
          <Menu
            anchorEl={mobileMenuAnchor}
            open={Boolean(mobileMenuAnchor)}
            onClose={() => setMobileMenuAnchor(null)}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
            transformOrigin={{ vertical: "bottom", horizontal: "center" }}
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
                <ListItemIcon sx={{ color: state.theme.palette.text.primary }}>
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

  // Desktop navigation component
  const DesktopNav = () => (
    <Toolbar
      variant="dense"
      sx={{ ...styles.toolbar, ...(state.isNavOpen && styles.toolbarShift) }}
    >
      <Box sx={{ display: "flex", alignItems: "center" }}>
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

      <Box sx={{ flexGrow: 1, mx: 2 }}>
        {state.isLoggedIn && (
          <Tooltip title={'You can press "Command+F"'} placement="top">
            {/* <IconButton
              color="inherit"
              onClick={() => dispatch({ type: "SEARCH_TOOL" })}
              sx={styles.iconButton}
            >
              {searchTool ? <CloseIcon /> : <SearchIcon />}
            </IconButton> */}
          </Tooltip>
        )}
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {navItems
          .filter((item) => !["theme", "whitepaper"].includes(item.key))
          .map((item) => renderNavItem(item))}
        {state.isLoggedIn && <WorkspaceManager />}
        {state.isLoggedIn && <MultiSaveButton />}
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
