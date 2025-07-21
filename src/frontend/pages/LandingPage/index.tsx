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
} from "@mui/material";
import {
  Analytics,
  Star,
  Warning,
  CheckCircle,
  TrendingUp,
  Speed,
  Shield,
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
import { useBackendContext } from "@/contexts/BackendContext";
import JobIcon from "@/public/jobs.png";
import AgreementIcon from "@/public/agreement.png";
import AllInOne from "@/public/all-in-on.png";
import CalendarIcon from "@/public/calendar.png";

const StatsSection = () => {
  const [stats, setStats] = useState({
    users: 0,
    activeUsers: 0,
    totalDeposit: 0,
  });
  const [isVisible, setIsVisible] = useState(false);
  const { backendActor, ckUSDCActor } = useBackendContext();
  const statsRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.5 },
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const fetchStats = async () => {
      try {
        const [snsResponse, balance] = await Promise.all([
          backendActor.get_sns_status(),
          getckUsdcBalance(ckUSDCActor, canisterId),
        ]);

        if (snsResponse.Ok) {
          const { number_users, active_users } = snsResponse.Ok;

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

          animateCount(number_users, (val) =>
            setStats((prev) => ({ ...prev, users: val })),
          );
          animateCount(active_users, (val) =>
            setStats((prev) => ({ ...prev, activeUsers: val })),
          );
          animateCount(balance, (val) =>
            setStats((prev) => ({ ...prev, totalDeposit: val })),
          );
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
    };

    fetchStats();
  }, [isVisible, backendActor, ckUSDCActor]);

  return (
    <Box
      ref={statsRef}
      sx={{
        width: "100%",
        p: 2,
        mb: 3,
        background:
          "linear-gradient(135deg, rgba(25,118,210,0.1) 0%, rgba(156,39,176,0.1) 100%)",
        borderRadius: 2,
      }}
    >
      <Grid container spacing={2} textAlign="center">
        {[
          { value: stats.users, label: "Total Users" },
          { value: stats.activeUsers, label: "Active Users" },
          { value: stats.totalDeposit, label: "Total Deposits", prefix: "$" },
        ].map((stat, i) => (
          <Grid item xs={4} key={i}>
            <Typography variant="h5" fontWeight="bold" color="primary">
              {stat.prefix || ""}
              {stat.value.toLocaleString()}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ whiteSpace: "nowrap" }}
            >
              {stat.label}
            </Typography>
          </Grid>
        ))}
      </Grid>
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
                style={{
                  filter:
                    "drop-shadow(rgba(167, 116, 116, 0.15) 10px 10px 20px)",
                }}
                sx={{
                  mb: 3,
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
                background: "linear-gradient(45deg, #1976d2, #9c27b0)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                mb: 3,
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
                    background:
                      "radial-gradient(circle, rgba(25,118,210,0.1) 0%, transparent 70%)",
                    borderRadius: "50%",
                    zIndex: -1,
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
     @keyframes pulse {
       0% { transform: scale(1); opacity: 1; }
       50% { transform: scale(1.05); opacity: 0.8; }
       100% { transform: scale(1); opacity: 1; }
     }
     @keyframes bounce {
       0%, 20%, 53%, 80%, 100% { transform: translate3d(0,0,0); }
       40%, 43% { transform: translate3d(0,-10px,0); }
       70% { transform: translate3d(0,-5px,0); }
       90% { transform: translate3d(0,-2px,0); }
     }
     @keyframes rotate {
       from { transform: rotate(0deg); }
       to { transform: rotate(360deg); }
     }
   `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <FeatureSection
          reversed
          title="Streamline your work flow."
          icon={
            <Box sx={{ textAlign: "center", py: 4 }}>
              <RunawayJellyfish
                LogoSvg={LOGOSVG}
                jellyfishOffsetX={-135}
                jellyfishOffsetY={5}
                scale={1.3}
              />
              <Typography
                variant="h3"
                component="h1"
                sx={{ mb: 1.5, fontWeight: 600, mt: 2 }}
              >
                oDoc Crypto Agreement
              </Typography>
              <Typography
                variant="h6"
                sx={{ mb: 3, opacity: 0.7, fontWeight: 400 }}
              >
                The unified freelance platform
              </Typography>
              <Stack
                direction="row"
                spacing={1}
                sx={{ justifyContent: "center", flexWrap: "wrap", gap: 1 }}
              >
                {["Open Source", "Decentralized", "All-in-One"].map((label) => (
                  <Chip
                    key={label}
                    label={label}
                    size="small"
                    variant="outlined"
                  />
                ))}
              </Stack>
            </Box>
          }
        >
          <Typography
            variant="h6"
            paragraph
            color="text.secondary"
            sx={{ mb: 3 }}
          >
            oDoc is a decentralized freelance crypto agreement platform,
            designed to obviate the need for middlemen, spreadsheets, documents,
            or task managers. Powered by AI and ICP blockchain.
          </Typography>
          <StatsSection />
        </FeatureSection>

        <FeatureSection
          title="Stop hunting for jobs, let AI do it for you"
          icon={
            <img
              src={JobIcon}
              style={{
                transform: "scaleX(-1)",
                width: isMobile ? "150px" : "500px",
                objectFit: "contain",
              }}
            />
          }
        >
          <Typography
            variant="h6"
            paragraph
            color="text.secondary"
            sx={{ mb: 3 }}
          >
            You can talk to the oDoc AI job match - It will provide consultation
            to improve your resume/requirements post
          </Typography>
          <List sx={{ "& .MuiListItem-root": { pl: 0 } }}>
            {[
              "It will alert you by email when there is a good match for you",
              "Provide with cover letter so you do not need to read the full job post/resume",
              "Prevent spams by hiding low matching scores",
            ].map((text, index) => (
              <ListItem key={index}>
                <CheckCircle sx={{ color: "success.main", mr: 2 }} />
                <ListItemText primary={text} />
              </ListItem>
            ))}
          </List>
        </FeatureSection>

        <FeatureSection
          title="Crypto Agreement"
          icon={
            <img
              src={AgreementIcon}
              style={{
                width: isMobile ? "150px" : "500px",
                objectFit: "contain",
              }}
            />
          }
          reversed
        >
          <List sx={{ mb: 3 }}>
            {[
              {
                primary: "Escrow",
                secondary:
                  "You can make Escrow by deposit before making any promise, to prove you will pay",
              },
              {
                primary: "Promise",
                secondary: "You can make non escrow promise for simple cases",
              },
              {
                primary: "Release",
                secondary: "You can release when task is done",
              },
              {
                primary: "Karma",
                secondary:
                  "When you make cancellations your score will go down, shows you have lower success rate",
              },
            ].map((item, index) => (
              <ListItem key={index} sx={{ pl: 0 }}>
                <ListItemText
                  primary={
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      color="primary"
                    >
                      {item.primary}
                    </Typography>
                  }
                  secondary={item.secondary}
                />
              </ListItem>
            ))}
          </List>
          <Typography
            variant="body2"
            sx={{ fontStyle: "italic", color: "text.secondary" }}
          >
            Eliminate middlemen, spreadsheets, and task managers. Streamline
            contracts, payments, escrow, and collaboration into one seamless
            crypto-native platform. Powered by AI & Internet Computer
          </Typography>
        </FeatureSection>

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
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  borderRadius: 3,
                  border: 2,
                  borderColor: "error.main",
                  backgroundColor:
                    theme.palette.mode === "dark"
                      ? "error.dark"
                      : "error.light",
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
                          ? "error.light"
                          : "error.dark",
                    }}
                  >
                    <Warning sx={{ mr: 1 }} />
                    Bad Behavior
                  </Typography>
                  <List dense>
                    {[
                      "Repeated cancellations",
                      "Excessive disputes",
                      "Breaking contract terms",
                    ].map((text, index) => (
                      <ListItem key={index}>
                        <ListItemText
                          primary={text}
                          sx={{
                            color:
                              theme.palette.mode === "dark"
                                ? "text.primary"
                                : "error.dark",
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
                          ? "error.light"
                          : "error.dark",
                    }}
                  >
                    PUNISHMENTS
                  </Typography>
                  <List dense>
                    {[
                      "Trust score drops",
                      "Funds locked",
                      "Transaction cap",
                    ].map((text, index) => (
                      <ListItem key={index}>
                        <ListItemText
                          primary={text}
                          sx={{
                            color:
                              theme.palette.mode === "dark"
                                ? "text.primary"
                                : "error.dark",
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  borderRadius: 3,
                  border: 2,
                  borderColor: "success.main",
                  backgroundColor:
                    theme.palette.mode === "dark"
                      ? "success.dark"
                      : "success.light",
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
                          ? "success.light"
                          : "success.dark",
                    }}
                  >
                    <Star sx={{ mr: 1 }} />
                    Good Behavior
                  </Typography>
                  <List dense>
                    {[
                      "Releasing payments",
                      "Creating contracts",
                      "Interacting with many users",
                      "High transaction volume",
                    ].map((text, index) => (
                      <ListItem key={index}>
                        <ListItemText
                          primary={text}
                          sx={{
                            color:
                              theme.palette.mode === "dark"
                                ? "text.primary"
                                : "success.dark",
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
                          ? "success.light"
                          : "success.dark",
                    }}
                  >
                    REWARDS
                  </Typography>
                  <List dense>
                    {[
                      "Higher trust score",
                      "Transaction freedom",
                      "Refund old escrow",
                    ].map((text, index) => (
                      <ListItem key={index}>
                        <ListItemText
                          primary={text}
                          sx={{
                            color:
                              theme.palette.mode === "dark"
                                ? "text.primary"
                                : "success.dark",
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        <FeatureSection
          title="Automated Tasks Manager"
          icon={
            <img
              src={AllInOne}
              style={{
                transform: "scaleX(-1)",
                width: isMobile ? "150px" : "500px",
                objectFit: "contain",
              }}
            />
          }
        >
          <Typography
            variant="h6"
            paragraph
            color="text.secondary"
            sx={{ mb: 3 }}
          >
            The crypto agreement is a table that acts like contract and tasks
            manager all at once.
          </Typography>
          <List sx={{ "& .MuiListItem-root": { pl: 0 } }}>
            {[
              "No payment or ebank platform needed",
              "No contract/freelance platform needed",
              "No task manager platform needed",
              "No documents platform needed",
              "Just one single unified automated platform",
            ].map((text, index) => (
              <ListItem key={index}>
                <CheckCircle sx={{ color: "success.main", mr: 2 }} />
                <ListItemText primary={text} />
              </ListItem>
            ))}
          </List>
          <Typography
            variant="body2"
            sx={{ mt: 3, fontStyle: "italic", color: "text.secondary" }}
          >
            oDoc - No headache, save your time and save your funds.
          </Typography>
        </FeatureSection>

        <FeatureSection
          title="Talk to your calendar"
          icon={
            <img
              src={CalendarIcon}
              style={{
                transform: "scaleX(-1)",
                width: isMobile ? "150px" : "500px",
                objectFit: "contain",
              }}
            />
          }
        >
          <Typography
            variant="h6"
            paragraph
            color="text.secondary"
            sx={{ mb: 3 }}
          >
            No need to manually set your availabilities, you can just talk to it
            like talking to a human.
          </Typography>
          <List sx={{ "& .MuiListItem-root": { pl: 0 } }}>
            {[
              "Connect your google calendar",
              "Connect multiple calendars",
              "Any event on Google Calendar shows here, and vice versa",
              "Add your contacts",
              'Just say "I will have 15 minutes call with David tomorrow"',
            ].map((text, index) => (
              <ListItem key={index}>
                <CheckCircle sx={{ color: "success.main", mr: 2 }} />
                <ListItemText primary={text} />
              </ListItem>
            ))}
          </List>
        </FeatureSection>

        <FeatureSection
          title="Cyber Security"
          icon={
            <RunawayJellyfish
              logoSvgScale={isMobile ? 1 : 1.5}
              LogoSvg={SECRUTYSVG}
              jellyfishOffsetX={-100}
              jellyfishOffsetY={5}
              scale={isMobile ? 0.7 : 1.3}
            />
          }
        >
          <List sx={{ "& .MuiListItem-root": { pl: 0 } }}>
            {[
              "Decentralized",
              "Tamper-proof Records",
              "Fraud Prevention system with our Karma algorithm",
              "No sudden changes on privacy, you can vote to accept or reject changes",
            ].map((text, index) => (
              <ListItem key={index}>
                <Shield sx={{ color: "primary.main", mr: 2 }} />
                <ListItemText
                  primary={
                    <Typography
                      variant="body1"
                      fontWeight={
                        text.includes("Tamper-proof") || text.includes("Fraud")
                          ? "bold"
                          : "normal"
                      }
                    >
                      {text}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </FeatureSection>

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
          <List sx={{ maxWidth: 800, mx: "auto" }}>
            <ListItem>
              <Analytics sx={{ color: "primary.main", mr: 2 }} />
              <ListItemText primary="All your chats and docs watched by decentralized AI" />
            </ListItem>
            <ListItem>
              <TrendingUp sx={{ color: "primary.main", mr: 2 }} />
              <ListItemText primary="It gives you action suggestions" />
            </ListItem>
            <ListItem>
              <Speed sx={{ color: "primary.main", mr: 2 }} />
              <ListItemText
                primary="Smart Suggestions"
                secondary="For example: when you talk with your friend about booking meeting within the chat it will suggest a time to meet that it knows suits both of you. Or when you make many cancellations it will suggest specific people who have better payment success rate, to help you out."
              />
            </ListItem>
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
