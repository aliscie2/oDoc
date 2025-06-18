import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Container,
  Card,
  CardContent,
  Chip,
  Avatar,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Tabs,
  Tab,
  Grid,
  IconButton,
  Fade,
  Slide,
  Zoom,
  useScrollTrigger,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  Divider,
} from "@mui/material";
import {
  ExpandMore,
  PlayArrow,
  TrendingUp,
  Speed,
  AccountBalance,
  Security,
  Code,
  Hub,
  Public,
  CheckCircle,
  Star,
  ArrowForward,
} from "@mui/icons-material";
import {
  businessSteps,
  freelancerSteps,
  StepData,
  introFeatures,
  trustIndicators,
  benefitsData,
  jobMatcherFeatures,
  tutorials,
  securityFeatures,
  odocStrecutre,
  goodBehaviors,
  badBehaviors,
  rewards,
  punishments,
} from "./landingPageData";
import TutorialsSection from "./mobileVideoTutorials";

const AnimatedCounter = ({ end, duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  const trigger = useScrollTrigger({
    threshold: 0.5,
    disableHysteresis: true,
  });

  useEffect(() => {
    if (trigger && !started) {
      setStarted(true);
      let startTime = null;
      const animate = (currentTime) => {
        if (startTime === null) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / duration, 1);
        setCount(Math.floor(progress * end));

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    }
  }, [trigger, end, duration, started]);

  return count;
};

const FloatingElement = ({ children, delay = 0 }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <Zoom in={visible} timeout={800}>
      <Box>{children}</Box>
    </Zoom>
  );
};

const GlowCard = ({ children, ...props }) => (
  <Card
    {...props}
    sx={{
      background: "rgba(255, 255, 255, 0.05)",
      backdropFilter: "blur(10px)",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      borderRadius: 3,
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      "&:hover": {
        transform: "translateY(-4px)",
        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
      },
      ...props.sx,
    }}
  >
    {children}
  </Card>
);

