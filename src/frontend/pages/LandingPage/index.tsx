import React, { useState, useEffect } from "react";
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
  LinearProgress,
  useTheme,
  useMediaQuery,
  Button,
  Avatar,
  Rating,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Stack,
  Paper,
  IconButton,
} from "@mui/material";
import {
  Search,
  Handshake,
  Security,
  Analytics,
  Star,
  Warning,
  ExpandMore,
  CheckCircle,
  TrendingUp,
  Speed,
  Shield,
  People,
  Email,
  LinkedIn,
  Twitter,
  GitHub,
} from "@mui/icons-material";

import OdocStrecture from "./oDocStrecture";
import MobileTutrials from "./mobileVideoTutorials";
import DeskTopTutorials from "../videoTutorial";
import PlatformProgress from "./platformProgress";
import PageFooter from "./socialButton";
import TrustBehaviorSystem from "./insetnivesSystem";
import RunawayJellyfish from "@/components/creature/runAeayJellyFish";
import LOGOSVG, {
  AUTOMATIONSVG,
  FriendlyCharacter,
  SECRUTYSVG,
} from "@/components/creature/logoSVG";

// Hook for scroll-based visibility
const useScrollVisibility = () => {
  const [visibleSection, setVisibleSection] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll("[data-section]");
      const scrollY = window.scrollY + window.innerHeight / 2;

      sections.forEach((section, index) => {
        const { offsetTop, offsetHeight } = section;
        if (scrollY >= offsetTop && scrollY < offsetTop + offsetHeight) {
          setVisibleSection(index);
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Check initial position

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return visibleSection;
};

// Enhanced Feature Section with better visual hierarchy
const FeatureSection = ({
  title,
  icon,
  children,
  reversed = false,
  sectionIndex,
  visibleSection,
}) => {
  const isMobile = useMediaQuery("(max-width:900px)");
  const isVisible = sectionIndex === visibleSection;

  return (
    <Box
      data-section
      sx={{
        py: 6,
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        opacity: isVisible ? 1 : 0.3,
        transition: "opacity 0.5s ease-in-out",
      }}
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
              textAlign: isMobile ? "center" : "left",
            }}
          >
            {isMobile && <Box sx={{ mb: 3 }}>{icon}</Box>}
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
              }}
            >
              {title}
            </Typography>
            {children}
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
  const visibleSection = useScrollVisibility();

  // Add animations
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
          sectionIndex={0}
          visibleSection={visibleSection}
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
                {["Open Source", "Decentralized", "Unified", "All-in-One"].map(
                  (label) => (
                    <Chip
                      key={label}
                      label={label}
                      size="small"
                      variant="outlined"
                    />
                  ),
                )}
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
            C• oDoc is A decentralized freelance crypto Agreement platform
            designed to obviate the need for middlemen, spreadsheets, documents,
            or task managers. Powered by AI & ICP
          </Typography>
        </FeatureSection>
        {/* Job Matching Section */}
        <FeatureSection
          title="Stop hunting for jobs, let AI do it for you"
          icon={<RunawayJellyfish thinking={true} scale={isMobile ? 1.2 : 2} />}
          sectionIndex={1}
          visibleSection={visibleSection}
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

        {/* Crypto Agreement Section */}
        <FeatureSection
          title="Crypto Agreement"
          icon={
            <RunawayJellyfish
              shiver={true}
              jellyfishOffsetX={isMobile ? -100 : -50}
              jellyfishOffsetY={0}
              scale={isMobile ? 1 : 1.3}
              LogoSvg={FriendlyCharacter}
              shiver={true}
              scale={1}
              logoSvgScale={isMobile ? 1 : 1.5}
            />
          }
          reversed
          sectionIndex={2}
          visibleSection={visibleSection}
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

        {/* Tutorials Section */}
        <Box
          data-section
          sx={{
            py: 2,
            minHeight: "100vh",
            alignItems: "center",
            opacity: visibleSection === 3,
            transition: "opacity 0.5s ease-in-out",
          }}
        >
          {isMobile ? <MobileTutrials /> : <DeskTopTutorials />}
        </Box>

        {/* Structure Section */}
        {!isMobile && (
          <Box
            data-section
            sx={{
              py: 2,
              minHeight: "100vh",
              display: "flex",
              alignItems: "center",
              opacity: visibleSection === 4,
              transition: "opacity 0.5s ease-in-out",
            }}
          >
            <OdocStrecture />
          </Box>
        )}

        {/* Karma System */}
        <Box
          data-section
          sx={{
            py: 6,
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            transition: "opacity 0.5s ease-in-out",
          }}
        >
          <TrustBehaviorSystem />
        </Box>

        {/* Automated Tasks Manager */}
        <FeatureSection
          title="Automated Tasks Manager"
          icon={
            <RunawayJellyfish
              logoSvgScale={isMobile ? 1.5 : 2}
              LogoSvg={AUTOMATIONSVG}
              jellyfishOffsetX={-100}
              jellyfishOffsetY={5}
              scale={isMobile ? 0.7 : 1.3}
            />
          }
          sectionIndex={isMobile ? 5 : 6}
          visibleSection={visibleSection}
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

        {/* Cyber Security */}
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
          sectionIndex={isMobile ? 6 : 7}
          visibleSection={visibleSection}
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

        {/* AI Analytics */}
        <Box
          data-section
          sx={{
            py: 6,
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",

            transition: "opacity 0.5s ease-in-out",
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

        <Box
          data-section
          sx={{
            transition: "opacity 0.5s ease-in-out",
          }}
        >
          <PlatformProgress />
        </Box>
      </Container>

      <PageFooter />
    </Box>
  );
}
