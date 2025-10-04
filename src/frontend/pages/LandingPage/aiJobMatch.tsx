import LoginButton from "@/components/MainComponents/topNavBar/loginButton";

import {
  CheckCircle as CheckCircleIcon,
  Email,
  Handshake as HandshakeIcon,
  People,
  Shield,
  YouTube,
  TrendingUp,
  PersonAdd,
  Payment,
  Assignment,
  Star,
  WorkOutline,
  CalendarMonth,
  Search,
  Work,
  SmartToy,
  Sync,
  Chat,
  Description,
  AttachMoney,
  Lock,
  BarChart,
  Notifications,
  Telegram,
  Instagram,
} from "@mui/icons-material";
import DiscordIcon from "@mui/icons-material/Forum";
import GitHubIcon from "@mui/icons-material/GitHub";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Chip,
  Container,
  Divider,
  Fade,
  IconButton,
  Stack,
  SvgIcon,
  Typography,
  useTheme,
  Grid2,
  useMediaQuery,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router";
import getckUsdcBalance from "@/utils/getBalance";
import { canisterId } from "$/declarations/backend";
import { backendActor, ckUSDCActor } from "@/utils/backendUtils";
import AIJobMatchingFlow from "@/components/landingPageAnimations";



const CalendarStep = () => {
  const theme = useTheme();
  const [phase, setPhase] = useState(0);
  const [typedText, setTypedText] = useState("");

  const phases = [
    { type: "availability", text: "I am Available Mon-Fri 9 AM - 1 PM" },
    { type: "event", text: "Find me a good time to meet Sarah tomorrow." }
  ];

  useEffect(() => {
    const currentPhase = phases[phase % 2];
    const targetText = currentPhase.text;
    
    if (typedText.length < targetText.length) {
      const timer = setTimeout(() => {
        setTypedText(targetText.slice(0, typedText.length + 1));
      }, 50);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setTypedText("");
        setPhase(prev => prev + 1);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [typedText, phase]);

  const currentPhase = phases[phase % 2];
  const isComplete = typedText === currentPhase.text;

  const calendarSlots = [
    { day: "Mon", hours: "9-1" },
    { day: "Tue", hours: "9-1" },
    { day: "Wed", hours: "9-1" },
    { day: "Thu", hours: "9-1" },
    { day: "Fri", hours: "9-1" },
  ];

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", py: 8 }}>
      <Container maxWidth="lg">
        <Grid2 container spacing={6} alignItems="flex-start">
          <Grid2 xs={12} md={6}>
            <Typography variant="h3" sx={{ mb: 2, fontWeight: 600, fontSize: { xs: "2rem", md: "2.5rem" } }}>
              Talk to Your Calendar
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, opacity: 0.8, lineHeight: 1.6 }}>
              Set availability and schedule events through simple chat commands
            </Typography>
          </Grid2>

          <Grid2 xs={12} md={6}>
            <Card sx={{ 
              p: 3, 
              borderRadius: 3, 
              bgcolor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              boxShadow: theme.palette.mode === "dark" 
                ? "0 4px 12px rgba(0, 0, 0, 0.3)" 
                : "0 4px 12px rgba(0, 0, 0, 0.08)",
              minHeight: 380
            }}>
              <Box sx={{ 
                mb: 3, 
                p: 2, 
                bgcolor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.05)" : "grey.100", 
                borderRadius: 2, 
                minHeight: 60, 
                display: "flex", 
                alignItems: "center" 
              }}>
                <Typography variant="body1" sx={{ fontFamily: "monospace" }}>
                  {typedText}
                  <Box component="span" sx={{ 
                    display: "inline-block", 
                    width: 2, 
                    height: 20, 
                    bgcolor: "primary.main", 
                    ml: 0.5, 
                    animation: "blink 1s infinite", 
                    "@keyframes blink": { "0%, 50%": { opacity: 1 }, "51%, 100%": { opacity: 0 } } 
                  }} />
                </Typography>
              </Box>

              <Box sx={{ minHeight: 240 }}>
                {isComplete && (
                  <Fade in={true} timeout={600}>
                    <Box>
                      {currentPhase.type === "availability" ? (
                        <Stack spacing={1}>
                          {calendarSlots.map((slot, i) => (
                            <Box key={i} sx={{ 
                              display: "flex", 
                              alignItems: "center", 
                              gap: 2, 
                              p: 1.5, 
                              bgcolor: theme.palette.mode === "dark" 
                                ? `rgba(76, 175, 80, ${0.1 + (i * 0.1)})` 
                                : `rgba(76, 175, 80, ${0.15 + (i * 0.08)})`,
                              borderRadius: 1, 
                              color: theme.palette.mode === "dark" ? "success.light" : "success.dark",
                              border: `1px solid ${theme.palette.success.main}40`
                            }}>
                              <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 40 }}>{slot.day}</Typography>
                              <Typography variant="body2">{slot.hours}</Typography>
                            </Box>
                          ))}
                        </Stack>
                      ) : (
                        <Box sx={{ 
                          p: 2, 
                          bgcolor: theme.palette.mode === "dark" 
                            ? `${theme.palette.primary.dark}90` 
                            : `${theme.palette.primary.main}`,
                          borderRadius: 2, 
                          color: "white" 
                        }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>Tomorrow • 10:00 AM</Typography>
                          <Typography variant="body2">Meeting with Sarah</Typography>
                        </Box>
                      )}
                    </Box>
                  </Fade>
                )}
              </Box>
            </Card>
          </Grid2>
        </Grid2>
      </Container>
    </Box>
  );
};