export default function CryptoLandingPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [expandedBenefit, setExpandedBenefit] = useState(null);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setCurrentStep(0);
  };

  const steps = activeTab === 0 ? freelancerSteps : businessSteps;

  return (
    <Box sx={{ minHeight: "100vh", overflow: "hidden" }}>
      {/* Hero Section */}
      <Container maxWidth="sm" sx={{ pt: 4, pb: 6 }}>
        <Fade in timeout={1000}>
          <Box textAlign="center" mb={4}>
            <Typography
              variant="h3"
              component="h1"
              fontWeight="800"
              sx={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                backgroundClip: "text",
                textFillColor: "transparent",
                mb: 2,
                lineHeight: 1.2,
              }}
            >
              Crypto Agreement Platform
            </Typography>
            <Typography
              variant="h5"
              color="text.secondary"
              fontWeight="300"
              sx={{ mb: 1 }}
            >
              Limitless Collaboration
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 3, opacity: 0.8 }}
            >
              Built for Freelancers • Crypto Enthusiasts • Global Teams
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 4, lineHeight: 1.6 }}
            >
              Eliminate middlemen, spreadsheets, and task managers. Streamline
              contracts, payments, escrow, and collaboration into one seamless
              crypto-native platform.
            </Typography>

            <Stack direction="row" spacing={1} justifyContent="center" mb={4}>
              {trustIndicators.map((indicator, index) => (
                <FloatingElement key={indicator.label} delay={index * 200}>
                  <Chip
                    icon={indicator.icon}
                    label={indicator.label}
                    size="small"
                    sx={{
                      backgroundColor: indicator.color,
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      "& .MuiChip-label": { fontSize: "0.75rem" },
                    }}
                  />
                </FloatingElement>
              ))}
            </Stack>

            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowForward />}
              sx={{
                borderRadius: 6,
                px: 4,
                py: 1.5,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                boxShadow: "0 8px 32px rgba(102, 126, 234, 0.4)",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 12px 40px rgba(102, 126, 234, 0.6)",
                },
              }}
            >
              Get Started
            </Button>
          </Box>
        </Fade>

        {/* AI Job Matcher Section */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" fontWeight="700" textAlign="center" mb={3}>
            Stop the Endless Job Hunt
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            textAlign="center"
            mb={4}
          >
            Stop searching for Talents or Jobs, let AI do it.
          </Typography>

          <Grid container spacing={2} sx={{ mb: 4 }}>
            {jobMatcherFeatures.map((feature, index) => (
              <Grid item xs={12} key={feature.title}>
                <FloatingElement delay={index * 200}>
                  <GlowCard>
                    <CardContent sx={{ p: 2 }}>
                      <Box display="flex" alignItems="center" gap={2}>
                        {feature.icon}
                        <Box>
                          <Typography variant="h6" fontWeight="600">
                            {feature.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {feature.description}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </GlowCard>
                </FloatingElement>
              </Grid>
            ))}
          </Grid>

          <GlowCard sx={{ p: 3 }}>
            <Grid container spacing={2} textAlign="center">
              <Grid item xs={6}>
                <Typography variant="h5" fontWeight="700" color="success.main">
                  <AnimatedCounter end={94} />%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Match Success
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="h5" fontWeight="700" color="info.main">
                  <AnimatedCounter end={3.2} />x
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Faster Hiring
                </Typography>
              </Grid>
            </Grid>
          </GlowCard>
        </Box>

        {/* Benefits Section */}
        <TutorialsSection />

        {/* Features Preview */}
        <Grid container spacing={2} sx={{ mb: 6 }}>
          {introFeatures.map((feature, index) => (
            <Grid item xs={12} key={feature.title}>
              <FloatingElement delay={index * 300}>
                <GlowCard>
                  <CardContent sx={{ p: 2 }}>
                    <Box display="flex" alignItems="center" gap={2}>
                      {feature.icon}
                      <Box>
                        <Typography variant="h6" fontWeight="600" gutterBottom>
                          {feature.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {feature.description}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </GlowCard>
              </FloatingElement>
            </Grid>
          ))}
        </Grid>

        {/* Stats Section */}
        <GlowCard sx={{ mb: 6, p: 3 }}>
          <Grid container spacing={3} textAlign="center">
            <Grid item xs={4}>
              <Typography variant="h4" fontWeight="700" color="primary">
                <AnimatedCounter end={0} />%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Commission Fees
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="h4" fontWeight="700" color="primary">
                24/7
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Global Access
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="h4" fontWeight="700" color="primary">
                <AnimatedCounter end={100} />%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Open Source
              </Typography>
            </Grid>
          </Grid>
        </GlowCard>

        {/* Benefits Section */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" fontWeight="700" textAlign="center" mb={4}>
            Why Choose ODoc?
          </Typography>

          {benefitsData.slice(0, 4).map((benefit, index) => (
            <Accordion
              key={benefit.id}
              expanded={expandedBenefit === benefit.id}
              onChange={(e, isExpanded) =>
                setExpandedBenefit(isExpanded ? benefit.id : null)
              }
              sx={{
                mb: 2,
                background: "rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: 2,
                "&:before": { display: "none" },
              }}
            >
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar
                    sx={{ bgcolor: benefit.color, width: 32, height: 32 }}
                  >
                    {benefit.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="600">
                      {benefit.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {benefit.description.split("\n")[0]}
                    </Typography>
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="text.secondary">
                  {benefit.expandedContent}
                </Typography>
                {benefit.stats && (
                  <Chip
                    label={benefit.stats}
                    size="small"
                    sx={{ mt: 2, bgcolor: "rgba(255, 255, 255, 0.1)" }}
                  />
                )}
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>

        {/* Getting Started Section */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" fontWeight="700" textAlign="center" mb={3}>
            Get Started
          </Typography>

          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            centered
            sx={{ mb: 3 }}
          >
            <Tab label="Freelancer" />
            <Tab label="Business" />
          </Tabs>

          <GlowCard sx={{ p: 3 }}>
            <Stepper activeStep={currentStep} orientation="vertical">
              {steps.map((step, index) => (
                <Step key={step.label}>
                  <StepLabel
                    icon={
                      <Avatar
                        sx={{ bgcolor: "primary.main", width: 32, height: 32 }}
                      >
                        {step.icon}
                      </Avatar>
                    }
                  >
                    <Typography variant="h6" fontWeight="600">
                      {step.label}
                    </Typography>
                  </StepLabel>
                  <StepContent>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      {step.description}
                    </Typography>
                    <Box>
                      <Button
                        variant="contained"
                        onClick={() => setCurrentStep(index + 1)}
                        size="small"
                        disabled={index === steps.length - 1}
                      >
                        {index === steps.length - 1 ? "Complete" : "Continue"}
                      </Button>
                      {index > 0 && (
                        <Button
                          onClick={() => setCurrentStep(index - 1)}
                          size="small"
                          sx={{ ml: 1 }}
                        >
                          Back
                        </Button>
                      )}
                    </Box>
                  </StepContent>
                </Step>
              ))}
            </Stepper>
          </GlowCard>
        </Box>

        {/* Security Features */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" fontWeight="700" textAlign="center" mb={4}>
            Enterprise Security
          </Typography>

          <Grid container spacing={2}>
            {securityFeatures.slice(0, 4).map((feature, index) => (
              <Grid item xs={12} sm={6} key={feature.title}>
                <FloatingElement delay={index * 150}>
                  <GlowCard sx={{ height: "100%" }}>
                    <CardContent sx={{ p: 2 }}>
                      <Box display="flex" alignItems="flex-start" gap={2}>
                        <Avatar
                          sx={{
                            bgcolor: "secondary.main",
                            width: 32,
                            height: 32,
                          }}
                        >
                          {feature.icon}
                        </Avatar>
                        <Box>
                          <Typography
                            variant="subtitle1"
                            fontWeight="600"
                            gutterBottom
                          >
                            {feature.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {feature.description}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </GlowCard>
                </FloatingElement>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Trust Score Preview */}
        <GlowCard sx={{ p: 3, mb: 6 }}>
          <Typography variant="h5" fontWeight="600" textAlign="center" mb={3}>
            Trust & Karma System
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="success.main" mb={1}>
                Good Behaviors
              </Typography>
              {goodBehaviors.slice(0, 2).map((behavior, index) => (
                <Box
                  key={index}
                  display="flex"
                  alignItems="center"
                  gap={1}
                  mb={1}
                >
                  {behavior.icon}
                  <Typography variant="caption" color="text.secondary">
                    {behavior.text}
                  </Typography>
                </Box>
              ))}
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="error.main" mb={1}>
                Bad Behaviors
              </Typography>
              {badBehaviors.slice(0, 2).map((behavior, index) => (
                <Box
                  key={index}
                  display="flex"
                  alignItems="center"
                  gap={1}
                  mb={1}
                >
                  {behavior.icon}
                  <Typography variant="caption" color="text.secondary">
                    {behavior.text}
                  </Typography>
                </Box>
              ))}
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          <Box textAlign="center">
            <Typography variant="h6" fontWeight="600" color="primary">
              Trust Score: 850
            </Typography>
            <LinearProgress
              variant="determinate"
              value={85}
              sx={{
                mt: 1,
                height: 8,
                borderRadius: 4,
                bgcolor: "rgba(255, 255, 255, 0.1)",
              }}
            />
          </Box>
        </GlowCard>

        {/* Call to Action */}
        <Box textAlign="center" sx={{ py: 4 }}>
          <Typography variant="h4" fontWeight="700" mb={2}>
            Ready to Transform Your Workflow?
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={4}>
            Join thousands of professionals who've already made the switch.
          </Typography>

          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              variant="contained"
              size="large"
              sx={{
                borderRadius: 6,
                px: 4,
                py: 1.5,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                boxShadow: "0 8px 32px rgba(102, 126, 234, 0.4)",
              }}
            >
              Start Free Trial
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<PlayArrow />}
              sx={{
                borderRadius: 6,
                px: 4,
                py: 1.5,
                borderColor: "rgba(255, 255, 255, 0.3)",
              }}
            >
              Watch Demo
            </Button>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
