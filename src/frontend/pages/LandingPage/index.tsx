import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Chip,
  useTheme,
  useMediaQuery,
  Stack,
  Button,
} from "@mui/material";
import {
  Analytics,
  Star,
  Warning,
  TrendingUp,
  Speed,
  Shield,
  AccountBalance,
  Handshake,
  Rocket,
  Description,
  Email,
  AccountTree,
  Category,
  Code,
  Psychology,
  Task,
  CalendarToday,
  Event,
  PersonAdd,
  Chat,
  TableChart,
  Payment,
  Assignment,
  FileCopy,
  Business,
  NoEncryption,
  Security,
  HowToVote,
} from "@mui/icons-material";

import OdocStrecture from "./oDocStrecture";
import MobileTutrials from "./mobileVideoTutorials";
import DeskTopTutorials from "../videoTutorial";
import PlatformProgress from "./platformProgress";
import PageFooter from "./socialButton";
import RunawayJellyfish from "@/components/creature/runAeayJellyFish";
import LOGOSVG, { SECRUTYSVG } from "@/components/creature/logoSVG";
import getckUsdcBalance from "@/utils/getBalance";
import { canisterId } from "$/declarations/backend";
import { backendActor, ckUSDCActor } from "@/utils/backendUtils";
import { Helmet } from "react-helmet-async";
import ProgressiveTutorialMobile from "./promiseTutorial";
import LoginButton from "@/components/MainComponents/topNavBar/loginButton";