// Button styles for cleaner code
const getButtonStyles = (theme, variant = "contained") => ({
  contained: {
    px: 4,
    py: 1.5,
    fontSize: "1rem",
    fontWeight: 600,
    background:
      theme.palette.mode === "dark"
        ? `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`
        : `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
    borderRadius: "28px",
    textTransform: "none",
    color: "#ffffff",
    border: "none",
    boxShadow:
      theme.palette.mode === "dark"
        ? `0 4px 16px ${theme.palette.primary.main}40`
        : `0 2px 12px ${theme.palette.primary.main}25`,
    "&:hover": {
      background:
        theme.palette.mode === "dark"
          ? `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`
          : `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
      transform: "translateY(-1px)",
      boxShadow:
        theme.palette.mode === "dark"
          ? `0 6px 20px ${theme.palette.primary.main}50`
          : `0 4px 16px ${theme.palette.primary.main}35`,
    },
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  },
  outlined: {
    px: 4,
    py: 1.5,
    fontSize: "1rem",
    fontWeight: 600,
    background:
      theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.05)" : "#ffffff",
    borderRadius: "28px",
    textTransform: "none",
    color:
      theme.palette.mode === "dark"
        ? theme.palette.text.primary
        : theme.palette.primary.main,
    border:
      theme.palette.mode === "dark"
        ? `2px solid ${theme.palette.divider}`
        : `2px solid ${theme.palette.primary.main}30`,
    backdropFilter: "blur(10px)",
    boxShadow:
      theme.palette.mode === "dark"
        ? "0 2px 8px rgba(0, 0, 0, 0.1)"
        : "0 2px 8px rgba(37, 99, 235, 0.08)",
    "&:hover": {
      background:
        theme.palette.mode === "dark"
          ? "rgba(255, 255, 255, 0.1)"
          : theme.palette.primary.main,
      color:
        theme.palette.mode === "dark" ? theme.palette.text.primary : "#ffffff",
      borderColor:
        theme.palette.mode === "dark"
          ? theme.palette.primary.main
          : theme.palette.primary.main,
      transform: "translateY(-1px)",
      boxShadow:
        theme.palette.mode === "dark"
          ? `0 4px 12px ${theme.palette.primary.main}30`
          : `0 4px 12px ${theme.palette.primary.main}25`,
    },
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  },
});

