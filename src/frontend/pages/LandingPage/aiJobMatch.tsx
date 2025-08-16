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
  useMediaQuery,
  Stack,
  Divider,
  IconButton,
  SvgIcon,
} from "@mui/material";
import {
  CheckCircle,
  TrendingUp,
  People,
  Work,
  SmartToy,
  Notifications,
  CalendarMonth,
  Code,
  Rocket,
} from "@mui/icons-material";
import ConnectWithoutContactIcon from "@mui/icons-material/ConnectWithoutContact";
import YouTubeIcon from "@mui/icons-material/YouTube";
import InstagramIcon from "@mui/icons-material/Instagram";
import GitHubIcon from "@mui/icons-material/GitHub";
import { useBackendContext } from "@/contexts/BackendContext";
import { useSelector } from "react-redux";
import { Helmet } from "react-helmet-async";
import JobTutorialComponent from "./jobTutorial";

const DiscordIcon = (props) => (
  <SvgIcon {...props}>
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
  </SvgIcon>
);
const XIcon = (props) => (
  <SvgIcon {...props}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </SvgIcon>
);

const EcosystemSection = () => {
  const isMobile = useMediaQuery("(max-width:900px)");

  return (
    <Box sx={{ mb: 10, overflow: "hidden" }}>
      <Container maxWidth="lg">
        <Grid container alignItems="center" spacing={6}>
          <Grid item xs={12} md={6} order={{ xs: 2, md: 1 }}>
            <Box
              sx={{
                position: "relative",
                p: 4,
                borderRadius: 4,
                background:
                  "linear-gradient(135deg, rgba(25,118,210,0.03) 0%, rgba(156,39,176,0.03) 100%)",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: 4,
                  background:
                    "linear-gradient(135deg, rgba(25,118,210,0.1) 0%, rgba(156,39,176,0.1) 100%)",
                  opacity: 0,
                  transition: "opacity 0.3s ease",
                },
                "&:hover::before": { opacity: 1 },
              }}
            >
              <img
                src={"/jobs.png"}
                alt="ICP Ecosystem Growth"
                style={{
                  width: "100%",
                  maxWidth: "400px",
                  height: "auto",
                  objectFit: "contain",
                  filter: "drop-shadow(0 8px 32px rgba(25,118,210,0.15))",
                  transition: "transform 0.3s ease, filter 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "scale(1.02)";
                  e.target.style.filter =
                    "drop-shadow(0 12px 40px rgba(25,118,210,0.25))";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "scale(1)";
                  e.target.style.filter =
                    "drop-shadow(0 8px 32px rgba(25,118,210,0.15))";
                }}
              />
            </Box>
          </Grid>

          <Grid item xs={12} md={6} order={{ xs: 1, md: 2 }}>
            <Box sx={{ pl: { md: 4 } }}>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  mb: 2,
                  fontSize: { xs: "2rem", md: "2.75rem" },
                  background:
                    "linear-gradient(135deg, #1976d2 0%, #9c27b0 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  letterSpacing: "-0.02em",
                  lineHeight: 1.2,
                }}
              >
                The Fastest Growing Web3 Ecosystem
              </Typography>

              <Typography
                variant="h6"
                sx={{
                  color: "text.secondary",
                  mb: 4,
                  fontWeight: 400,
                  lineHeight: 1.6,
                }}
              >
                Internet Computer Protocol is revolutionizing decentralized
                development with enterprise-grade reliability
              </Typography>

              <Stack spacing={3}>
                {[
                  {
                    icon: <Rocket sx={{ fontSize: 28 }} />,
                    metric: "40x",
                    title: "Developer Growth",
                    desc: "Fastest-growing Web3 developer ecosystem since 2018",
                  },
                  {
                    icon: <ConnectWithoutContactIcon sx={{ fontSize: 28 }} />,
                    metric: "30+",
                    title: "Premium Job Boards",
                    desc: "Connected to top crypto VC and Web3 talent networks",
                  },
                  {
                    icon: <TrendingUp sx={{ fontSize: 28 }} />,
                    metric: "∞",
                    title: "Limitless Scale",
                    desc: "Enterprise-grade infrastructure attracting Fortune 500 companies",
                  },
                ].map((item, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      p: 2,
                      borderRadius: 2,
                      transition: "all 0.3s ease",
                      "&:hover": {
                        bgcolor: "action.hover",
                        transform: "translateX(8px)",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 56,
                        height: 56,
                        borderRadius: 2,
                        background:
                          "linear-gradient(135deg, rgba(25,118,210,0.1) 0%, rgba(156,39,176,0.1) 100%)",
                        color: "primary.main",
                        mr: 3,
                        flexShrink: 0,
                      }}
                    >
                      {item.icon}
                    </Box>
                    <Box>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "baseline",
                          mb: 0.5,
                        }}
                      >
                        <Typography
                          variant="h5"
                          sx={{
                            fontWeight: 700,
                            color: "primary.main",
                            mr: 1,
                          }}
                        >
                          {item.metric}
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {item.title}
                        </Typography>
                      </Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ lineHeight: 1.5 }}
                      >
                        {item.desc}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

