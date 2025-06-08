import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Fade,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  TrendingUp,
  Speed,
  Stars,
  ArrowForward,
  Work,
  Psychology,
  Notifications,
  Explore
} from '@mui/icons-material';
import { Link } from 'react-router-dom';


const AIJobMatcherSection = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          setHasAnimated(true);
        } else {
          setIsVisible(false);
        }
      },
      {
        threshold: 0.2,
        rootMargin: '-50px 0px -50px 0px'
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const features = [
    {
      icon: <Psychology color="primary" />,
      title: "AI Learning",
      description: "Learns your preferences and career goals"
    },
    {
      icon: <Speed color="primary" />,
      title: "Instant Alerts",
      description: "Get notified the moment perfect matches appear"
    },
    {
      icon: <Stars color="primary" />,
      title: "Quality Matches",
      description: "Only relevant, high-quality opportunities"
    }
  ];

  return (
    <Box
      ref={sectionRef}
      sx={{
        position: 'relative',
        py: { xs: 6, md: 12 },
        px: { xs: 2, sm: 3, md: 0 },
        background: 'inherit',
        color: 'inherit',
        overflow: 'hidden',
        minHeight: { xs: 'auto', md: '100vh' }
      }}
    >
      {/* Background Pattern */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)
          `,
          zIndex: 0,
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.8s ease-in-out'
        }}
      />
      
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Grid container spacing={{ xs: 3, md: 4 }} alignItems="center">
          {/* Main Content */}
          <Grid item xs={12} md={6}>
            <Fade in={isVisible} timeout={1000}>
              <Box
                sx={{
                  transform: isVisible ? 'translateY(0)' : 'translateY(50px)',
                  opacity: isVisible ? 1 : 0,
                  transition: 'all 0.8s ease-out'
                }}
              >
                {/* Problem Statement */}
                <Typography
                  variant="h2"
                  component="h1"
                  sx={{
                    fontWeight: 700,
                    fontSize: { xs: '2rem', sm: '2.5rem', md: '3.5rem' },
                    lineHeight: 1.2,
                    mb: 2,
                    background: 'linear-gradient(135deg, currentColor 0%, rgba(59, 130, 246, 0.8) 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    transform: isVisible ? 'translateX(0)' : 'translateX(-100px)',
                    opacity: isVisible ? 1 : 0,
                    transition: 'all 1s ease-out 0.2s'
                  }}
                >
                  Stop the Endless Job Hunt
                </Typography>

                {/* Solution Promise */}
                <Typography
                  variant="h5"
                  sx={{
                    mb: 4,
                    fontSize: { xs: '1.2rem', md: '1.5rem' },
                    fontWeight: 400,
                    opacity: isVisible ? 0.9 : 0,
                    lineHeight: 1.4,
                    transform: isVisible ? 'translateX(0)' : 'translateX(-80px)',
                    transition: 'all 1s ease-out 0.4s'
                  }}
                >
                  Stop searching for Talents or Jobs, let AI do it.
                </Typography>

                {/* Call to Action Buttons */}
                <Box 
                  sx={{ 
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 2,
                    mb: 4,
                    transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
                    opacity: isVisible ? 1 : 0,
                    transition: 'all 1s ease-out 0.6s'
                  }}
                >                  
                  <Button
                    component={Link}
                    to="/discover"
                    variant="outlined"
                    size="large"
                    startIcon={<Explore />}
                    endIcon={<ArrowForward />}
                    sx={{
                      py: { xs: 1.5, md: 2 },
                      px: { xs: 3, md: 4 },
                      fontSize: { xs: '1rem', md: '1.1rem' },
                      fontWeight: 600,
                      borderRadius: 3,
                      borderWidth: 2,
                      borderColor: 'rgba(16, 185, 129, 0.6)',
                      color: 'inherit',
                      textTransform: 'none',
                      minWidth: { xs: '100%', sm: 'auto' },
                      background: 'rgba(16, 185, 129, 0.1)',
                      backdropFilter: 'blur(10px)',
                      '&:hover': {
                        borderColor: '#10b981',
                        background: 'rgba(16, 185, 129, 0.2)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 15px rgba(16, 185, 129, 0.2)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Try it now.
                  </Button>
                </Box>
                
                {/* Value Proposition */}
                <Typography
                  variant="body1"
                  sx={{
                    mb: 4,
                    fontSize: { xs: '0.95rem', md: '1.1rem' },
                    lineHeight: 1.6,
                    opacity: isVisible ? 0.8 : 0,
                    transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
                    transition: 'all 1s ease-out 0.7s'
                  }}
                >
                  Join thousands who've ditched job boards for intelligent matching. 
                  Our AI learns your preferences and delivers curated opportunities 
                  directly to your inbox - no more scrolling, no more guessing.
                </Typography>

                {/* Features */}
                <Grid container spacing={2} sx={{ mb: 4 }}>
                  {features.map((feature, index) => (
                    <Grid item xs={12} sm={4} key={index}>
                      <Box 
                        sx={{ 
                          textAlign: 'center',
                          p: { xs: 1, md: 0 },
                          transform: isVisible ? 'scale(1) translateY(0)' : 'scale(0.8) translateY(40px)',
                          opacity: isVisible ? 1 : 0,
                          transition: `all 0.6s ease-out ${0.8 + index * 0.2}s`
                        }}
                      >
                        <Box sx={{ mb: 1 }}>
                          {feature.icon}
                        </Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                          {feature.title}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            opacity: 0.7,
                            fontSize: { xs: '0.7rem', md: '0.75rem' },
                            display: 'block',
                            lineHeight: 1.3
                          }}
                        >
                          {feature.description}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>

                {/* Trust Indicators */}
                <Box 
                  sx={{ 
                    display: 'flex', 
                    flexDirection: { xs: 'column', sm: 'row' },
                    flexWrap: 'wrap', 
                    gap: 1, 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    '& > *': {
                      transform: isVisible ? 'scale(1)' : 'scale(0)',
                      opacity: isVisible ? 1 : 0,
                      transition: 'all 0.5s ease-out 1.6s'
                    }
                  }}
                >
                  <Chip
                    icon={<TrendingUp />}
                    label="10,000+ Successful Matches"
                    size="small"
                    sx={{ 
                      backgroundColor: 'rgba(16, 185, 129, 0.1)',
                      fontSize: { xs: '0.7rem', md: '0.8125rem' }
                    }}
                  />
                  <Chip
                    icon={<Notifications />}
                    label="Real-time Alerts"
                    size="small"
                    sx={{ 
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      fontSize: { xs: '0.7rem', md: '0.8125rem' }
                    }}
                  />
                  <Chip
                    icon={<Work />}
                    label="All Industries"
                    size="small"
                    sx={{ 
                      backgroundColor: 'rgba(147, 51, 234, 0.1)',
                      fontSize: { xs: '0.7rem', md: '0.8125rem' }
                    }}
                  />
                </Box>
              </Box>
            </Fade>
          </Grid>

          {/* Visual Elements */}
          <Grid item xs={12} md={6}>
            <Box 
              sx={{ 
                pl: { md: 4 },
                mt: { xs: 4, md: 0 },
                transform: isVisible ? 'translateX(0)' : 'translateX(100px)',
                opacity: isVisible ? 1 : 0,
                transition: 'all 1s ease-out 0.5s'
              }}
            >
              {/* Success Stats */}
              <Card
                sx={{
                  mb: 3,
                  background: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  transform: isVisible ? 'rotateY(0deg)' : 'rotateY(-15deg)',
                  transformOrigin: 'left center',
                  transition: 'all 0.8s ease-out 0.8s'
                }}
              >
                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                  <Grid container spacing={3} textAlign="center">
                    <Grid item xs={4}>
                      <Typography 
                        variant="h4" 
                        sx={{ 
                          fontWeight: 700, 
                          color: 'primary.main',
                          fontSize: { xs: '1.8rem', md: '2.125rem' },
                          transform: isVisible ? 'scale(1)' : 'scale(0)',
                          transition: 'all 0.6s ease-out 1.2s'
                        }}
                      >
                        94%
                      </Typography>
                      <Typography 
                        variant="caption"
                        sx={{ fontSize: { xs: '0.65rem', md: '0.75rem' } }}
                      >
                        Match Success
                      </Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography 
                        variant="h4" 
                        sx={{ 
                          fontWeight: 700, 
                          color: 'success.main',
                          fontSize: { xs: '1.8rem', md: '2.125rem' },
                          transform: isVisible ? 'scale(1)' : 'scale(0)',
                          transition: 'all 0.6s ease-out 1.4s'
                        }}
                      >
                        3.2x
                      </Typography>
                      <Typography 
                        variant="caption"
                        sx={{ fontSize: { xs: '0.65rem', md: '0.75rem' } }}
                      >
                        Faster Hiring
                      </Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography 
                        variant="h4" 
                        sx={{ 
                          fontWeight: 700, 
                          color: 'warning.main',
                          fontSize: { xs: '1.8rem', md: '2.125rem' },
                          transform: isVisible ? 'scale(1)' : 'scale(0)',
                          transition: 'all 0.6s ease-out 1.6s'
                        }}
                      >
                        5min
                      </Typography>
                      <Typography 
                        variant="caption"
                        sx={{ fontSize: { xs: '0.65rem', md: '0.75rem' } }}
                      >
                        Setup Time
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Feature Highlight Cards */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Card
                  sx={{
                    background: 'rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
                    },
                    transform: isVisible ? 'translateY(0) rotateX(0deg)' : 'translateY(50px) rotateX(-10deg)',
                    opacity: isVisible ? 1 : 0,
                    transition: 'all 0.8s ease-out 1.2s'
                  }}
                >
                  <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Psychology sx={{ 
                        mr: 2, 
                        color: 'primary.main', 
                        fontSize: { xs: 28, md: 32 }
                      }} />
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 600,
                          fontSize: { xs: '1rem', md: '1.25rem' }
                        }}
                      >
                        Smart AI Matching
                      </Typography>
                    </Box>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        opacity: 0.9, 
                        lineHeight: 1.6,
                        fontSize: { xs: '0.8rem', md: '0.875rem' }
                      }}
                    >
                      Our advanced AI analyzes your skills, preferences, and career goals to find opportunities that truly match your aspirations.
                    </Typography>
                  </CardContent>
                </Card>

                <Card
                  sx={{
                    background: 'rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
                    },
                    transform: isVisible ? 'translateY(0) rotateX(0deg)' : 'translateY(70px) rotateX(-15deg)',
                    opacity: isVisible ? 1 : 0,
                    transition: 'all 0.8s ease-out 1.4s'
                  }}
                >
                  <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Notifications sx={{ 
                        mr: 2, 
                        color: 'success.main', 
                        fontSize: { xs: 28, md: 32 }
                      }} />
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 600,
                          fontSize: { xs: '1rem', md: '1.25rem' }
                        }}
                      >
                        Instant Notifications
                      </Typography>
                    </Box>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        opacity: 0.9, 
                        lineHeight: 1.6,
                        fontSize: { xs: '0.8rem', md: '0.875rem' }
                      }}
                    >
                      Never miss a perfect opportunity. Get real-time alerts delivered straight to your inbox when ideal matches become available.
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default AIJobMatcherSection;