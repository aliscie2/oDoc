import React, { useState, useEffect } from 'react';
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
  Paper,
  Avatar,
  Zoom,
  useMediaQuery,
  Stack,
} from '@mui/material';
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
} from '@mui/icons-material';

interface StepData {
  label: string;
  description: string;
  icon: React.ReactElement;
}

interface UserTypeCardProps {
  type: 'freelancer' | 'business';
  title: string;
  features: string[];
  steps: StepData[];
  isHovered: boolean;
  onHover: (type: 'freelancer' | 'business' | null) => void;
  isMobile: boolean;
}

const UserTypeCard: React.FC<UserTypeCardProps> = ({
  type,
  title,
  features,
  steps,
  isHovered,
  onHover,
  isMobile,
}) => {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (isHovered && !isMobile) {
      const timer = setInterval(() => {
        setActiveStep((prev) => (prev + 1) % steps.length);
      }, 2000);
      return () => clearInterval(timer);
    }
  }, [isHovered, steps.length, isMobile]);

  const cardColor = type === 'freelancer' ? theme.palette.primary : theme.palette.secondary;

  return (
    <Card
      elevation={isHovered ? 12 : 4}
      onMouseEnter={() => !isMobile && onHover(type)}
      onMouseLeave={() => !isMobile && onHover(null)}
      onClick={() => isMobile && onHover(isHovered ? null : type)}
      sx={{
        height: isMobile ? 'auto' : (isHovered ? 600 : 400),
        minHeight: isMobile ? 300 : 'auto',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        background: isHovered
          ? `linear-gradient(135deg, ${alpha(cardColor.main, 0.1)} 0%, ${alpha(cardColor.light, 0.05)} 100%)`
          : theme.palette.background.paper,
        border: isHovered ? `2px solid ${cardColor.main}` : '1px solid',
        borderColor: isHovered ? cardColor.main : alpha(theme.palette.divider, 0.2),
        position: 'relative',
        overflow: 'hidden',
        mb: isMobile ? 2 : 0,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: `linear-gradient(90deg, ${cardColor.main}, ${cardColor.light})`,
          transform: isHovered ? 'scaleX(1)' : 'scaleX(0)',
          transformOrigin: 'left',
          transition: 'transform 0.4s ease',
        },
      }}
    >
      <CardContent 
        sx={{ 
          p: isMobile ? 2 : 3, 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column' 
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            sx={{
              bgcolor: cardColor.main,
              mr: 2,
              width: isMobile ? 48 : 56,
              height: isMobile ? 48 : 56,
              transition: 'all 0.3s ease',
              transform: isHovered ? 'scale(1.1)' : 'scale(1)',
            }}
          >
            {type === 'freelancer' ? <Work /> : <Business />}
          </Avatar>
          <Typography 
            variant={isMobile ? "h6" : "h5"} 
            fontWeight="bold" 
            color={cardColor.main}
            sx={{ lineHeight: 1.2 }}
          >
            {title}
          </Typography>
        </Box>

        <Stack spacing={isMobile ? 1 : 1.5} sx={{ mb: 3 }}>
          {features.map((feature, index) => (
            <Zoom
              key={feature}
              in={true}
              style={{ transitionDelay: isHovered ? `${index * 100}ms` : '0ms' }}
            >
              <Box>
                <Chip
                  icon={
                    index === 0 ? <Security /> :
                    index === 1 ? <SmartToy /> :
                    index === 2 ? (type === 'freelancer' ? <Work /> : <Payment />) :
                    <Analytics />
                  }
                  label={feature}
                  variant="outlined"
                  size={isMobile ? "small" : "medium"}
                  sx={{
                    color: cardColor.main,
                    borderColor: cardColor.main,
                    height: 'auto',
                    '& .MuiChip-label': {
                      whiteSpace: 'normal',
                      lineHeight: 1.4,
                      py: 1,
                      px: 1,
                    },
                    '& .MuiChip-icon': { 
                      color: cardColor.main,
                      fontSize: isMobile ? 16 : 20,
                    },
                    width: '100%',
                    justifyContent: 'flex-start',
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
                  variant={isMobile ? "subtitle1" : "h6"} 
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
                    '& .MuiStepConnector-line': {
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
                              bgcolor: index <= activeStep ? cardColor.main : alpha(theme.palette.grey[400], 0.5),
                              width: isMobile ? 28 : 32,
                              height: isMobile ? 28 : 32,
                              transition: 'all 0.3s ease',
                            }}
                          >
                            {React.cloneElement(step.icon, { sx: { fontSize: isMobile ? 14 : 16 } })}
                          </Avatar>
                        )}
                      >
                        <Typography 
                          fontWeight="medium" 
                          color={cardColor.main}
                          variant={isMobile ? "body2" : "body1"}
                        >
                          {step.label}
                        </Typography>
                      </StepLabel>
                      <StepContent>
                        <Typography 
                          variant={isMobile ? "caption" : "body2"} 
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
          <Box sx={{ mt: 'auto' }}>
            {!isHovered && (
              <Button
                variant="contained"
                fullWidth
                size={isMobile ? "medium" : "large"}
                sx={{
                  bgcolor: cardColor.main,
                  color: theme.palette.getContrastText(cardColor.main),
                  '&:hover': { 
                    bgcolor: cardColor.dark,
                  },
                  borderRadius: 2,
                  py: isMobile ? 1 : 1.5,
                  fontWeight: 'bold',
                  textTransform: 'none',
                  fontSize: isMobile ? '0.875rem' : '1rem',
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
  const [hoveredSection, setHoveredSection] = useState<'freelancer' | 'business' | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));

  const freelancerSteps: StepData[] = [
    {
      label: 'Sign Up',
      description: 'Create your account and get verified',
      icon: <PersonAdd />,
    },
    {
      label: 'Upload CV',
      description: 'Show your CV to our AI Job matcher to find perfect jobs',
      icon: <Description />,
    },
    {
      label: 'Create Contract',
      description: 'Generate new document and contract for your project',
      icon: <Handshake />,
    },
  ];

  const businessSteps: StepData[] = [
    {
      label: 'Sign Up',
      description: 'Create your business account',
      icon: <PersonAdd />,
    },
    {
      label: 'Make Deposit',
      description: 'Secure your funds in blockchain escrow',
      icon: <AttachMoney />,
    },
    {
      label: 'AI Matching',
      description: 'Tell our AI your requirements to find top freelancers',
      icon: <Search />,
    },
    {
      label: 'Create Contract',
      description: 'Finalize contract with your chosen freelancer',
      icon: <Handshake />,
    },
  ];

  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        py: isSmall ? 4 : isMobile ? 6 : 8,
        backgroundColor: theme.palette.background.default,
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: isSmall ? 4 : isMobile ? 6 : 8 }}>
          <Typography
            variant={isSmall ? "h3" : isMobile ? "h2" : "h1"}
            fontWeight="bold"
            gutterBottom
            sx={{
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2,
              fontSize: isSmall ? '2.5rem' : isMobile ? '3rem' : '4rem',
            }}
          >
            oDoc
          </Typography>
          <Typography 
            variant={isSmall ? "h6" : isMobile ? "h5" : "h4"} 
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
            variant={isSmall ? "body2" : "body1"} 
            color={theme.palette.text.secondary} 
            sx={{ 
              maxWidth: isSmall ? 300 : isMobile ? 500 : 600, 
              mx: 'auto',
              lineHeight: 1.6,
            }}
          >
            The future of freelancing with blockchain security and AI-powered matching
          </Typography>
        </Box>

        <Grid container spacing={isMobile ? 2 : 4} justifyContent="center">
          <Grid item xs={12} md={6}>
            <UserTypeCard
              type="freelancer"
              title="I'm a Freelancer"
              features={[
                'Trustless contracts - Get paid automatically when work is approved',
                'No more payment scams - Funds held securely in blockchain escrow',
                'AI-powered job matching - Find perfect projects for your skills',
              ]}
              steps={freelancerSteps}
              isHovered={hoveredSection === 'freelancer'}
              onHover={setHoveredSection}
              isMobile={isMobile}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <UserTypeCard
              type="business"
              title="I'm a Business Owner"
              features={[
                'Automated talent matching - Our AI finds top freelancers for you',
                'One-click payments - Manage all contracts & payments in one place',
                'Performance tracking - See freelancer history & ratings',
              ]}
              steps={businessSteps}
              isHovered={hoveredSection === 'business'}
              onHover={setHoveredSection}
              isMobile={isMobile}
            />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default LandingPage;