const PageFooter = () => {
  const { isDarkMode } = useSelector((state) => state.uiState);

  const socialLinks = [
    {
      name: "GitHub",
      url: "https://github.com/aliscie2/oDoc",
      icon: GitHubIcon,
      color: isDarkMode ? "#24292e" : "#1f2328",
    },
    {
      name: "X",
      url: "https://x.com/icpjob",
      icon: XIcon,
      color: "#000000",
    },
    {
      name: "YouTube",
      url: "https://www.youtube.com/@odocic",
      icon: YouTubeIcon,
      color: isDarkMode ? "#FF0000" : "#dc2626",
    },
    {
      name: "Instagram",
      url: "https://www.instagram.com/odoc_ic",
      icon: InstagramIcon,
      color: isDarkMode ? "#E4405F" : "#db2777",
    },
    {
      name: "Discord",
      url: "https://discord.gg/uxMJHBk8",
      icon: DiscordIcon,
      color: isDarkMode ? "#5865F2" : "#4f46e5",
    },
  ];

  const handleClick = (url) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleContactClick = () => {
    window.open("https://x.com/icpjob", "_blank", "noopener,noreferrer");
  };

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: isDarkMode ? "#1a1a1a" : "#f8f9fa",
        borderTop: `1px solid ${isDarkMode ? "#333" : "#e9ecef"}`,
        mt: "auto",
        py: 6,
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
          }}
        >
          {/* Brand/Logo Section */}
          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="h4"
              sx={{
                fontSize: "2rem",
                fontWeight: "bold",
                mb: 1,
                color: isDarkMode ? "#fff" : "#212529",
              }}
            >
              IPCJOBS.com
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: isDarkMode ? "#adb5bd" : "#6c757d",
                maxWidth: 400,
                mx: "auto",
              }}
            >
              AI-powered job matching for the ICP ecosystem. Find your perfect
              role or talent today.
            </Typography>
          </Box>

          {/* Social Links */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: 3,
            }}
          >
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <IconButton
                  key={social.name}
                  onClick={() => handleClick(social.url)}
                  aria-label={`Visit our ${social.name}`}
                  sx={{
                    width: 48,
                    height: 48,
                    background: social.color,
                    transition: "all 0.3s ease-in-out",
                    "&:hover": {
                      background: social.color,
                      transform: "scale(1.1)",
                      boxShadow: isDarkMode
                        ? "0 4px 12px rgba(0,0,0,0.3)"
                        : "0 4px 12px rgba(0,0,0,0.15)",
                      "& .MuiSvgIcon-root": {
                        transform: "rotate(12deg)",
                      },
                    },
                    "& .MuiSvgIcon-root": {
                      color: "#fff",
                      transition: "transform 0.3s ease-in-out",
                      fontSize: social.name === "X" ? 20 : 24,
                    },
                  }}
                >
                  <Icon />
                </IconButton>
              );
            })}
          </Box>

          {/* Contact Section */}
          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="body2"
              sx={{
                color: isDarkMode ? "#adb5bd" : "#6c757d",
                mb: 1,
              }}
            >
              Have questions or want to get in touch?
            </Typography>
            <Typography
              variant="body2"
              onClick={handleContactClick}
              sx={{
                color: isDarkMode ? "#4fc3f7" : "#0d6efd",
                cursor: "pointer",
                textDecoration: "underline",
                "&:hover": {
                  color: isDarkMode ? "#29b6f6" : "#0a58ca",
                },
              }}
            >
              Contact us on Twitter
            </Typography>
          </Box>

          <Divider
            sx={{
              width: "100%",
              bgcolor: isDarkMode ? "#333" : "#dee2e6",
            }}
          />

          {/* Copyright */}
          <Typography
            variant="body2"
            sx={{
              color: isDarkMode ? "#6c757d" : "#868e96",
              textAlign: "center",
            }}
          >
            © {new Date().getFullYear()} ICPJobs.com. Made by oDoc.app team.
            All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};