// Hero Section with Real-time Stats (Google-themed)
const HeroSection = ({ isMobile, state }) => {
  const theme = useTheme();
  const buttonStyles = getButtonStyles(theme);
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
  }, [isVisible]);

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
        background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at 30% 20%, ${theme.palette.primary.main}08 0%, transparent 50%)`,
          pointerEvents: "none",
        },
      }}
    >
      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        <Grid2 container spacing={6} alignItems="center">
          {/* Left Content */}
          <Grid2 xs={12} md={6}>
            <Box sx={{ textAlign: { xs: "center", md: "left" } }}>
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: "2.5rem", sm: "3.5rem", md: "4rem" },
                  fontWeight: 400,
                  mb: 3,
                  color: theme.palette.text.primary,
                  lineHeight: 1.2,
                  fontFamily:
                    "Google Sans, -apple-system, BlinkMacSystemFont, sans-serif",
                }}
              >
                Your AI
                <br />
                <Box
                  component="span"
                  sx={{ color: theme.palette.primary.main, fontWeight: 500 }}
                >
                  Personal Secrety
                </Box>
              </Typography>

              <Typography
                variant="h5"
                sx={{
                  mb: 4,
                  color: theme.palette.text.secondary,
                  fontWeight: 400,
                  lineHeight: 1.6,
                  maxWidth: 500,
                  mx: { xs: "auto", md: 0 },
                  fontSize: { xs: "1.1rem", md: "1.25rem" },
                }}
              >
                The first and the only AI personal Secretary on web3. Find
                jobs/talents, schedule meetings, manage teams & payments.
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
                  variant="contained"
                  size="large"
                  onClick={() => localStorage.setItem("UserType", "JOB")}
                  sx={buttonStyles.contained}
                  isMobile={isMobile}
                >
                  <Search sx={{ mr: 1, fontSize: "1.2rem" }} />
                  Find Talent
                </LoginButton>

                <LoginButton
                  variant="outlined"
                  size="large"
                  onClick={() => localStorage.setItem("UserType", "TALENT")}
                  sx={buttonStyles.outlined}
                  isMobile={isMobile}
                >
                  <Work sx={{ mr: 1, fontSize: "1.2rem" }} />
                  Find Job
                </LoginButton>
              </Stack>
            </Box>
          </Grid2>

          {/* Right Content - Hero Image */}
          <Grid2 xs={12} md={6}>
            <Box
              sx={{
                display: "flex",
                justifyContent: { xs: "center", md: "flex-end" },
                alignItems: "center",
                height: "100%",
              }}
            >
              <Box
                sx={{
                  position: "relative",
                  width: { xs: "240px", sm: "280px", md: "320px" },
                  maxWidth: "100%",
                }}
              >
                <Box
                  component="img"
                  src="/relaxed-person.png"
                  alt="AI-powered work automation"
                  sx={{
                    width: "100%",
                    height: "auto",
                    borderRadius: "8px",
                    boxShadow: `0 4px 16px ${theme.palette.mode === "dark" ? "rgba(0, 0, 0, 0.2)" : "rgba(0, 0, 0, 0.08)"}`,
                    opacity: 0.95,
                  }}
                />
              </Box>
            </Box>
          </Grid2>
        </Grid2>
      </Container>
    </Box>
  );
};

// Social Media Sharing Component
const SocialMediaShare = () => {
  const shareMessage = `I just joined the modern online work ${window.location.hostname} you should join too`;
  const shareUrl = window.location.href;

  const handleShare = (platform) => {
    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage + " 🚀\n\n#ModernWork #JobMatching #ICP #RemoteWork")}&url=${encodeURIComponent(shareUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    };

    if (urls[platform]) {
      window.open(
        urls[platform],
        "_blank",
        "width=600,height=500,scrollbars=yes,resizable=yes",
      );
    }
  };

  return (
    <Box sx={{ textAlign: "center", py: 3 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
        Join Our Community
      </Typography>

      <Stack
        direction="row"
        spacing={1.5}
        justifyContent="center"
        flexWrap="wrap"
        alignItems="center"
      >
        {[
          {
            key: "telegram",
            icon: Telegram,
            color: "#0088cc",
            url: "https://t.me/odoc_ic",
            primary: true,
          },
          {
            key: "x",
            icon: XIcon,
            color: "#000000",
            url: "https://x.com/odoc_ic",
            primary: true,
          },
          {
            key: "discord",
            icon: DiscordIcon,
            color: "#5865F2",
            url: "https://discord.gg/HbaFQXDD",
            primary: true,
          },
          {
            key: "youtube",
            icon: YouTube,
            color: "#FF0000",
            url: "https://www.youtube.com/@odoc_ic",
            primary: false,
          },
          {
            key: "instagram",
            icon: Instagram,
            color: "#E4405F",
            url: "https://www.instagram.com/odoc_ic",
            primary: false,
          },
          {
            key: "tiktok",
            icon: TikTokIcon,
            color: "#000000",
            url: "https://www.tiktok.com/@odoc.app",
            primary: false,
          },
        ].map(({ key, icon: Icon, color, url, primary }) => (
          <IconButton
            key={key}
            onClick={() => window.open(url, "_blank")}
            sx={{
              bgcolor: primary ? color : "transparent",
              color: primary ? "white" : color,
              border: primary ? "none" : `2px solid ${color}`,
              "&:hover": {
                bgcolor: primary ? color : `${color}15`,
                opacity: primary ? 0.85 : 1,
              },
              width: primary ? 44 : 38,
              height: primary ? 44 : 38,
            }}
          >
            <Icon sx={{ fontSize: primary ? 22 : 20 }} />
          </IconButton>
        ))}
      </Stack>
    </Box>
  );
};

const XIcon = (props: unknown) => (
  <SvgIcon {...props}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </SvgIcon>
);

const TikTokIcon = (props: unknown) => (
  <SvgIcon {...props}>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </SvgIcon>
);

// A to Z System Funnel Overview
const FunnelOverviewSection = () => {
  const theme = useTheme();
  const services = [
    {
      title: "Ai Job Match",
      description:
        "AI-powered matching connects you with opportunities that perfectly align with your skills",
      icon: <WorkOutline sx={{ fontSize: "2rem", color: "primary.main" }} />,
    },
    {
      title: "Smart Calendar",
      description:
        "Smart scheduling system coordinates interviews and meetings at optimal times",
      icon: <CalendarMonth sx={{ fontSize: "2rem", color: "primary.main" }} />,
    },
    {
      title: "Crypto agreements",
      description:
        "Secure platform handles project,team, tasks, payments, and contracts management",
      icon: <HandshakeIcon sx={{ fontSize: "2rem", color: "primary.main" }} />,
    },
  ];

  return (
    <Box
      sx={{
        py: { xs: 4, md: 5 },
        background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: "center", mb: { xs: 3, md: 4 } }}>
          <Typography
            variant="h4"
            sx={{
              mb: 2,
              fontWeight: 400,
              color: theme.palette.text.primary,
              fontFamily: "Google Sans, sans-serif",
              fontSize: { xs: "1.75rem", md: "2.125rem" },
            }}
          >
            We offer A to Z system.
          </Typography>
        </Box>

        {/* Desktop layout with arrows */}
        <Box
          sx={{
            display: { xs: "none", md: "flex" },
            alignItems: "center",
            justifyContent: "center",
            gap: 3,
            maxWidth: "1000px",
            mx: "auto",
          }}
        >
          {services.map((service, index) => (
            <Box key={index} sx={{ display: "flex", alignItems: "center" }}>
              <Box
                sx={{
                  textAlign: "center",
                  p: 2.5,
                  borderRadius: "12px",
                  background: theme.palette.background.paper,
                  backdropFilter: "blur(10px)",
                  border: `1px solid ${theme.palette.divider}`,
                  boxShadow: `0 2px 12px ${theme.palette.mode === "dark" ? "rgba(0, 0, 0, 0.3)" : "rgba(0, 0, 0, 0.06)"}`,
                  minWidth: "240px",
                  maxWidth: "280px",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: `0 4px 20px ${theme.palette.primary.main}12`,
                  },
                }}
              >
                <Box
                  sx={{
                    mb: 1.5,
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  {service.icon}
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 500,
                    color: theme.palette.text.primary,
                    mb: 1,
                    fontFamily: "Google Sans, sans-serif",
                    fontSize: "1.1rem",
                  }}
                >
                  {service.title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: theme.palette.text.secondary,
                    lineHeight: 1.4,
                    fontSize: "0.875rem",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {service.description}
                </Typography>
              </Box>

              {index < services.length - 1 && (
                <Box
                  sx={{
                    mx: 2,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "1.5rem",
                      color: theme.palette.primary.main,
                      fontWeight: "bold",
                    }}
                  >
                    →
                  </Typography>
                </Box>
              )}
            </Box>
          ))}
        </Box>

        {/* Mobile layout without arrows */}
        <Box
          sx={{
            display: { xs: "flex", md: "none" },
            flexDirection: "column",
            gap: 2,
            maxWidth: "400px",
            mx: "auto",
          }}
        >
          {services.map((service, index) => (
            <Box
              key={index}
              sx={{
                textAlign: "center",
                p: 2,
                borderRadius: "12px",
                background: theme.palette.background.paper,
                backdropFilter: "blur(10px)",
                border: `1px solid ${theme.palette.divider}`,
                boxShadow: `0 2px 8px ${theme.palette.mode === "dark" ? "rgba(0, 0, 0, 0.3)" : "rgba(0, 0, 0, 0.05)"}`,
              }}
            >
              <Box
                sx={{
                  mb: 1,
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                {service.icon}
              </Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 500,
                  color: theme.palette.text.primary,
                  mb: 0.5,
                  fontFamily: "Google Sans, sans-serif",
                  fontSize: "1rem",
                }}
              >
                {service.title}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.text.secondary,
                  lineHeight: 1.4,
                  fontSize: "0.8rem",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {service.description}
              </Typography>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

// Email Inbox Component
const EmailInboxItem = ({
  from,
  subject,
  preview,
  time,
  isUnread = false,
}: {
  from: string;
  subject: string;
  preview: string;
  time: string;
  isUnread?: boolean;
}) => {
  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        p: 2,
        mb: 2,
        backgroundColor: "background.paper",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          From: {from}
        </Typography>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          {time}
        </Typography>
      </Box>
      <Typography variant="h6" sx={{ mb: 0.5 }}>
        {subject}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          color: "text.secondary",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {preview}
      </Typography>
    </Box>
  );
};

// Step 3: Email Notifications Component - Minimal Professional Design
const EmailNotificationsStep = () => {
  const theme = useTheme();
  const emails = [
    {
      subject: "AI Developer Position Match",
      preview:
        "Perfect match found! A startup needs an AI developer for autonomous agents...",
      time: "2m",
    },
    {
      subject: "Co-founder Opportunity",
      preview:
        "Agricultural tech startup seeking co-founder with your expertise...",
      time: "1h",
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        py: { xs: 6, md: 8 },
        background: theme.palette.background.default,
      }}
    >
      <Container maxWidth="lg">
        <Grid2 container spacing={{ xs: 4, md: 8 }} alignItems="center">
          {/* Left Side - Title & Subtitle */}
          <Grid2 xs={12} md={5}>
            <Box sx={{ textAlign: { xs: "center", md: "left" } }}>
              <Typography
                variant="h2"
                sx={{
                  mb: 2,
                  fontWeight: 300,
                  color: theme.palette.text.primary,
                  fontFamily: "Google Sans, sans-serif",
                  fontSize: { xs: "2.25rem", md: "2.75rem" },
                  lineHeight: 1.2,
                }}
              >
                Email Notifications
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: theme.palette.text.secondary,
                  fontWeight: 400,
                  lineHeight: 1.6,
                  fontSize: { xs: "1rem", md: "1.1rem" },
                  maxWidth: { xs: "100%", md: "400px" },
                }}
              >
                You do not like current matches? No problem. Get email alerts
                when new opportunities match your profile.
              </Typography>
            </Box>
          </Grid2>

          {/* Right Side - Email Book with Icon */}
          <Grid2 xs={12} md={7}>
            <Box
              sx={{
                display: "flex",
                justifyContent: { xs: "center", md: "flex-end" },
              }}
            >
              <Box
                sx={{
                  width: { xs: "100%", sm: "400px", md: "420px" },
                  maxWidth: "420px",
                  background: theme.palette.background.paper,
                  borderRadius: "8px",
                  boxShadow: `0 2px 12px ${theme.palette.mode === "dark" ? "rgba(0, 0, 0, 0.3)" : "rgba(0, 0, 0, 0.08)"}`,
                  border: `1px solid ${theme.palette.divider}`,
                  overflow: "hidden",
                }}
              >
                {/* Email Header with Icon */}
                <Box
                  sx={{
                    px: 3,
                    py: 2.5,
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    background: theme.palette.background.paper,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Badge
                      badgeContent={2}
                      sx={{
                        "& .MuiBadge-badge": {
                          backgroundColor: theme.palette.error.main,
                          color: theme.palette.error.contrastText,
                          fontWeight: "500",
                          fontSize: "0.7rem",
                          minWidth: "16px",
                          height: "16px",
                          borderRadius: "8px",
                        },
                      }}
                    >
                      <Email
                        sx={{ fontSize: 20, color: theme.palette.primary.main }}
                      />
                    </Badge>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 500,
                        color: theme.palette.text.primary,
                        fontSize: "0.9rem",
                      }}
                    >
                      Job Alerts
                    </Typography>
                  </Box>
                </Box>

                {/* Email List */}
                <Box>
                  {emails.map((email, index) => (
                    <Box
                      key={index}
                      sx={{
                        py: 2,
                        px: 3,
                        borderBottom:
                          index < emails.length - 1
                            ? `1px solid ${theme.palette.divider}`
                            : "none",
                        "&:hover": {
                          backgroundColor: theme.palette.action.hover,
                        },
                        transition: "background-color 0.2s ease",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          mb: 0.5,
                        }}
                      >
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 500,
                            color: theme.palette.text.primary,
                            fontSize: "0.95rem",
                            lineHeight: 1.3,
                          }}
                        >
                          {email.subject}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: theme.palette.text.secondary,
                            fontSize: "0.75rem",
                            ml: 2,
                            flexShrink: 0,
                          }}
                        >
                          {email.time}
                        </Typography>
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{
                          color: theme.palette.text.secondary,
                          fontSize: "0.85rem",
                          lineHeight: 1.4,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {email.preview}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          </Grid2>
        </Grid2>
      </Container>
    </Box>
  );
};



const CryptoAgreementStep = () => {
  const [visibleFields, setVisibleFields] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);

  const fields = [
    { id: "amount", label: "Amount", value: "500 USDC" },
    { id: "receiver", label: "Receiver", value: "John Smith" },
    { id: "type", label: "Type", value: "Escrow" },
    { id: "stakingTime", label: "Staking Time", value: "30 days" },
    {
      id: "conditions",
      label: "Conditions",
      value: "Build AI job match ICP canister in 30 days",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleFields((prev) => {
        if (prev <= fields.length) {
          const next = prev + 1;
          if (next > fields.length) setIsCompleted(true);
          return next;
        }
        setIsCompleted(false);
        return 1;
      });
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box
      sx={{ minHeight: "100vh", display: "flex", alignItems: "center", py: 8 }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 4, md: 8 },
            flexDirection: { xs: "column", md: "row" },
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                mb: 2,
                fontSize: { xs: "2rem", md: "3rem" },
              }}
            >
              Create Crypto Agreement
            </Typography>
            <Typography
              variant="h5"
              sx={{ mb: 4, fontWeight: 400, lineHeight: 1.4, opacity: 0.9 }}
            >
              After finding your match, create a secure blockchain agreement
              with built-in escrow and milestone tracking
            </Typography>
          </Box>

          <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
            <Card
              sx={{
                p: 4,
                borderRadius: 3,
                maxWidth: 400,
                minHeight: 400,
                width: "100%",
                position: "relative",
                overflow: "visible",
                transform: isCompleted ? "scale(1.02)" : "scale(1)",
                transition: "transform 0.5s ease",
                // Add margin to prevent clipping
                mt: 3,
                mr: 3,
              }}
            >
              {isCompleted && (
                <Fade in={true} timeout={1000}>
                  <Box
                    sx={{
                      position: "absolute",
                      top: -20,
                      right: -20,
                      zIndex: 10,
                    }}
                  >
                    <Shield
                      sx={{
                        fontSize: 60,
                        color: "success.main",
                        filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.2))",
                      }}
                    />
                  </Box>
                </Fade>
              )}

              <Box
                sx={{ display: "flex", alignItems: "center", mb: 3, gap: 1 }}
              >
                <HandshakeIcon sx={{ fontSize: 24 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Agreement Details
                </Typography>
              </Box>

              <Stack spacing={3}>
                {visibleFields >= 1 && (
                  <Fade in={true} timeout={800}>
                    <Box sx={{ minHeight: 60 }}>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        Amount
                      </Typography>
                      <Typography variant="h4" fontWeight="bold">
                        500 USDC
                      </Typography>
                    </Box>
                  </Fade>
                )}

                {visibleFields >= 2 && (
                  <Fade in={true} timeout={800}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar
                        sx={{ width: 50, height: 50 }}
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
                      >
                        JS
                      </Avatar>
                      <Box>
                        <Typography variant="body2">Receiver</Typography>
                        <Typography variant="h6">John Smith</Typography>
                        <Typography variant="body2" sx={{ opacity: 0.7 }}>
                          Senior ICP Developer
                        </Typography>
                      </Box>
                    </Box>
                  </Fade>
                )}
                {visibleFields >= 3 && (
                  <Fade in={true} timeout={800}>
                    <Box>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        Type
                      </Typography>
                      <Chip label="Escrow" variant="outlined" />
                    </Box>
                  </Fade>
                )}

                {visibleFields >= 4 && (
                  <Fade in={true} timeout={800}>
                    <Box>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        Staking Time
                      </Typography>
                      <Typography variant="h6">30 days</Typography>
                    </Box>
                  </Fade>
                )}

                {visibleFields >= 5 && (
                  <Fade in={true} timeout={800}>
                    <Box>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        Conditions
                      </Typography>
                      <Typography variant="body1" sx={{ fontStyle: "italic" }}>
                        &quot;Build AI job match ICP canister in 30 days&quot;
                      </Typography>
                    </Box>
                  </Fade>
                )}
              </Stack>
            </Card>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

const CryptoAgreementProofsStep = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef(null);

  const proofs = [
    {
      title: "Proof of Existence",
      subtitle: "Deposit funds before making promises",
      icon: <AttachMoney sx={{ fontSize: "2.5rem", color: "primary.main" }} />,
    },
    {
      title: "Proof of Stake",
      subtitle: "Build trust with upfront staking",
      icon: <Lock sx={{ fontSize: "2.5rem", color: "primary.main" }} />,
    },
    {
      title: "Proof of Cap",
      subtitle: "Smart limits prevent oversized commitments",
      icon: <BarChart sx={{ fontSize: "2.5rem", color: "primary.main" }} />,
    },
    {
      title: "Proof of Reputation",
      subtitle: "Your track record shows transparently",
      icon: <Star sx={{ fontSize: "2.5rem", color: "primary.main" }} />,
    },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const container = containerRef.current;
      if (!container) return;

      // Skip scroll effects on mobile devices
      if (window.innerWidth < 768) {
        return;
      }

      const rect = container.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      if (rect.top <= 0 && rect.bottom >= windowHeight) {
        const scrollProgress =
          Math.abs(rect.top) / (rect.height - windowHeight);
        const newActiveIndex = Math.min(
          proofs.length - 1,
          Math.floor(scrollProgress * proofs.length),
        );
        setActiveIndex(newActiveIndex);
      }
    };

    // Add a simple auto-rotation for mobile devices
    let interval: NodeJS.Timeout;
    if (window.innerWidth < 768) {
      interval = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % proofs.length);
      }, 3000);
    }

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (interval) clearInterval(interval);
    };
  }, [proofs.length]);

  return (
    <Box
      ref={containerRef}
      sx={{
        height: { xs: "auto", md: "400vh" },
        py: 8,
        minHeight: { xs: "100vh", md: "auto" },
      }}
    >
      <Box
        sx={{
          position: { xs: "static", md: "sticky" },
          top: { xs: "auto", md: "20vh" },
          height: { xs: "auto", md: "60vh" },
          display: "flex",
          alignItems: "center",
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h2"
            sx={{
              textAlign: "center",
              mb: { xs: 4, md: 8 },
              fontWeight: 700,
              fontSize: { xs: "2rem", md: "3rem" },
            }}
          >
            Crypto Agreement Proofs
          </Typography>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: { xs: 2, md: 3 },
            }}
          >
            {proofs.map((proof, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  alignItems: { xs: "flex-start", md: "center" },
                  gap: { xs: 2, md: 3 },
                  p: { xs: 2, md: 3 },
                  borderRadius: 2,
                  opacity: { xs: 1, md: activeIndex === index ? 1 : 0.3 },
                  transform: {
                    xs: "none",
                    md: activeIndex === index ? "scale(1.05)" : "scale(1)",
                  },
                  transition: "all 0.5s ease",
                  flexDirection: { xs: "column", sm: "row" },
                  textAlign: { xs: "center", sm: "left" },
                  border: { xs: "1px solid", md: "none" },
                  borderColor: { xs: "divider", md: "transparent" },
                  backgroundColor: {
                    xs: "background.paper",
                    md: "transparent",
                  },
                }}
              >
                <Box
                  sx={{
                    fontSize: { xs: "2rem", md: "2.5rem" },
                    flexShrink: 0,
                    alignSelf: { xs: "center", sm: "flex-start" },
                  }}
                >
                  {proof.icon}
                </Box>

                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="h5"
                    sx={{
                      mb: 1,
                      fontWeight: 600,
                      fontSize: { xs: "1.25rem", md: "1.5rem" },
                    }}
                  >
                    {proof.title}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      opacity: 0.8,
                      fontSize: { xs: "0.9rem", md: "1rem" },
                    }}
                  >
                    {proof.subtitle}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>
    </Box>
  );
};
// Step 7: Project Management Component
const ProjectManagementStep = () => {
  const [currentContract, setCurrentContract] = useState(0);
  const [animatingPromises, setAnimatingPromises] = useState(false);
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [promiseCount, setPromiseCount] = useState(3);
  const [promiseAmount, setPromiseAmount] = useState(1500);

  const contracts = [
    {
      id: "1",
      name: "AI Agent Development",
      status: "Active",
      promises: 3,
      amount: 1500,
      payments: 1,
      paidAmount: 500,
      creator: "Sarah Chen",
      role: "Project Manager",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    },
    {
      id: "2",
      name: "ICP Canister Integration",
      status: "Pending",
      promises: 2,
      amount: 2000,
      payments: 0,
      paidAmount: 0,
      creator: "Alex Rodriguez",
      role: "Tech Lead",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentContract((prev) => (prev + 1) % contracts.length);
      setAnimatingPromises(true);
      setPromiseCount((prev) => (prev === 3 ? 2 : 3));
      setPromiseAmount((prev) => (prev === 1500 ? 2000 : 1500));
      setNotificationVisible(true);

      setTimeout(() => {
        setAnimatingPromises(false);
        setNotificationVisible(false);
      }, 2000);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const currentContractData = contracts[currentContract];

  return (
    <Box
      sx={{ minHeight: "100vh", display: "flex", alignItems: "center", py: 8 }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 6,
            alignItems: "center",
          }}
        >
          {/* Left: Text Content */}
          <Box>
            <Typography variant="h3" sx={{ mb: 2, fontWeight: 600 }}>
              Project Management
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.7, mb: 4 }}>
              Manage team tasks, payments, and contracts A-Z with help of AI
            </Typography>

            {/* AI Features */}
            <Typography variant="h6" sx={{ mb: 3, opacity: 0.8 }}>
              AI-Powered Management
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 3,
              }}
            >
              {[
                {
                  icon: (
                    <SmartToy
                      sx={{ fontSize: "1.75rem", color: "primary.main" }}
                    />
                  ),
                  text: "Smart task allocation",
                },
                {
                  icon: (
                    <AttachMoney
                      sx={{ fontSize: "1.75rem", color: "primary.main" }}
                    />
                  ),
                  text: "Automated payment tracking",
                },
                {
                  icon: (
                    <BarChart
                      sx={{ fontSize: "1.75rem", color: "primary.main" }}
                    />
                  ),
                  text: "Progress analytics",
                },
                {
                  icon: (
                    <Notifications
                      sx={{ fontSize: "1.75rem", color: "primary.main" }}
                    />
                  ),
                  text: "Real-time notifications",
                },
              ].map((feature, index) => (
                <Box
                  key={index}
                  sx={{ display: "flex", alignItems: "center", gap: 2 }}
                >
                  {feature.icon}
                  <Typography variant="body2" sx={{ opacity: 0.7 }}>
                    {feature.text}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Right: Contract Card */}
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Box sx={{ position: "relative", width: "100%", maxWidth: 350 }}>
              <Fade in={notificationVisible} timeout={500}>
                <Box
                  sx={{
                    position: "absolute",
                    top: -8,
                    right: -8,
                    zIndex: 10,
                    background: "linear-gradient(135deg, #ff4444, #cc0000)",
                    color: "white",
                    borderRadius: "50%",
                    width: 24,
                    height: 24,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    boxShadow: "0 2px 8px rgba(255, 68, 68, 0.4)",
                    border: "2px solid white",
                    animation: "bounce 0.5s ease-in-out",
                    "@keyframes bounce": {
                      "0%": { transform: "scale(0)" },
                      "50%": { transform: "scale(1.2)" },
                      "100%": { transform: "scale(1)" },
                    },
                  }}
                >
                  {currentContract + 1}
                </Box>
              </Fade>

              <Card
                sx={{
                  p: 3,
                  borderRadius: 3,
                  background: "rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                  border: notificationVisible
                    ? "2px solid #ff4444"
                    : "1px solid rgba(255, 255, 255, 0.2)",
                  boxShadow: notificationVisible
                    ? "0 0 20px rgba(255, 68, 68, 0.3)"
                    : "none",
                  transition: "all 0.3s ease",
                  transform: animatingPromises ? "scale(1.02)" : "scale(1)",
                }}
              >
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="h6"
                    component="div"
                    sx={{
                      fontWeight: 600,
                      color: "text.primary",
                      mb: 1,
                      transition: "opacity 0.5s ease",
                    }}
                  >
                    {currentContractData.name}
                  </Typography>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Avatar
                      sx={{ width: 32, height: 32, bgcolor: "primary.main" }}
                      src={currentContractData.avatar}
                    >
                      {currentContractData.creator
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight={500}>
                        {currentContractData.creator}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {currentContractData.role}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Stack spacing={2}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      p: 1.5,
                      background: "rgba(255, 255, 255, 0.1)",
                      backdropFilter: "blur(10px)",
                      WebkitBackdropFilter: "blur(10px)",
                      borderRadius: 2,
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      transition: "all 0.5s ease",
                      transform: animatingPromises ? "scale(1.05)" : "scale(1)",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <HandshakeIcon
                        sx={{ fontSize: 18, color: "primary.main" }}
                      />
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        fontWeight={500}
                      >
                        Promises
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: "right" }}>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        sx={{
                          transition: "all 0.5s ease",
                          color: animatingPromises
                            ? "primary.main"
                            : "text.primary",
                        }}
                      >
                        {promiseCount}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          transition: "all 0.5s ease",
                          color: animatingPromises
                            ? "primary.main"
                            : "text.secondary",
                        }}
                      >
                        ${promiseAmount}
                      </Typography>
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      p: 1.5,
                      background: "rgba(255, 255, 255, 0.1)",
                      backdropFilter: "blur(10px)",
                      WebkitBackdropFilter: "blur(10px)",
                      borderRadius: 2,
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CheckCircleIcon
                        sx={{ fontSize: 18, color: "success.main" }}
                      />
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        fontWeight={500}
                      >
                        Payments
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: "right" }}>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        color="text.primary"
                      >
                        {currentContractData.payments}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ${currentContractData.paidAmount}
                      </Typography>
                    </Box>
                  </Box>
                </Stack>

                <Box sx={{ mt: 2 }}>
                  <Chip
                    label={currentContractData.status}
                    size="small"
                    variant="filled"
                    sx={{
                      background:
                        currentContractData.status === "Active"
                          ? "linear-gradient(135deg, #4caf50, #2e7d32)"
                          : "linear-gradient(135deg, #ff9800, #f57c00)",
                      color: "white",
                      fontWeight: 500,
                    }}
                  />
                </Box>
              </Card>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

// Live Platform Stats Section
const LivePlatformStatsSection = () => {
  const theme = useTheme();
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
  }, [isVisible]);

  const statsData = [
    {
      value: stats.users,
      label: "Total Users",
      icon: <PersonAdd sx={{ fontSize: "2rem", color: "primary.main" }} />,
      color: theme.palette.primary.main,
    },
    {
      value: stats.activeUsers,
      label: "Active Users",
      icon: <TrendingUp sx={{ fontSize: "2rem", color: "success.main" }} />,
      color: theme.palette.success.main,
    },
    {
      value: stats.totalDeposit,
      label: "Total Value",
      prefix: "$",
      icon: <Payment sx={{ fontSize: "2rem", color: "warning.main" }} />,
      color: theme.palette.warning.main,
    },
    {
      value: stats.jobsCount,
      label: "Jobs Posted",
      icon: <Assignment sx={{ fontSize: "2rem", color: "info.main" }} />,
      color: theme.palette.info.main,
    },
    {
      value: stats.talentsCount,
      label: "Talents",
      icon: <Star sx={{ fontSize: "2rem", color: "secondary.main" }} />,
      color: theme.palette.secondary.main,
    },
  ];

  return (
    <Box
      ref={statsRef}
      sx={{
        py: 5,
        background: theme.palette.background.default,
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 500,
              color: theme.palette.text.primary,
              fontFamily: "Google Sans, sans-serif",
              fontSize: { xs: "1.5rem", md: "1.75rem" },
            }}
          >
            Live Platform Status
          </Typography>
        </Box>

        <Grid2 container spacing={2} justifyContent="center">
          {statsData.map((stat, i) => (
            <Grid2 xs={6} sm={4} md={2.4} key={i}>
              <Card
                sx={{
                  p: 2,
                  textAlign: "center",
                  background: theme.palette.background.paper,
                  borderRadius: "12px",
                  border: `1px solid ${theme.palette.divider}`,
                  boxShadow: `0 2px 8px ${theme.palette.mode === "dark" ? "rgba(0, 0, 0, 0.2)" : "rgba(0, 0, 0, 0.05)"}`,
                  transition: "all 0.2s ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: `0 4px 12px ${stat.color}15`,
                  },
                }}
              >
                <Box sx={{ mb: 1 }}>{stat.icon}</Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 600,
                    color: stat.color,
                    mb: 0.5,
                    fontFamily: "Google Sans, sans-serif",
                    fontSize: { xs: "1.5rem", md: "1.75rem" },
                  }}
                >
                  {stat.prefix || ""}
                  {stat.value.toLocaleString()}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: theme.palette.text.secondary,
                    fontWeight: 400,
                    fontSize: { xs: "0.75rem", md: "0.85rem" },
                  }}
                >
                  {stat.label}
                </Typography>
              </Card>
            </Grid2>
          ))}
        </Grid2>
      </Container>
    </Box>
  );
};

// Enhanced Footer Component
const SimpleFooter = () => {
  const socialLinks = [
    {
      name: "GitHub",
      icon: GitHubIcon,
      url: "https://github.com/aliscie2/oDoc",
    },
    { name: "X", icon: XIcon, url: "https://x.com/odoc_ic" },
    { name: "YouTube", icon: YouTube, url: "https://www.youtube.com/@odoc_ic" },
  ];

  return (
    <Box
      component="footer"
      sx={{
        mt: 8,
        py: 4,
        backgroundColor: "background.paper",
        borderTop: "1px solid",
        borderColor: "divider",
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "center", md: "flex-start" },
            gap: 3,
            mb: 3,
          }}
        >
          {/* Brand Section */}
          <Box sx={{ textAlign: { xs: "center", md: "left" } }}>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
              {window.location.hostname}
            </Typography>
            <Typography
              variant="body2"
              sx={{ opacity: 0.7, maxWidth: 280, fontSize: "0.875rem" }}
            >
              AI-powered job matching • Smart contracts • Team management
            </Typography>
          </Box>

          {/* Links Section */}
          <Box
            sx={{
              display: "flex",
              gap: 4,
              textAlign: { xs: "center", md: "left" },
            }}
          >
            <Box>
              <Typography
                variant="body2"
                sx={{ mb: 1, fontWeight: 500, fontSize: "0.875rem" }}
              >
                Resources
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  opacity: 0.6,
                  cursor: "pointer",
                  "&:hover": { opacity: 1 },
                  fontSize: "0.8rem",
                }}
                component={Link}
                to="/white_paper"
              >
                White Paper
              </Typography>
            </Box>

            <Box>
              <Typography
                variant="body2"
                sx={{ mb: 1, fontWeight: 500, fontSize: "0.875rem" }}
              >
                Community
              </Typography>
              <Stack spacing={0.5}>
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <Box
                      key={social.name}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        cursor: "pointer",
                        opacity: 0.6,
                        "&:hover": { opacity: 1 },
                      }}
                      onClick={() => window.open(social.url, "_blank")}
                    >
                      <Icon sx={{ fontSize: 14 }} />
                      <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
                        {social.name}
                      </Typography>
                    </Box>
                  );
                })}
              </Stack>
            </Box>
          </Box>
        </Box>

        {/* Bottom Section */}
        <Divider sx={{ mb: 2, opacity: 0.2 }} />

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: "center",
            gap: 1,
            textAlign: { xs: "center", sm: "left" },
          }}
        >
          <Typography variant="body2" sx={{ opacity: 0.5, fontSize: "0.75rem" }}>
            © {new Date().getFullYear()} oDoc.app. All rights reserved.
          </Typography>

          <Typography
            variant="body2"
            sx={{
              opacity: 0.5,
              cursor: "pointer",
              "&:hover": { opacity: 1 },
              fontSize: "0.75rem",
            }}
            component={Link}
            to="/privacy"
          >
            Privacy Policy
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

const SEOComponent = () => {
  const seoData = {
    title: `${window.location.hostname} - ICP Jobs & Blockchain Developer Careers | AI Job Matching`,
    description:
      "Find blockchain developer jobs, ICP careers, and Web3 talent. AI-powered job matching platform for Internet Computer Protocol ecosystem. Smart contracts, remote positions, DeFinity careers.",
    keywords:
      "ICP jobs, blockchain developer jobs, DeFinity careers, Web3 jobs, Internet Computer Protocol jobs, blockchain engineer, smart contract developer, Rust developer, canister development, Web3 talent, blockchain recruitment, ICP project manager, crypto jobs, decentralized jobs, blockchain careers",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: window.location.hostname,
      url: window.location.origin,
      description:
        "AI-powered job matching platform for blockchain developers and Web3 talent in the ICP ecosystem",
      potentialAction: {
        "@type": "SearchAction",
        target: `${window.location.origin}/search?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
    jobPostingData: {
      "@context": "https://schema.org",
      "@type": "JobPosting",
      title: "Blockchain Developer - ICP Ecosystem",
      description:
        "Join the Internet Computer Protocol ecosystem. Remote blockchain development positions available.",
      hiringOrganization: {
        "@type": "Organization",
        name: window.location.hostname,
      },
      employmentType: "FULL_TIME",
      workHours: "Remote",
      skills: [
        "Rust",
        "TypeScript",
        "Blockchain",
        "Smart Contracts",
        "ICP",
        "Web3",
      ],
    },
  };

  return (
    <Helmet>
      <title>{seoData.title}</title>
      <meta name="description" content={seoData.description} />
      <meta name="keywords" content={seoData.keywords} />
      <link rel="canonical" href={window.location.href} />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={window.location.href} />
      <meta property="og:title" content={seoData.title} />
      <meta property="og:description" content={seoData.description} />
      <meta
        property="og:image"
        content={`${window.location.origin}/thumbnail.png`}
      />
      <meta property="og:site_name" content={window.location.hostname} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seoData.title} />
      <meta name="twitter:description" content={seoData.description} />
      <meta
        name="twitter:image"
        content={`${window.location.origin}/thumbnail.png`}
      />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(seoData.structuredData)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(seoData.jobPostingData)}
      </script>
    </Helmet>
  );
};

