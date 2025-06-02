import React, { useRef, useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Typography,
  Tooltip,
} from "@mui/material";
import CheckCircle from "@mui/icons-material/CheckCircle";
import Schedule from "@mui/icons-material/Schedule";
import { features, roadMap } from "./data";
import SocialButton from "./socialButton";
import WhyOdoc from "./whyOdoc";
import Section from "./section";
import Intro from "./intro";
import GettingStarted from "../videoTutorial";
import SecuritySection from "./securitySection";
import { useScroll } from "framer-motion";
// Import the videos
// import handshakeVideo from "@/assets/handShakeDark.mp4";
// Removed light video import
import { useSelector } from "react-redux";
// Import our custom hook
import useScrollingEffect from "../../hooks/useScrollingEffect";
import PlatformProgress from "./platformProgress";
import SplitIntro from "./splitIntro";
import OdocStrecture from "./oDocStrecture";
import TrustBehaviorSystem from "./insetnivesSystem";
import AIJobMatcherSection from "./aiJobMatcherIntro";

export default function LandingPage(props) {
  // Add video reference and scroll progress
  const videoRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const [activeSection, setActiveSection] = useState('');
  
  // Use our custom hook for video scrolling effect with zoom
  useScrollingEffect(videoRef, scrollYProgress, { 
    speedMultiplier: 5,
    zoomEffect: true,
    maxZoom: 1.3 // Adjust this value to control maximum zoom level
  });

  // const { isDarkMode } = useSelector((state: any) => state.uiState);
  
  // Always use dark video, but adjust opacity for light mode
  // const videoOpacity = isDarkMode ? 0.8 : 0.6;

  const sections = [
    { id: 'odoc-structure', title: 'ODOC Structure' },
    { id: 'ai-job-matcher', title: 'AI Job Matcher' },
    { id: 'why', title: 'Why ODOC' },
    { id: 'trust-behavior', title: 'Trust & Behavior' },
    { id: 'split-intro', title: 'Split Intro' },
    { id: 'main-intro', title: 'Introduction' },
    { id: 'social', title: 'Social' },
    { id: 'getting-started', title: 'Getting Started' },
    { id: 'security', title: 'Security' },
    { id: 'features', title: 'Features' },
    { id: 'progress', title: 'Progress' },
    { id: 'bottom', title: 'Get Started' },
  ];

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.pageYOffset + window.innerHeight / 2;
      let currentSection = '';

      sections.forEach(({ id }) => {
        const element = document.getElementById(id);
        if (element) {
          const rect = element.getBoundingClientRect();
          const elementTop = rect.top + window.pageYOffset;
          const elementBottom = elementTop + rect.height;

          if (scrollPosition >= elementTop && scrollPosition <= elementBottom) {
            currentSection = id;
          }
        }
      });

      if (currentSection !== activeSection) {
        setActiveSection(currentSection);
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeSection, sections]);
  
  return (
    <Box sx={{ minHeight: "100vh", position: "relative" }}>
      
      {/* Navigation Dots */}
      <Box sx={{
        position: 'fixed',
        right: '20px',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}>
        {sections.map(({ id, title }) => (
          <Tooltip key={id} title={title} placement="left" arrow>
            <Box
              onClick={() => scrollToSection(id)}
              sx={{
                width: '12px',
                height: '12px',
                backgroundColor: activeSection === id ? '#2563eb' : 'rgba(37, 99, 235, 0.3)',
                border: `2px solid ${activeSection === id ? '#2563eb' : 'rgba(37, 99, 235, 0.5)'}`,
                borderRadius: '50%',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: '#2563eb',
                  transform: 'scale(1.2)',
                  boxShadow: '0 0 8px rgba(37, 99, 235, 0.6)',
                },
              }}
            />
          </Tooltip>
        ))}
      </Box>
     
      <Section id="odoc-structure" sx={{ position: "relative", zIndex: 1 }} transparent={true}>
        <OdocStrecture/>
      </Section>
      <Section id="ai-job-matcher" sx={{ position: "relative", zIndex: 1 }} transparent={true}>
        <AIJobMatcherSection />
      </Section>
      <Section id="why"  sx={{ position: "relative", zIndex: 1 }} transparent={true} >
        <WhyOdoc />
      </Section>
      <Section id="trust-behavior" sx={{ position: "relative", zIndex: 1 }} transparent={true}>
        <TrustBehaviorSystem/>
      </Section>
      <Section id="split-intro" sx={{ position: "relative", zIndex: 1 }} transparent={true}>
        <SplitIntro />
      </Section>

      <Section id="main-intro" sx={{ position: "relative", zIndex: 1 }} transparent={true}>
        <Intro />
      </Section>
    
      <Section id="social" transparent={true}>
        <SocialButton />
      </Section>
      <Section id="getting-started" transparent={true}>
        <GettingStarted/>
      </Section>
      
      <Section id="security" transparent={true}>
        <SecuritySection />
      </Section>

      {/* Features Grid */}
      <Container id="features" maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h3"
          sx={{ textAlign: "center", fontWeight: "bold", mb: 6 }}
        >
          Platform Features
        </Typography>
        <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <Card
                sx={{
                  height: "100%",
                  transition: "0.3s",
                  "&:hover": { boxShadow: 6 },
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mb: 2,
                      "& .MuiSvgIcon-root": {
                        fontSize: 40,
                        color: "#2563eb",
                      },
                    }}
                  >
                    {feature.icon}
                    <Typography variant="h6" sx={{ ml: 2, fontWeight: "bold" }}>
                      {feature.title}
                    </Typography>
                  </Box>
                  <Typography color="text.secondary">
                    {feature.content}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Current Progress */}
      <Box id="progress">
        <PlatformProgress/>
      </Box>

      {/* Call to Action */}
      {!props.isLoggedIn && (
        <Section
          id={"bottom"}
          sx={{
            bgcolor: "#2563eb",
            color: "white",
            py: { xs: 6, sm: 8 },
            px: { xs: 2, sm: 3, md: 4 },
            mt: { xs: 4, sm: 6, md: 8 },
            margin: 0,
          }}
        >
          <Container maxWidth="lg" sx={{ textAlign: "center" }}>
            <Typography variant="h3" sx={{ fontWeight: "bold", mb: 2 }}>
              Ready to Get Started?
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
              Join the future of decentralized collaboration
            </Typography>
            <Button
              variant="contained"
              size="large"
              sx={{
                px: 4,
                py: 2,
                fontSize: "1.1rem",
                bgcolor: "white",
                color: "#2563eb",
                "&:hover": {
                  bgcolor: "#f8fafc",
                },
              }}
              onClick={async () => await props.login()}
            >
              Join ODOC Today
            </Button>
          </Container>
        </Section>
      )}
    </Box>
  );
}