import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Fade,
  Chip,
  Container,
  useTheme,
  alpha,
  Avatar,
  Zoom,
  Stack,
} from "@mui/material";
import {
  Work,
  Business,
  Security,
  SmartToy,
  Payment,
  Analytics,
  PersonAdd,
  Description,
  AttachMoney,
  Search,
  Handshake,
} from "@mui/icons-material";
import { businessSteps, freelancerSteps, StepData } from "./landingPageData";

interface UserTypeCardProps {
  type: "freelancer" | "business";
  title: string;
  features: string[];
  steps: StepData[];
  isHovered: boolean;
  onHover: (type: "freelancer" | "business" | null) => void;
}

const UserTypeCard: React.FC<UserTypeCardProps> = ({
  type,
  title,
  features,
  steps,
  isHovered,
  onHover,
}) => {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (isHovered) {
      const timer = setInterval(() => {
        setActiveStep((prev) => (prev + 1) % steps.length);
      }, 2000);
      return () => clearInterval(timer);
    }
  }, [isHovered, steps.length]);

  const cardColor =
    type === "freelancer" ? theme.palette.primary : theme.palette.secondary;

  return (
    <Card
      elevation={isHovered ? 12 : 4}
      onMouseEnter={() => onHover(type)}
      onMouseLeave={() => onHover(null)}
      sx={{
        height: isHovered ? 600 : 400,
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        cursor: "pointer",
        background: isHovered
          ? `linear-gradient(135deg, ${alpha(cardColor.main, 0.1)} 0%, ${alpha(cardColor.light, 0.05)} 100%)`
          : theme.palette.background.paper,
        border: isHovered ? `2px solid ${cardColor.main}` : "1px solid",
        borderColor: isHovered
          ? cardColor.main
          : alpha(theme.palette.divider, 0.2),
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: `linear-gradient(90deg, ${cardColor.main}, ${cardColor.light})`,
          transform: isHovered ? "scaleX(1)" : "scaleX(0)",
          transformOrigin: "left",
          transition: "transform 0.4s ease",
        },
      }}
    >
      <CardContent
        sx={{
          p: 3,
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Avatar
            sx={{
              bgcolor: cardColor.main,
              mr: 2,
              width: 56,
              height: 56,
              transition: "all 0.3s ease",
              transform: isHovered ? "scale(1.1)" : "scale(1)",
            }}
          >
            {type === "freelancer" ? <Work /> : <Business />}
          </Avatar>
          <Typography
            variant="h5"
            fontWeight="bold"
            color={cardColor.main}
            sx={{ lineHeight: 1.2 }}
          >
            {title}
          </Typography>
        </Box>

        <Stack spacing={1.5} sx={{ mb: 3 }}>
          {features.map((feature, index) => (
            <Zoom
              key={feature}
              in={true}
              style={{
                transitionDelay: isHovered ? `${index * 100}ms` : "0ms",
              }}
            >
              <Box>
                <Chip
                  icon={
                    index === 0 ? (
                      <Security />
                    ) : index === 1 ? (
                      <SmartToy />
                    ) : index === 2 ? (
                      type === "freelancer" ? (
                        <Work />
                      ) : (
                        <Payment />
                      )
                    ) : (
                      <Analytics />
                    )
                  }
                  label={feature}
                  variant="outlined"
                  size="medium"
                  sx={{
                    color: cardColor.main,
                    borderColor: cardColor.main,
                    height: "auto",
                    "& .MuiChip-label": {
                      whiteSpace: "normal",
                      lineHeight: 1.4,
                      py: 1,
                      px: 1,
                    },
                    "& .MuiChip-icon": {
                      color: cardColor.main,
                      fontSize: 20,
                    },
                    width: "100%",
                    justifyContent: "flex-start",
                  }}
                />
              </Box>
            </Zoom>
          ))}
        </Stack>

        <Fade in={isHovered} timeout={600}>
          <Box sx={{ flex: 1 }}>
            {isHovered && (
              <Box>
                <Typography
                  variant="h6"
                  gutterBottom
                  color={cardColor.main}
                  fontWeight="bold"
                  sx={{ mb: 2 }}
                >
                  Getting Started:
                </Typography>
                <Stepper
                  activeStep={activeStep}
                  orientation="vertical"
                  sx={{
                    "& .MuiStepConnector-line": {
                      borderColor: alpha(cardColor.main, 0.3),
                    },
                  }}
                >
                  {steps.map((step, index) => (
                    <Step key={step.label}>
                      <StepLabel
                        StepIconComponent={() => (
                          <Avatar
                            sx={{
                              bgcolor:
                                index <= activeStep
                                  ? cardColor.main
                                  : alpha(theme.palette.grey[400], 0.5),
                              width: 32,
                              height: 32,
                              transition: "all 0.3s ease",
                            }}
                          >
                            {React.cloneElement(step.icon, {
                              sx: { fontSize: 16 },
                            })}
                          </Avatar>
                        )}
                      >
                        <Typography
                          fontWeight="medium"
                          color={cardColor.main}
                          variant="body1"
                        >
                          {step.label}
                        </Typography>
                      </StepLabel>
                      <StepContent>
                        <Typography
                          variant="body2"
                          color={theme.palette.text.secondary}
                          sx={{ lineHeight: 1.4 }}
                        >
                          {step.description}
                        </Typography>
                      </StepContent>
                    </Step>
                  ))}
                </Stepper>
              </Box>
            )}
          </Box>
        </Fade>

        <Fade in={!isHovered} timeout={300}>
          <Box sx={{ mt: "auto" }}>
            {!isHovered && (
              <Button
                variant="contained"
                fullWidth
                size="large"
                sx={{
                  bgcolor: cardColor.main,
                  color: theme.palette.getContrastText(cardColor.main),
                  "&:hover": {
                    bgcolor: cardColor.dark,
                  },
                  borderRadius: 2,
                  py: 1.5,
                  fontWeight: "bold",
                  textTransform: "none",
                  fontSize: "1rem",
                }}
              >
                Get Started
              </Button>
            )}
          </Box>
        </Fade>
      </CardContent>
    </Card>
  );
};

