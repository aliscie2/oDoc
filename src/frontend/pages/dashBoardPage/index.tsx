import React, { useState } from "react";
import {
  Box,
  Container,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery,
  Tooltip,
} from "@mui/material";
import {
  CalendarMonth as CalendarMonthIcon,
  Today as TodayIcon,
  Inbox as InboxIcon,
  FolderSpecial as ProjectsIcon,
  Groups as TeamsIcon,
} from "@mui/icons-material";
import AddchartIcon from "@mui/icons-material/Addchart";
import ViewKanbanIcon from "@mui/icons-material/ViewKanban";
import TodayView from "./todayView";
import BoardView from "./boardView";
import CalendarView from "./calindarView";
import SubmissionsView from "./submitionsView";
import ProjectsView from "./projectsView";
import TeamsView from "./teamsView";
import MetricsView from "./metrices";

const STORAGE_KEY = "dashboardActiveTab";

const ProjectDashboard = () => {
  const [activeTab, setActiveTab] = useState(() => {
    try {
      const savedTab = localStorage.getItem(STORAGE_KEY);
      // Force Calendar tab (index 2) if saved tab is disabled
      const parsedTab = savedTab !== null ? parseInt(savedTab, 10) : 2;
      return parsedTab === 2 ? 2 : 2; // Always default to Calendar
    } catch (error) {
      console.error("Error accessing localStorage:", error);
      return 2; // Default to Calendar tab
    }
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleTabChange = (_, newValue) => {
    // Only allow Calendar tab (index 2) to be selected
    if (newValue === 2) {
      setActiveTab(newValue);
      try {
        localStorage.setItem(STORAGE_KEY, newValue.toString());
      } catch (error) {
        console.error("Error saving to localStorage:", error);
      }
    }
  };

  const TabContent = () => {
    switch (activeTab) {
      case 0:
        return <TodayView />;
      case 1:
        return <BoardView />;
      case 2:
        return <CalendarView />;
      case 3:
        return <SubmissionsView />;
      case 4:
        return <ProjectsView />;
      case 5:
        return <TeamsView />;
      case 6:
        return <MetricsView />;
      default:
        return <CalendarView />; // Default to Calendar
    }
  };

  // Tab configuration with disabled status
  const tabsConfig = [
    {
      icon: <TodayIcon />,
      label: "Today's tasks",
      disabled: true,
      tooltip: "This feature is not available now, coming soon!",
    },
    {
      icon: <ViewKanbanIcon />,
      label: "Tasks",
      disabled: true,
      tooltip: "This feature is not available now, coming soon!",
    },
    {
      icon: <CalendarMonthIcon />,
      label: "Calendar",
      disabled: false,
      tooltip: "Calendar is fully working now",
    },
    {
      icon: <InboxIcon />,
      label: "Submissions",
      disabled: true,
      tooltip: "This feature is not available now, coming soon!",
    },
    {
      icon: <ProjectsIcon />,
      label: "Projects",
      disabled: true,
      tooltip: "This feature is not available now, coming soon!",
    },
    {
      icon: <TeamsIcon />,
      label: "Teams",
      disabled: true,
      tooltip: "This feature is not available now, coming soon!",
    },
    {
      icon: <AddchartIcon />,
      label: "Metrics",
      disabled: true,
      tooltip: "This feature is not available now, coming soon!",
    },
  ];

  return (
    <Container
      maxWidth="lg"
      sx={{
        mt: { xs: 2, md: 4 },
        mb: { xs: 2, md: 4 },
        px: { xs: 1, sm: 2, md: 3 },
      }}
    >
      <Box
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          mb: 3,
          bgcolor:
            theme.palette.mode === "dark"
              ? theme.palette.background.paper
              : theme.palette.background.default,
        }}
      >
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          textColor="primary"
          indicatorColor="primary"
          variant={isMobile ? "scrollable" : "standard"}
          scrollButtons="auto"
          sx={{
            opacity: isMobile ? 1 : 0.7,
            transition: "all 0.3s ease",
            "&:hover": {
              opacity: 1,
            },
            "& .MuiTab-root": {
              transform: "scale(0.9)",
              transition: "transform 0.3s ease",
              "&:hover": {
                transform: "scale(1.1)",
              },
              "&.Mui-disabled": {
                opacity: 0.4,
                cursor: "not-allowed",
                "&:hover": {
                  transform: "scale(0.95)",
                },
              },
            },
          }}
        >
          {tabsConfig.map((tab, index) => (
            <Tooltip key={index} title={tab.tooltip} arrow placement="top">
              <span>
                <Tab
                  icon={tab.icon}
                  label={tab.label}
                  disabled={tab.disabled}
                  sx={{
                    ...(tab.disabled && {
                      color: theme.palette.text.disabled,
                      "&.Mui-disabled": {
                        color: theme.palette.text.disabled,
                      },
                    }),
                  }}
                />
              </span>
            </Tooltip>
          ))}
        </Tabs>
      </Box>

      <Box sx={{ mt: 3 }}>
        <TabContent />
      </Box>
    </Container>
  );
};

export default ProjectDashboard;