const FAQSection = () => {
  const faqs = [
    {
      q: "How does AI job matching work for blockchain developers?",
      a: "Our AI analyzes your skills, experience, and preferences to match you with relevant ICP projects, blockchain startups, and Web3 companies. The system learns from successful matches to improve recommendations.",
    },
    {
      q: "What types of ICP jobs are available?",
      a: "We feature Rust developers, canister engineers, full-stack Web3 developers, blockchain architects, project managers, and technical leads specializing in Internet Computer Protocol development.",
    },
    {
      q: "How do crypto agreements and smart contracts work?",
      a: "Our platform creates secure blockchain-based employment agreements with built-in escrow, milestone tracking, and automated payments. All contracts are transparent and immutable on the blockchain.",
    },
    {
      q: "Is the platform free for job seekers?",
      a: "Yes, job seekers can create profiles, receive AI matches, and apply to positions completely free. Premium features include priority matching and advanced filtering options.",
    },
    {
      q: "What makes this different from other job boards?",
      a: "We're built specifically for the Web3 ecosystem with AI-powered matching, integrated smart contracts, automated scheduling, and native crypto payments - eliminating traditional hiring friction.",
    },
    {
      q: "How do I get started as a blockchain developer?",
      a: "Simply create your profile, describe your Web3 experience and interests, and our AI will immediately start finding relevant opportunities in the ICP ecosystem and broader blockchain space.",
    },
  ];

  const structuredFAQ = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(structuredFAQ)}
      </script>
    </Helmet>
  );
};

// Main Landing Page Component
const LandingPage = () => {
  const isMobile = useMediaQuery("(max-width:900px)");
  const [state] = useState({ isMobile });

  return (
    <Box sx={{ position: "relative" }}>
      <Helmet>
        <title>AI Job Matching - Find Perfect Talent & Jobs</title>
        <meta
          name="description"
          content="AI-powered job matching platform connecting talent with opportunities. Real-time stats, smart agreements, and seamless collaboration."
        />
      </Helmet>

      {/* New Google-themed Hero Section with Real Data */}
      <HeroSection isMobile={isMobile} state={state} />

      {/* A to Z System Overview */}
      <FunnelOverviewSection />

      <AIJobMatchingFlow />
      <EmailNotificationsStep />
      <CalendarStep />
      <CryptoAgreementStep />
      <CryptoAgreementProofsStep />
      <ProjectManagementStep />
      <SocialMediaShare />
      <LivePlatformStatsSection />
      <SimpleFooter />
    </Box>
  );
};

export default LandingPage;