const StatsSection = () => {
  const [stats, setStats] = useState({ users: 0, jobs: 0, talents: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const { backendActor } = useBackendContext();
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
    const fetchStats = async () => {
      try {
        const response = await backendActor.get_sns_status();
        if (response.Ok) {
          const { number_users, jobs_count, talents_count } = response.Ok;
          const animateCount = (target, setter) => {
            let current = 0;
            const increment = target / 60;
            const timer = setInterval(() => {
              current += increment;
              if (current >= target) {
                setter(Math.floor(target));
                clearInterval(timer);
              } else {
                setter(Math.floor(current));
              }
            }, 25);
          };
          animateCount(number_users, (val) =>
            setStats((prev) => ({ ...prev, users: val })),
          );
          animateCount(jobs_count || 0, (val) =>
            setStats((prev) => ({ ...prev, jobs: val })),
          );
          animateCount(talents_count || 0, (val) =>
            setStats((prev) => ({ ...prev, talents: val })),
          );
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
    };
    fetchStats();
  }, [isVisible, backendActor]);

  return (
    <Box ref={statsRef} sx={{ width: "100%", py: 4 }}>
      <Grid container spacing={6} textAlign="center">
        {[
          {
            value: stats.users,
            label: "Users",
            icon: <People sx={{ fontSize: 32 }} />,
          },
          {
            value: stats.jobs,
            label: "Jobs",
            icon: <Work sx={{ fontSize: 32 }} />,
          },
          {
            value: stats.talents,
            label: "Talents",
            icon: <Code sx={{ fontSize: 32 }} />,
          },
        ].map((stat, i) => (
          <Grid item xs={4} key={i}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                transition: "transform 0.3s ease",
                "&:hover": { transform: "translateY(-4px)" },
              }}
            >
              <Box
                sx={{
                  color: "primary.main",
                  mb: 1.5,
                  opacity: 0.9,
                }}
              >
                {stat.icon}
              </Box>
              <Typography
                variant="h3"
                fontWeight={700}
                color="primary"
                sx={{
                  fontSize: { xs: "2rem", md: "2.5rem" },
                  letterSpacing: "-0.02em",
                }}
              >
                {stat.value.toLocaleString()}+
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{
                  fontWeight: 500,
                  mt: 0.5,
                }}
              >
                {stat.label}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default function ICPJobsLandingPage() {
  const isMobile = useMediaQuery("(max-width:900px)");

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Helmet>
        <title>ICPJOBS.com</title>
        <link rel="icon" type="image/png" href={"/icpjobs_logo.png"} />
      </Helmet>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Hero Section */}
        <Box sx={{ textAlign: "center", py: { xs: 6, md: 10 }, mb: 8 }}>
          <Typography
            variant="h1"
            sx={{
              fontWeight: 800,
              mb: 3,
              fontSize: { xs: "2.5rem", md: "4rem" },
              background: "linear-gradient(135deg, #1976d2 0%, #9c27b0 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
            }}
          >
            ICPJOBS.com
          </Typography>

          <Typography
            variant="h4"
            color="text.secondary"
            sx={{
              mb: 4,
              fontSize: { xs: "1.5rem", md: "2rem" },
              fontWeight: 400,
              maxWidth: 700,
              mx: "auto",
              lineHeight: 1.4,
            }}
          >
            AI-Powered Career Matching for the Internet Computer Ecosystem, and
            everyone.
          </Typography>
          <Stack
            direction="row"
            spacing={1}
            sx={{
              justifyContent: "center",
              flexWrap: "wrap",
              gap: 1,
              mb: 6,
            }}
          >
            {[
              "AI Precision",
              "ICP Expertise",
              "Smart Scheduling",
              "Instant Alerts",
            ].map((label) => (
              <Chip
                key={label}
                label={label}
                variant="outlined"
                sx={{
                  borderRadius: 6,
                  px: 1,
                  fontWeight: 500,
                  "&:hover": {
                    bgcolor: "primary.main",
                    color: "white",
                    borderColor: "primary.main",
                  },
                }}
              />
            ))}
          </Stack>

          <StatsSection />
        </Box>
        <JobTutorialComponent />
        <Divider style={{ marginBottom: "50px" }} />
        <EcosystemSection />

        {/* Main Features - Simplified */}
        <Box sx={{ mb: 10 }}>
          <Container maxWidth="lg">
            <Typography
              variant="h3"
              textAlign="center"
              sx={{
                fontWeight: 700,
                mb: 2,
                fontSize: { xs: "2rem", md: "2.5rem" },
              }}
            >
              Enterprise-Grade Features
            </Typography>
            <Typography
              variant="h6"
              textAlign="center"
              color="text.secondary"
              sx={{
                mb: 6,
                maxWidth: 600,
                mx: "auto",
              }}
            >
              Professional tools designed for serious career advancement
            </Typography>

            <Grid container spacing={4}>
              {[
                {
                  title: "AI Job Matching",
                  description:
                    "Precision matching powered by machine learning algorithms",
                  icon: <SmartToy sx={{ fontSize: 32 }} />,
                  features: [
                    "Intelligent skill analysis",
                    "Personalized recommendations",
                    "Auto-generated applications",
                    "Success rate optimization",
                  ],
                },
                {
                  title: "Smart Calendar AI",
                  description:
                    "Never miss opportunities with intelligent scheduling",
                  icon: <CalendarMonth sx={{ fontSize: 32 }} />,
                  features: [
                    "AI scheduling assistant",
                    "Conflict resolution",
                    "Automated reminders",
                    "Multi-platform sync",
                  ],
                },
                {
                  title: "Notifications",
                  description: "Instant alerts for high-value opportunities",
                  icon: <Notifications sx={{ fontSize: 32 }} />,
                  features: [
                    "Real-time job alerts",
                    "Quality filtering",
                    "Spam protection",
                    "Custom preferences",
                  ],
                },
                {
                  title: "ICP Ecosystem Focus",
                  description:
                    "Specialized network for Internet Computer professionals",
                  icon: <Code sx={{ fontSize: 32 }} />,
                  features: [
                    "Curated ICP opportunities",
                    "Web3 talent pool",
                    "Blockchain expertise",
                    "Canister development",
                  ],
                },
              ].map((feature, idx) => (
                <Grid item xs={12} md={6} key={idx}>
                  <Card
                    sx={{
                      height: "100%",
                      borderRadius: 3,
                      border: "1px solid",
                      borderColor: "divider",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        borderColor: "primary.main",
                        transform: "translateY(-4px)",
                        boxShadow: "0 12px 40px rgba(25,118,210,0.1)",
                      },
                    }}
                  >
                    <CardContent sx={{ p: 4 }}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 3 }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 56,
                            height: 56,
                            borderRadius: 2,
                            background:
                              "linear-gradient(135deg, rgba(25,118,210,0.1) 0%, rgba(156,39,176,0.1) 100%)",
                            color: "primary.main",
                            mr: 2,
                          }}
                        >
                          {feature.icon}
                        </Box>
                        <Typography variant="h5" fontWeight={600}>
                          {feature.title}
                        </Typography>
                      </Box>
                      <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{ mb: 3, lineHeight: 1.6 }}
                      >
                        {feature.description}
                      </Typography>
                      <List dense sx={{ "& .MuiListItem-root": { pl: 0 } }}>
                        {feature.features.map((item, i) => (
                          <ListItem key={i}>
                            <CheckCircle
                              sx={{
                                color: "success.main",
                                mr: 1.5,
                                fontSize: 18,
                              }}
                            />
                            <ListItemText
                              primary={item}
                              sx={{
                                "& .MuiTypography-root": { fontSize: "0.9rem" },
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
          </Container>
        </Box>

        {/* CTA Section - More Professional */}
        <Box
          sx={{
            textAlign: "center",
            py: 8,
            mb: 4,
            background:
              "linear-gradient(135deg, rgba(25,118,210,0.02) 0%, rgba(156,39,176,0.02) 100%)",
            borderRadius: 4,
          }}
        >
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              mb: 2,
              fontSize: { xs: "2rem", md: "2.5rem" },
            }}
          >
            Ready to Advance Your ICP Career?
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{
              mb: 4,
              maxWidth: 500,
              mx: "auto",
              lineHeight: 1.5,
            }}
          >
            Join thousands of professionals building the future of Web3
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              fontStyle: "italic",
              opacity: 0.8,
            }}
          >
            Crafted by the oDoc.app team — Trusted by the ICP community
          </Typography>
        </Box>
      </Container>

      <PageFooter />
    </Box>
  );
}