// Hero Section with Real-time Stats
const HeroSection = ({ isMobile }) => {
  const [stats, setStats] = useState({
    users: 0,
    activeUsers: 0,
    totalDeposit: 0,
    jobsCount: 0,
    talentsCount: 0,
  });
  const [isVisible, setIsVisible] = useState(false);
  const statsRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.3 },
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const animateCount = (target, setter) => {
      let current = 0;
      const increment = target / 50;
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          setter(Math.floor(target));
          clearInterval(timer);
        } else {
          setter(Math.floor(current));
        }
      }, 30);
    };

    const fetchStats = async () => {
      try {
        const [snsResponse, balance] = await Promise.all([
          backendActor.get_sns_status(),
          getckUsdcBalance(ckUSDCActor, canisterId),
        ]);

        if (snsResponse.Ok) {
          const { number_users, active_users, jobs_count, talents_count } =
            snsResponse.Ok;
          animateCount(number_users, (val) =>
            setStats((prev) => ({ ...prev, users: val })),
          );
          animateCount(active_users, (val) =>
            setStats((prev) => ({ ...prev, activeUsers: val })),
          );
          animateCount(Number(balance) / 1000000, (val) =>
            setStats((prev) => ({ ...prev, totalDeposit: val })),
          );
          animateCount(jobs_count, (val) =>
            setStats((prev) => ({ ...prev, jobsCount: val })),
          );
          animateCount(talents_count, (val) =>
            setStats((prev) => ({ ...prev, talentsCount: val })),
          );
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
    };

    fetchStats();
  }, [isVisible, backendActor, ckUSDCActor]);

  const statsData = [
    {
      value: stats.users,
      label: "Total Users",
      icon: <PersonAdd sx={{ fontSize: "2rem", color: "primary.main" }} />,
    },
    {
      value: stats.activeUsers,
      label: "Active Users",
      icon: <TrendingUp sx={{ fontSize: "2rem", color: "success.main" }} />,
    },
    {
      value: stats.totalDeposit,
      label: "Total Value",
      prefix: "$",
      icon: <Payment sx={{ fontSize: "2rem", color: "warning.main" }} />,
    },
    {
      value: stats.jobsCount,
      label: "Jobs Posted",
      icon: <Assignment sx={{ fontSize: "2rem", color: "info.main" }} />,
    },
    {
      value: stats.talentsCount,
      label: "Talents",
      icon: <Star sx={{ fontSize: "2rem", color: "secondary.main" }} />,
    },
  ];

  return (
    <Box
      ref={statsRef}
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        background:
          "linear-gradient(135deg, rgba(37, 99, 235, 0.05) 0%, rgba(147, 51, 234, 0.05) 100%)",
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "radial-gradient(circle at 30% 20%, rgba(37, 99, 235, 0.1) 0%, transparent 50%)",
          pointerEvents: "none",
        },
      }}
    >
      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        <Grid container spacing={6} alignItems="center">
          {/* Left Content */}
          <Grid item xs={12} md={6}>
            <Box sx={{ textAlign: { xs: "center", md: "left" } }}>
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: "2.5rem", sm: "3.5rem", md: "4rem" },
                  fontWeight: 800,
                  mb: 3,
                  background:
                    "linear-gradient(135deg, #2563eb 0%, #9333ea 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  lineHeight: 1.1,
                }}
              >
                The Future of
                <br />
                Freelance Work
              </Typography>

              <Typography
                variant="h5"
                sx={{
                  mb: 4,
                  color: "text.secondary",
                  fontWeight: 400,
                  lineHeight: 1.6,
                  maxWidth: 500,
                  mx: { xs: "auto", md: 0 },
                }}
              >
                AI-powered job matching, crypto agreements, and seamless
                collaboration. All in one decentralized platform.
              </Typography>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                sx={{
                  mb: 6,
                  justifyContent: { xs: "center", md: "flex-start" },
                }}
              >
                <LoginButton
                  isMobile={isMobile}
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: "1.1rem",
                    background:
                      "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 8px 25px rgba(37, 99, 235, 0.4)",
                    },
                  }}
                >
                  Get Started Free
                </LoginButton>

                <Button
                  variant="outlined"
                  size="large"
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: "1.1rem",
                    borderColor: "primary.main",
                    color: "primary.main",
                    "&:hover": {
                      backgroundColor: "rgba(37, 99, 235, 0.05)",
                      borderColor: "primary.dark",
                    },
                  }}
                >
                  Watch Demo
                </Button>
              </Stack>

              <Stack
                direction="row"
                spacing={1}
                sx={{
                  justifyContent: { xs: "center", md: "flex-start" },
                  flexWrap: "wrap",
                  gap: 1,
                }}
              >
                {[
                  "Open Source",
                  "Decentralized",
                  "AI-Powered",
                  "Crypto Native",
                ].map((label) => (
                  <Chip
                    key={label}
                    label={label}
                    size="small"
                    variant="outlined"
                    sx={{
                      borderColor: "primary.main",
                      color: "primary.main",
                      "&:hover": {
                        backgroundColor: "rgba(37, 99, 235, 0.05)",
                      },
                    }}
                  />
                ))}
              </Stack>
            </Box>
          </Grid>

          {/* Right Content - Logo & Stats */}
          <Grid item xs={12} md={6}>
            <Box sx={{ textAlign: "center", position: "relative" }}>
              {/* Logo Animation */}
              <Box sx={{ mb: 4 }}>
                <RunawayJellyfish
                  LogoSvg={LOGOSVG}
                  jellyfishOffsetX={-135}
                  jellyfishOffsetY={5}
                  scale={isMobile ? 1 : 1.5}
                />
              </Box>

              {/* Real-time Stats Grid */}
              <Box
                sx={{
                  background: "rgba(255, 255, 255, 0.8)",
                  backdropFilter: "blur(20px)",
                  borderRadius: 3,
                  p: 3,
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ mb: 3, fontWeight: 600, color: "text.primary" }}
                >
                  Live Platform Stats
                </Typography>

                <Grid container spacing={3}>
                  {statsData.map((stat, i) => (
                    <Grid item xs={6} sm={4} md={6} lg={4} key={i}>
                      <Box sx={{ textAlign: "center" }}>
                        {stat.icon}
                        <Typography
                          variant="h4"
                          sx={{
                            fontWeight: 700,
                            color: "primary.main",
                            mt: 1,
                            mb: 0.5,
                          }}
                        >
                          {stat.prefix || ""}
                          {stat.value.toLocaleString()}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: "text.secondary",
                            fontWeight: 500,
                          }}
                        >
                          {stat.label}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

const FeatureSection = ({ title, icon, children, reversed = false }) => {
  const isMobile = useMediaQuery("(max-width:900px)");

  return (
    <Box
      sx={{ py: 6, minHeight: "100vh", display: "flex", alignItems: "center" }}
    >
      <Grid
        container
        spacing={6}
        direction={reversed && !isMobile ? "row-reverse" : "row"}
        alignItems="center"
      >
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: isMobile ? "center" : "flex-start",
            }}
          >
            {isMobile && (
              <Box
                sx={{
                  mb: 3,
                  filter:
                    "drop-shadow(rgba(167, 116, 116, 0.15) 10px 10px 20px)",
                }}
              >
                {icon}
              </Box>
            )}
            <Typography
              variant="h3"
              gutterBottom
              sx={{
                fontWeight: 700,
                mb: 3,
                background: "linear-gradient(45deg, #40e0d0, #0000)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontSize: { xs: "1.5rem", sm: "2rem", md: "3rem" },
                textAlign: isMobile ? "center" : "left",
                wordWrap: "break-word",
                overflowWrap: "break-word",
              }}
            >
              {title}
            </Typography>
            <Box sx={{ textAlign: "left", width: "100%" }}>{children}</Box>
          </Box>
        </Grid>
        {!isMobile && (
          <Grid item md={6}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
                position: "relative",
              }}
            >
              <Box
                sx={{
                  position: "relative",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: 200,
                    height: 200,
                    borderRadius: "50%",
                    zIndex: -1,
                    background:
                      "radial-gradient(circle, rgba(25,118,210,0.1) 0%, transparent 70%)",
                  },
                }}
              >
                {icon}
              </Box>
            </Box>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default function OdocLandingPage() {
  const isMobile = useMediaQuery("(max-width:900px)");
  const theme = useTheme();

  React.useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
   @keyframes pulse { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.05); opacity: 0.8; } 100% { transform: scale(1); opacity: 1; } }
   @keyframes bounce { 0%, 20%, 53%, 80%, 100% { transform: translate3d(0,0,0); } 40%, 43% { transform: translate3d(0,-10px,0); } 70% { transform: translate3d(0,-5px,0); } 90% { transform: translate3d(0,-2px,0); } }
   @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
 `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const features = [
    {
      title: "AI Job Matching System",
      icon: (
        <img
          src={"/jobs.png"}
          style={{
            transform: "scaleX(-1)",
            width: isMobile ? "150px" : "500px",
            objectFit: "contain",
          }}
        />
      ),
      children: (
        <>
          <Typography
            variant="h6"
            paragraph
            color="text.secondary"
            sx={{ mb: 3 }}
          >
            Stop hunting for jobs, let AI do it for you. Talk to the oDoc AI job
            match for consultation to improve your resume and requirements.
          </Typography>
          <List sx={{ "& .MuiListItem-root": { pl: 0 } }}>
            {[
              {
                title: "Smart Email Alerts",
                description:
                  "Get notified when there's a perfect match for your skills",
                icon: <Email sx={{ color: "primary.main", mr: 2 }} />,
              },
              {
                title: "Auto Cover Letters",
                description:
                  "Generate personalized cover letters without reading full job posts",
                icon: <Description sx={{ color: "info.main", mr: 2 }} />,
              },
              {
                title: "Spam Protection",
                description: "Filter out low-quality matches automatically",
                icon: <Shield sx={{ color: "success.main", mr: 2 }} />,
              },
            ].map((item, index) => (
              <ListItem key={index} sx={{ alignItems: "center" }}>
                {item.icon}
                <ListItemText
                  primary={
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      color="primary"
                    >
                      {item.title}
                    </Typography>
                  }
                  secondary={item.description}
                />
              </ListItem>
            ))}
          </List>
        </>
      ),
    },
    {
      title: "Crypto Agreement Platform",
      reversed: true,
      icon: (
        <img
          src={"/agreement.png"}
          style={{ width: isMobile ? "150px" : "500px", objectFit: "contain" }}
        />
      ),
      children: (
        <>
          <Typography
            variant="h6"
            paragraph
            color="text.secondary"
            sx={{ mb: 3 }}
          >
            Secure, transparent agreements with built-in escrow and reputation
            tracking. Eliminate middlemen and streamline your crypto
            transactions.
          </Typography>
          <List sx={{ "& .MuiListItem-root": { pl: 0 } }}>
            {[
              {
                title: "Smart Escrow",
                description:
                  "Deposit funds before agreements to guarantee payment and build trust",
                icon: <AccountBalance sx={{ color: "warning.main", mr: 2 }} />,
              },
              {
                title: "Quick Promises",
                description:
                  "Create lightweight agreements for simple tasks without escrow",
                icon: <Handshake sx={{ color: "info.main", mr: 2 }} />,
              },
              {
                title: "Instant Release",
                description:
                  "Release payments automatically when milestones are completed",
                icon: <Rocket sx={{ color: "success.main", mr: 2 }} />,
              },
              {
                title: "Reputation Karma",
                description:
                  "Track success rates and reliability scores across all participants",
                icon: <TrendingUp sx={{ color: "primary.main", mr: 2 }} />,
              },
            ].map((item, index) => (
              <ListItem key={index} sx={{ alignItems: "center" }}>
                {item.icon}
                <ListItemText
                  primary={
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      color="primary"
                    >
                      {item.title}
                    </Typography>
                  }
                  secondary={item.description}
                />
              </ListItem>
            ))}
          </List>
        </>
      ),
    },
    {
      title: "Automated Tasks Manager",
      icon: (
        <img
          src={"/all-in-on.png"}
          style={{
            transform: "scaleX(-1)",
            width: isMobile ? "150px" : "500px",
            objectFit: "contain",
          }}
        />
      ),
      children: (
        <>
          <Typography
            variant="h6"
            paragraph
            color="text.secondary"
            sx={{ mb: 3 }}
          >
            The crypto agreement acts as contract and task manager all at once.
            One unified platform to replace multiple services.
          </Typography>
          <List sx={{ "& .MuiListItem-root": { pl: 0 } }}>
            {[
              {
                title: "No Payment Platform Needed",
                icon: <Payment sx={{ color: "success.main", mr: 2 }} />,
              },
              {
                title: "No Contract Platform Needed",
                icon: <Business sx={{ color: "info.main", mr: 2 }} />,
              },
              {
                title: "No Task Manager Needed",
                icon: <Assignment sx={{ color: "warning.main", mr: 2 }} />,
              },
              {
                title: "No Documents Platform Needed",
                icon: <FileCopy sx={{ color: "secondary.main", mr: 2 }} />,
              },
              {
                title: "Single Unified Platform",
                description: "Everything you need in one automated solution",
                icon: <TableChart sx={{ color: "primary.main", mr: 2 }} />,
              },
            ].map((item, index) => (
              <ListItem key={index} sx={{ alignItems: "center" }}>
                {item.icon}
                <ListItemText
                  primary={
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      color="primary"
                    >
                      {item.title}
                    </Typography>
                  }
                  secondary={item.description}
                />
              </ListItem>
            ))}
          </List>
        </>
      ),
    },
    {
      title: "Smart Calendar Integration",
      reversed: true,
      icon: (
        <img
          src={"/calendar.png"}
          style={{
            width: isMobile ? "150px" : "500px",
            objectFit: "contain",
          }}
        />
      ),
      children: (
        <>
          <Typography
            variant="h6"
            paragraph
            color="text.secondary"
            sx={{ mb: 3 }}
          >
            No need to manually set your availabilities. Talk to your calendar
            like talking to a human assistant.
          </Typography>
          <List sx={{ "& .MuiListItem-root": { pl: 0 } }}>
            {[
              {
                title: "Google Calendar Sync",
                icon: <CalendarToday sx={{ color: "primary.main", mr: 2 }} />,
              },
              {
                title: "Multiple Calendar Support",
                icon: (
                  <Box
                    sx={{
                      position: "relative",
                      width: "60px",
                      height: "24px",
                      mr: 2,
                    }}
                  >
                    <Event
                      sx={{ position: "absolute", left: 0, color: "info.main" }}
                    />
                    <Event
                      sx={{
                        position: "absolute",
                        left: "12px",
                        color: "success.main",
                      }}
                    />
                    <Event
                      sx={{
                        position: "absolute",
                        left: "24px",
                        color: "warning.main",
                      }}
                    />
                  </Box>
                ),
              },
              {
                title: "Two-Way Synchronization",
                description:
                  "Events sync between Google Calendar and oDoc automatically",
                icon: <TrendingUp sx={{ color: "success.main", mr: 2 }} />,
              },
              {
                title: "Contact Management",
                icon: <PersonAdd sx={{ color: "warning.main", mr: 2 }} />,
              },
              {
                title: "Natural Language Booking",
                description:
                  'Just say "I will have 15 minutes call with David tomorrow"',
                icon: <Chat sx={{ color: "secondary.main", mr: 2 }} />,
              },
            ].map((item, index) => (
              <ListItem key={index} sx={{ alignItems: "center" }}>
                {item.icon}
                <ListItemText
                  primary={
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      color="primary"
                    >
                      {item.title}
                    </Typography>
                  }
                  secondary={item.description}
                />
              </ListItem>
            ))}
          </List>
        </>
      ),
    },
    {
      title: "Team Spaces with AI",
      icon: (
        <img
          src={"/teamspaces.png"}
          style={{
            transform: "scaleX(-1)",
            width: isMobile ? "150px" : "500px",
            objectFit: "contain",
          }}
        />
      ),
      children: (
        <>
          <Typography
            variant="h6"
            paragraph
            color="text.secondary"
            sx={{ mb: 3 }}
          >
            Slack-like communication with AI tracking, automated onboarding, and
            seamless GitHub integration.
          </Typography>
          <List sx={{ "& .MuiListItem-root": { pl: 0 } }}>
            {[
              {
                title: "AI Conversation Tracking",
                description:
                  "AI tracks conversations and generates automated onboarding",
                icon: <Psychology sx={{ color: "primary.main", mr: 2 }} />,
              },
              {
                title: "Smart Topic Management",
                description:
                  "Topic/thread management with intelligent categorization",
                icon: <Category sx={{ color: "info.main", mr: 2 }} />,
              },
              {
                title: "Integrated Task Tracking",
                description: "Todo lists and issue tracking built right in",
                icon: <Task sx={{ color: "warning.main", mr: 2 }} />,
              },
              {
                title: "GitHub Integration",
                description:
                  "Connect GitHub issues and branches to conversations",
                icon: <Code sx={{ color: "success.main", mr: 2 }} />,
              },
              {
                title: "Code-Chat Linking",
                description:
                  "AI knows which discussions link to specific code branches",
                icon: <AccountTree sx={{ color: "secondary.main", mr: 2 }} />,
              },
            ].map((item, index) => (
              <ListItem key={index} sx={{ alignItems: "center" }}>
                {item.icon}
                <ListItemText
                  primary={
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      color="primary"
                    >
                      {item.title}
                    </Typography>
                  }
                  secondary={item.description}
                />
              </ListItem>
            ))}
          </List>
        </>
      ),
    },
    {
      title: "Advanced Cyber Security",
      reversed: true,
      icon: (
        <RunawayJellyfish
          logoSvgScale={isMobile ? 1 : 1.5}
          LogoSvg={SECRUTYSVG}
          jellyfishOffsetX={-100}
          jellyfishOffsetY={5}
          scale={isMobile ? 0.7 : 1.3}
        />
      ),
      children: (
        <>
          <Typography
            variant="h6"
            paragraph
            color="text.secondary"
            sx={{ mb: 3 }}
          >
            Built on decentralized blockchain technology with advanced security
            features and community governance.
          </Typography>
          <List sx={{ "& .MuiListItem-root": { pl: 0 } }}>
            {[
              {
                title: "Decentralized Architecture",
                icon: <NoEncryption sx={{ color: "primary.main", mr: 2 }} />,
              },
              {
                title: "Tamper-Proof Records",
                description: "Immutable blockchain-based transaction history",
                icon: <Security sx={{ color: "info.main", mr: 2 }} />,
              },
              {
                title: "Fraud Prevention System",
                description:
                  "Advanced Karma algorithm prevents malicious behavior",
                icon: <Shield sx={{ color: "warning.main", mr: 2 }} />,
              },
              {
                title: "Democratic Governance",
                description: "Vote to accept or reject privacy policy changes",
                icon: <HowToVote sx={{ color: "success.main", mr: 2 }} />,
              },
            ].map((item, index) => (
              <ListItem key={index} sx={{ alignItems: "center" }}>
                {item.icon}
                <ListItemText
                  primary={
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      color="primary"
                    >
                      {item.title}
                    </Typography>
                  }
                  secondary={item.description}
                />
              </ListItem>
            ))}
          </List>
        </>
      ),
    },
  ];

  const karmaCards = [
    {
      type: "error",
      icon: Warning,
      title: "Bad Behavior",
      behaviors: [
        "Repeated cancellations",
        "Excessive disputes",
        "Breaking contract terms",
      ],
      consequences: {
        title: "PUNISHMENTS",
        items: ["Trust score drops", "Funds locked", "Transaction cap"],
      },
    },
    {
      type: "success",
      icon: Star,
      title: "Good Behavior",
      behaviors: [
        "Releasing payments",
        "Creating contracts",
        "Interacting with many users",
        "High transaction volume",
      ],
      consequences: {
        title: "REWARDS",
        items: [
          "Higher trust score",
          "Transaction freedom",
          "Refund old escrow",
        ],
      },
    },
  ];

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Helmet>
        <title>ODOC.app</title>
        <link rel="icon" type="image/png" href={"/small_logo.png"} />
      </Helmet>

      {/* Hero Section */}
      <HeroSection isMobile={isMobile} />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <ProgressiveTutorialMobile />
        {features.map((feature, index) => (
          <FeatureSection key={index} {...feature}>
            {feature.children}
          </FeatureSection>
        ))}

        <Box sx={{ py: 2, minHeight: "100vh", alignItems: "center" }}>
          {isMobile ? <MobileTutrials /> : <DeskTopTutorials />}
        </Box>

        {!isMobile && (
          <Box
            sx={{
              py: 2,
              minHeight: "100vh",
              display: "flex",
              alignItems: "center",
            }}
          >
            <OdocStrecture />
          </Box>
        )}

        <Box
          sx={{
            py: 6,
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Typography
            variant="h4"
            gutterBottom
            textAlign="center"
            sx={{ mb: 6 }}
          >
            Karma System
          </Typography>
          <Grid container spacing={4}>
            {karmaCards.map((card, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card
                  sx={{
                    borderRadius: 3,
                    border: 2,
                    borderColor: `${card.type}.main`,
                    backgroundColor:
                      theme.palette.mode === "dark"
                        ? `${card.type}.dark`
                        : `${card.type}.light`,
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        color:
                          theme.palette.mode === "dark"
                            ? `${card.type}.light`
                            : `${card.type}.dark`,
                      }}
                    >
                      <card.icon sx={{ mr: 1 }} />
                      {card.title}
                    </Typography>
                    <List dense>
                      {card.behaviors.map((text, i) => (
                        <ListItem key={i}>
                          <ListItemText
                            primary={text}
                            sx={{
                              color:
                                theme.palette.mode === "dark"
                                  ? "text.primary"
                                  : `${card.type}.dark`,
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        mt: 3,
                        mb: 2,
                        fontWeight: "bold",
                        color:
                          theme.palette.mode === "dark"
                            ? `${card.type}.light`
                            : `${card.type}.dark`,
                      }}
                    >
                      {card.consequences.title}
                    </Typography>
                    <List dense>
                      {card.consequences.items.map((text, i) => (
                        <ListItem key={i}>
                          <ListItemText
                            primary={text}
                            sx={{
                              color:
                                theme.palette.mode === "dark"
                                  ? "text.primary"
                                  : `${card.type}.dark`,
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Box
          sx={{
            py: 6,
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <Typography variant="h4" gutterBottom>
              AI Analytics
            </Typography>
            <Chip
              label="Not Available Yet"
              color="warning"
              sx={{ fontSize: "1rem", py: 2, px: 1 }}
            />
          </Box>
          <Typography
            variant="h6"
            paragraph
            color="text.secondary"
            sx={{ mb: 3, textAlign: "center" }}
          >
            Advanced AI analytics to optimize your workflow and provide
            intelligent suggestions.
          </Typography>
          <List
            sx={{ maxWidth: 800, mx: "auto", "& .MuiListItem-root": { pl: 0 } }}
          >
            {[
              {
                title: "Decentralized AI Monitoring",
                description:
                  "All your chats and docs watched by decentralized AI",
                icon: <Analytics sx={{ color: "primary.main", mr: 2 }} />,
              },
              {
                title: "Action Suggestions",
                description:
                  "AI provides intelligent recommendations based on your activity",
                icon: <TrendingUp sx={{ color: "info.main", mr: 2 }} />,
              },
              {
                title: "Smart Suggestions",
                description:
                  "Contextual suggestions like meeting scheduling and partner recommendations based on success rates",
                icon: <Speed sx={{ color: "success.main", mr: 2 }} />,
              },
            ].map((item, index) => (
              <ListItem key={index} sx={{ alignItems: "center" }}>
                {item.icon}
                <ListItemText
                  primary={
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      color="primary"
                    >
                      {item.title}
                    </Typography>
                  }
                  secondary={item.description}
                />
              </ListItem>
            ))}
          </List>
        </Box>

        <Box>
          <PlatformProgress />
        </Box>
      </Container>
      <PageFooter />
    </Box>
  );
}