const LandingPage: React.FC = () => {
  const [hoveredSection, setHoveredSection] = useState<
    "freelancer" | "business" | null
  >(null);
  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        py: 8,
        backgroundColor: theme.palette.background.default,
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: "center", mb: 8 }}>
          <Typography
            variant="h1"
            fontWeight="bold"
            gutterBottom
            sx={{
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 2,
              fontSize: "4rem",
            }}
          >
            oDoc
          </Typography>
          <Typography
            variant="h4"
            color={theme.palette.text.secondary}
            gutterBottom
            sx={{
              fontWeight: 500,
              mb: 2,
            }}
          >
            Easy to use. Trustless contracts. Automated payments.
          </Typography>
          <Typography
            variant="body1"
            color={theme.palette.text.secondary}
            sx={{
              maxWidth: 600,
              mx: "auto",
              lineHeight: 1.6,
            }}
          >
            The future of freelancing with blockchain security and AI-powered
            matching
          </Typography>
        </Box>

        <Grid container spacing={4} justifyContent="center">
          <Grid item md={6}>
            <UserTypeCard
              type="freelancer"
              title="I'm a Freelancer"
              features={[
                "Trustless contracts - Get paid automatically when work is approved",
                "No more payment scams - Funds held securely in blockchain escrow",
                "AI-powered job matching - Find perfect projects for your skills",
              ]}
              steps={freelancerSteps}
              isHovered={hoveredSection === "freelancer"}
              onHover={setHoveredSection}
            />
          </Grid>
          <Grid item md={6}>
            <UserTypeCard
              type="business"
              title="I'm a Business Owner"
              features={[
                "Automated talent matching - Our AI finds top freelancers for you",
                "One-click payments - Manage all contracts & payments in one place",
                "Performance tracking - See freelancer history & ratings",
              ]}
              steps={businessSteps}
              isHovered={hoveredSection === "business"}
              onHover={setHoveredSection}
            />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default LandingPage;
